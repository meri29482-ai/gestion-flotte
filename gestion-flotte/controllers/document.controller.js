const db = require("../models");
const Document = db.documents;
const Chauffeur = db.chauffeurs;
const Vehicule = db.vehicules;
const Intervention = db.Intervention;
const Achat = db.Achat;
const Maintenance = db.maintenance;
const Piece = db.Piece;
const Utilisateur = db.utilisateurs;
const Notification = db.Notification;
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// ========================= UTILITAIRES =========================

async function notifierResponsables(titre, message) {
  try {
    const responsables = await Utilisateur.findAll({
      where: { role: { [Op.in]: ["RESPONSABLE_HSE", "RESPONSABLE_PARC"] } },
    });

    const notifs = responsables.map(r => ({
      type: "HSE",
      titre,
      message,
      lu: 0,
      date_envoi: new Date(),
      utilisateur_id: null,   // expéditeur
      recepteur_id: r.id              // destinataire
    }));

    if (notifs.length > 0) {
      await Notification.bulkCreate(notifs);
      console.log("✅ Notifications envoyées:", notifs.length);
    } else {
      console.warn("⚠️ Aucun responsable trouvé pour notifier");
    }
  } catch (err) {
    console.error("❌ Erreur lors de la notification des responsables :", err);
  }
}


function fmtDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
}

function money(val) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
}

// ========================= VÉRIFICATION EXPIRATIONS =========================
async function verifierExpirationsJob() {
  console.log("⏳ Vérification expirations...");
  const today = new Date();

  try {
    // Vérification des documents
    const documents = await Document.findAll();
    for (let doc of documents) {
      if (doc.date_expiration && new Date(doc.date_expiration) <= today && doc.statut !== "expiré") {
        await doc.update({ statut: "expiré" });
        await notifierResponsables(
          "Document expiré",
          `Le document ${doc.type_document} est expiré (ID: ${doc.id}).`
        );

        // Si le document est lié à un véhicule ou chauffeur, mettre hors service
        if (doc.vehicule_id) {
          const v = await Vehicule.findByPk(doc.vehicule_id);
          if (v && v.etat !== "HORS_SERVICE") await v.update({ etat: "HORS_SERVICE" });
        }
        if (doc.chauffeur_id) {
          const c = await Chauffeur.findByPk(doc.chauffeur_id);
          if (c && c.etat !== "hors service") await c.update({ etat: "hors service" });
        }
      }
    }

    // Vérification des véhicules
    const vehicules = await Vehicule.findAll();
    for (let v of vehicules) {
      let horsService = false;

      if (v.assurance_expiration && new Date(v.assurance_expiration) <= today) {
        await notifierResponsables(
          "Assurance expirée",
          `Le véhicule ${v.immatriculation} a une assurance expirée.`
        );
        horsService = true;
      }

      if (v.controle_technique_expiration && new Date(v.controle_technique_expiration) <= today) {
        await notifierResponsables(
          "Contrôle technique expiré",
          `Le véhicule ${v.immatriculation} a un contrôle technique expiré.`
        );
        horsService = true;
      }

      if (horsService && v.etat !== "HORS_SERVICE") {
        await v.update({ etat: "HORS_SERVICE" });
      }
    }

    // Vérification des chauffeurs
    const chauffeurs = await Chauffeur.findAll({
      include: { model: Utilisateur, as: "utilisateur" } // alias exact
    });

    for (let c of chauffeurs) {
      let horsService = false;
      const nomPrenom = c.utilisateur ? `${c.utilisateur.nom} ${c.utilisateur.prenom}` : `${c.nom} ${c.prenom}`;

      if (c.permis_expiration && new Date(c.permis_expiration) <= today) {
        await notifierResponsables("Permis expiré", `Le permis du chauffeur ${nomPrenom} est expiré.`);
        horsService = true;
      }

      if (c.certificat_medical_expiration && new Date(c.certificat_medical_expiration) <= today) {
        await notifierResponsables("Certificat médical expiré", `Le certificat médical du chauffeur ${nomPrenom} est expiré.`);
        horsService = true;
      }

      if (c.certificat_capacite_expiration && new Date(c.certificat_capacite_expiration) <= today) {
        await notifierResponsables("Certificat de capacité expiré", `Le certificat de capacité du chauffeur ${nomPrenom} est expiré.`);
        horsService = true;
      }

      if (horsService && c.etat !== "hors service") {
        await c.update({ etat: "hors service" });
      }
    }

    console.log("✅ Vérification terminée.");
  } catch (err) {
    console.error("❌ Erreur vérification :", err);
  }
}




async function verifierExpirations(req, res) {
  try {
    await verifierExpirationsJob();
    res.status(200).json({ success: true, message: "Vérification exécutée." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ========================= EXPORT INTERVENTION EN PDF =========================
async function exportIntervention  (req, res)  {
  try {
    const { id } = req.params;

    const intervention = await Intervention.findByPk(id, {
      include: [
        { model: Vehicule, as: "vehicule" },
        { model: Achat, as: "achat", include: [{ model: Piece, as: "piece" }] },
        { model: Maintenance, as: "maintenance" }
      ]
    });

    if (!intervention) return res.status(404).json({ message: "Intervention non trouvée." });

    const type = (intervention.type_demande || "").toLowerCase();
    const now = new Date();
    const fileName = `${type || "intervention"}_${intervention.id}_${now.getTime()}.pdf`;

    const dir = path.join(__dirname, "..", "..", "uploads", "interventions", String(intervention.id));
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, fileName);
    const publicUrl = `/uploads/interventions/${intervention.id}/${fileName}`;

    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    const fileStream = fs.createWriteStream(filePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(fileStream);
    doc.pipe(res);

    // Styles
    const primaryColor = "#FF6600";
    const secondaryColor = "#333333";
    const lightColor = "#666666";
    const lineHeight = 18;
    const tableLineHeight = 20;

    // Logo à gauche
    const logoPath = path.join(__dirname, "..", "assetss", "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 20, { width: 80 });
    }

    // En-tête à droite du logo
    doc.fontSize(10).fillColor(secondaryColor);
    doc.text("Direction Corporate Ressources Humaines", 130, 25);
    doc.text("Direction IAP", 130, 40);
    doc.text("Direction École de Boumerdès", 130, 55);

    doc.moveDown(3);

    // Numéro et date
    doc.font("Helvetica-Bold").fillColor(primaryColor).fontSize(12);
    const numero = intervention.numero || "-";
    const dateCreation = fmtDate(intervention.created_at);
    doc.text(`N°: ${numero}          Boumerdès, le ${dateCreation}`, { align: "center" });

    // Titre principal dynamique
    const titre = type === "maintenance" ? "DEMANDE DE MAINTENANCE" :
                  type === "achat" ? "DEMANDE D'ACHAT" : "INTERVENTION";
    doc.moveDown(1);
    doc.fontSize(16).fillColor(primaryColor).text(titre, { align: "center" });

    doc.moveDown(1.5);

    // Tableau signatures amélioré avec 2 lignes séparées
    const sigCols = ["Service Demandeur", "Visa Département\nMoyens Généraux", "Date & Visa", "Visa Budget"];
    const sigWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / sigCols.length;
    let sigX = doc.page.margins.left;
    const sigY = doc.y;

    // Première ligne - Titres
    doc.font("Helvetica-Bold").fillColor(secondaryColor).fontSize(9);
    sigCols.forEach(col => {
      doc.rect(sigX, sigY, sigWidth, 20).stroke();
      const lineCount = col.includes('\n') ? 2 : 1;
      const textHeight = lineCount * 10;
      const textY = sigY + (20 - textHeight) / 2;
      doc.text(col, sigX + 5, textY, { 
        width: sigWidth - 10, 
        align: "center",
        lineGap: 2 
      });
      sigX += sigWidth;
    });

    // Deuxième ligne - Espaces signatures (cachés)
    sigX = doc.page.margins.left;
    const sigY2 = sigY + 20;
    sigCols.forEach(() => {
      doc.rect(sigX, sigY2, sigWidth, 30).stroke();
      sigX += sigWidth;
    });

    doc.y = sigY2 + 30 + 10; // Espace après le tableau

    // Informations principales
    const infoX1 = doc.page.margins.left;
    const infoX2 = infoX1 + 150;
    let yPos = doc.y;

    const infoData = [
      ["Type de demande", intervention.type_demande || "-"],
      ["Priorité", intervention.priorite || "-"],
      ["Date création", fmtDate(intervention.created_at)],
      intervention.vehicule ? ["Véhicule", `${intervention.vehicule.marque || "-"} ${intervention.vehicule.modele || "-"}${intervention.vehicule.immatriculation ? ` (${intervention.vehicule.immatriculation})` : ""}`] : null
    ].filter(Boolean);

    doc.fontSize(10);
    infoData.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").fillColor(secondaryColor).text(label + ":", infoX1, yPos);
      doc.font("Helvetica").fillColor(lightColor).text(value, infoX2, yPos);
      yPos += lineHeight;
    });
    doc.y = yPos + 10;

    // Bloc Achat avec tableau moderne
    if (type === "achat" && intervention.achat) {
      const achat = intervention.achat;
      doc.fillColor(primaryColor).font("Helvetica-Bold").text("INFORMATIONS ACHAT");
      doc.moveDown(0.5);

      const achatData = [
        ["Fournisseur", achat.fournisseur || "-"],
        ["Délai", achat.delai ? fmtDate(achat.delai) : "-"],
        ["Description", achat.description || "-"]
      ];

      let yAchat = doc.y;
      achatData.forEach(([label, value]) => {
        doc.font("Helvetica-Bold").fillColor(secondaryColor).text(label + ":", infoX1, yAchat);
        doc.font("Helvetica").fillColor(lightColor).text(value, infoX2, yAchat);
        yAchat += lineHeight;
      });
      doc.y = yAchat + 15;

      // Tableau pièces modernisé
      const pieces = achat.pieces || [];
      if (pieces.length) {
        doc.font("Helvetica-Bold").fillColor(secondaryColor).text("PIÈCES DÉTACHÉES:");
        doc.moveDown(0.2);

        const tableX = doc.page.margins.left;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const cols = [200, 60, 80, 80];
        const headers = ["Désignation", "Qté", "Prix U.", "Total"];

        // En-tête du tableau
        let x = tableX;
        doc.font("Helvetica-Bold").fontSize(9).fillColor("white");
        headers.forEach((h, i) => {
          doc.rect(x, doc.y, cols[i], tableLineHeight).fillAndStroke(primaryColor, primaryColor);
          doc.text(h, x + 10, doc.y + 5, { 
            width: cols[i] - 20, 
            align: i > 0 ? "right" : "left" 
          });
          x += cols[i];
        });
        doc.y += tableLineHeight;

        // Lignes du tableau
        doc.font("Helvetica").fillColor(secondaryColor);
        let totalGlobal = 0;
        pieces.forEach((p, idx) => {
          const total = Number(p.prix_unitaire || 0) * Number(p.quantite || 0);
          totalGlobal += total;
          
          x = tableX;
          const values = [
            p.nom_piece || "-", 
            p.quantite.toString(), 
            money(p.prix_unitaire), 
            money(total)
          ];

          // Alternance de couleurs de fond
          const bgColor = idx % 2 === 0 ? "#F8F8F8" : "white";
          doc.fillColor(bgColor);

          values.forEach((val, i) => {
            doc.rect(x, doc.y, cols[i], tableLineHeight).fillAndStroke(bgColor, "#DDD");
            doc.fillColor(secondaryColor);
            doc.text(val, x + 10, doc.y + 5, { 
              width: cols[i] - 20, 
              align: i > 0 ? "right" : "left" 
            });
            x += cols[i];
          });
          doc.y += tableLineHeight;
        });

        // Ligne de total
        doc.fillColor("#F0F0F0");
        doc.rect(tableX, doc.y, cols[0] + cols[1], tableLineHeight).fillAndStroke("#F0F0F0", "#DDD");
        doc.rect(tableX + cols[0] + cols[1], doc.y, cols[2], tableLineHeight).fillAndStroke("#F0F0F0", "#DDD");
        doc.rect(tableX + cols[0] + cols[1] + cols[2], doc.y, cols[3], tableLineHeight).fillAndStroke("#F0F0F0", "#DDD");
        
        doc.font("Helvetica-Bold");
        doc.text("TOTAL:", tableX + cols[0] + 10, doc.y + 5, { width: cols[1] - 20, align: "right" });
        doc.text(money(totalGlobal), tableX + cols[0] + cols[1] + cols[2] + 10, doc.y + 5, { width: cols[3] - 20, align: "right" });
        
        doc.y += tableLineHeight + 15;
      }
    }

    // Bloc Maintenance
    if (type === "maintenance" && intervention.maintenance) {
      const maint = intervention.maintenance;
      doc.fillColor(primaryColor).font("Helvetica-Bold").text("INFORMATIONS MAINTENANCE");
      doc.moveDown(0.5);

      const maintData = [
        ["Type", maint.type_principal || "-"],
        ["Catégorie", maint.categorie || "-"],
        ["Durée", maint.duree != null ? `${maint.duree} h` : "-"],
        ["Observation", maint.observation || "-"]
      ];

      let yMaint = doc.y;
      maintData.forEach(([label, value]) => {
        doc.font("Helvetica-Bold").fillColor(secondaryColor).text(label + ":", infoX1, yMaint);
        doc.font("Helvetica").fillColor(lightColor).text(value, infoX2, yMaint);
        yMaint += lineHeight;
      });
      doc.y = yMaint + 15;
    }

    // Validation Directeur EVM
    doc.moveDown(2);
    const evmCols = ["Validation Directeur EVM", "Date", "Visa"];
    const evmWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / evmCols.length;
    let evmX = doc.page.margins.left;
    const evmY = doc.y;

    // Première ligne - Titres
    doc.fontSize(9).fillColor(secondaryColor);
    evmCols.forEach(col => {
      doc.rect(evmX, evmY, evmWidth, 20).stroke();
      doc.font("Helvetica-Bold").text(col, evmX + 5, evmY + 5, { width: evmWidth - 10, align: "center" });
      evmX += evmWidth;
    });

    // Deuxième ligne - Espaces signatures (cachés)
    evmX = doc.page.margins.left;
    const evmY2 = evmY + 20;
    evmCols.forEach(() => {
      doc.rect(evmX, evmY2, evmWidth, 30).stroke();
      evmX += evmWidth;
    });

    doc.end();

    fileStream.on("finish", async () => {
      if (typeof intervention.update === "function" && "fichier_pdf" in Intervention.rawAttributes) {
        await intervention.update({ fichier_pdf: publicUrl });
      }
    });

  } catch (err) {
    console.error("Erreur génération PDF:", err);
    res.status(500).json({ message: "Erreur lors de la génération du PDF", error: err.message });
  }
};

// ========================= CRUD DOCUMENT =========================
async function createDocument(req, res) {
  try {
    const { vehicule_id, chauffeur_id, type_document, date_creation, date_expiration, statut } = req.body;
    let fichier_url = null;

    if (req.file) {
      fichier_url = `/uploads/documents/${req.file.filename}`;
    }

    const document = await Document.create({
      vehicule_id,
      chauffeur_id,
      type_document,
      fichier_url,
      date_creation,
      date_expiration,
      statut,
    });

    res.status(201).json(document);
  } catch (err) {
    console.error("Erreur création document:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du document." });
  }
}

async function getAllDocuments(req, res) {
  try {
    const documents = await Document.findAll({
      include: [{ model: Chauffeur, as: "chauffeur" }, { model: Vehicule, as: "vehicule" }],
      order: [["maj_le", "DESC"]],
    });
    res.json(documents);
  } catch (err) {
    console.error("Erreur récupération documents:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des documents." });
  }
}

async function getDocumentById(req, res) {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{ model: Chauffeur, as: "chauffeur" }, { model: Vehicule, as: "vehicule" }],
    });

    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }

    res.json(document);
  } catch (err) {
    console.error("Erreur récupération document par ID:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function updateDocument(req, res) {
  try {
    const id = req.params.id;
    const document = await Document.findByPk(id);
    if (!document) return res.status(404).json({ message: "Document non trouvé." });

    const { vehicule_id, chauffeur_id, type_document, date_expiration, statut } = req.body;
    let fichier_url = document.fichier_url;

    if (req.file) {
      if (fichier_url) {
        const oldPath = path.join(__dirname, "..", "..", fichier_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      fichier_url = `/uploads/documents/${req.file.filename}`;
    }

    await document.update({ vehicule_id, chauffeur_id, type_document, fichier_url, date_expiration, statut });
    res.json(document);
  } catch (err) {
    console.error("Erreur mise à jour document:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function deleteDocument(req, res) {
  try {
    const id = req.params.id;
    const document = await Document.findByPk(id);
    if (!document) return res.status(404).json({ message: "Document non trouvé." });

    if (document.fichier_url) {
      const filePath = path.join(__dirname, "..", "..", document.fichier_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await document.destroy();
    res.json({ message: "Document supprimé avec succès." });
  } catch (err) {
    console.error("Erreur suppression document:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function createDocumentFromIntervention(req, res) {
  try {
    const { intervention_id, type } = req.body;
    if (!intervention_id || !type) {
      return res.status(400).json({ message: "Paramètres manquants : intervention_id ou type" });
    }

    const intervention = await Intervention.findByPk(intervention_id, { include: [{ model: Vehicule, as: "vehicule" }] });
    if (!intervention) return res.status(404).json({ message: "Intervention non trouvée" });

    const type_document = type === "achat" ? "demande_achat" : "demande_maintenance";
    const fichier_url = `/uploads/documents/${type_document}_${intervention.id}.pdf`;

    const document = await Document.create({
      intervention_id: intervention.id,
      vehicule_id: intervention.vehicule_id,
      chauffeur_id: null,
      type_document,
      fichier_url,
      date_expiration: null,
      statut: "valide",
    });

    res.status(201).json(document);
  } catch (err) {
    console.error("Erreur création document depuis intervention:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

// ========================= EXPORT DES FONCTIONS =========================
module.exports = {
  verifierExpirations,
  verifierExpirationsJob,
  exportIntervention,
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  createDocumentFromIntervention,
};


