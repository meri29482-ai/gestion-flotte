// controllers/missions.controller.js
const db = require("../models");
const Mission = db.missions;
const Chauffeur = db.chauffeurs;
const Vehicule = db.vehicules;
const Demande = db.demandes;
const Utilisateur = db.utilisateurs;
const Checklist = db.checklists;
const Notification = db.Notification; 
const path = require("path");
const fs = require("fs");

exports.create = async (req, res) => {
  try {
    const { vehicule_id, chauffeur_id, demande_id, etat, Probleme } = req.body;

    if (!vehicule_id || !chauffeur_id || !demande_id) {
      return res.status(400).json({
        message: "Champs obligatoires manquants (vehicule_id, chauffeur_id, demande_id)"
      });
    }

    let missions = [];

    // 🔎 On récupère le chauffeur avec son utilisateur
    const chauffeur = await Chauffeur.findByPk(chauffeur_id, {
      include: [{ model: Utilisateur, as: "utilisateur" }]
    });

    if (!chauffeur || !chauffeur.utilisateur) {
      return res.status(404).json({ message: "Chauffeur ou utilisateur associé introuvable" });
    }

    const recepteurId = chauffeur.utilisateur.id; // ✅ id utilisateur lié

    // 🔎 On récupère la demande pour savoir le type de trajet
    const demande = await Demande.findByPk(demande_id);
    if (!demande) {
      return res.status(404).json({ message: "Demande introuvable" });
    }

    // 1️⃣ Cas : ALLER_SIMPLE → 1 mission (aller)
    if (demande.type_trajet === "ALLER_SIMPLE") {
      const mission = await Mission.create({
        vehicule_id,
        chauffeur_id,
        demande_id,
        etat: etat || "en attente",
        Probleme: Probleme || "non",
        type_mission: "aller-retour",
        date_depart:null,
        date_routour:  null
      });

      missions.push(mission);

      await Notification.create({
        type: "MISSION",
        titre: "Nouvelle mission assignée",
        message: `Vous avez reçu une mission (ALLER) liée à la demande #${mission.demande_id}.`,
        lu: 0,
        date_envoi: new Date(),
        utilisateur_id: req.user?.id || null,
        recepteur_id: recepteurId
      });
    }

    // 2️⃣ Cas : ALLER_RETOUR → 2 missions (aller + retour)
    else if (demande.type_trajet === "ALLER_RETOUR") {
      const missionAller = await Mission.create({
        vehicule_id,
        chauffeur_id,
        demande_id,
        etat: etat || "en attente",
        Probleme: Probleme || "non",
        type_mission: "aller",
        date_depart: null,
        date_routour: null
      });

      const missionRetour = await Mission.create({
        vehicule_id,
        chauffeur_id,
        demande_id,
        etat: "en attente",
        Probleme: "non",
        type_mission: "retour",
        date_depart: null,
        date_routour: null
      });

      missions.push(missionAller, missionRetour);

      await Notification.bulkCreate([
        {
          type: "MISSION",
          titre: "Nouvelle mission assignée",
          message: `Vous avez reçu une mission (ALLER) liée à la demande #${demande_id}.`,
          lu: 0,
          date_envoi: new Date(),
          utilisateur_id: req.user?.id || null,
          recepteur_id: recepteurId
        },
        {
          type: "MISSION",
          titre: "Nouvelle mission assignée",
          message: `Vous avez reçu une mission (RETOUR) liée à la demande #${demande_id}.`,
          lu: 0,
          date_envoi: new Date(),
          utilisateur_id: req.user?.id || null,
          recepteur_id: recepteurId
        }
      ]);
    }

    else {
      return res.status(400).json({
        message: "type_trajet invalide (valeurs possibles: ALLER_SIMPLE, ALLER_RETOUR)"
      });
    }

    res.status(201).json({
      message: "Mission(s) créée(s) et notification(s) envoyée(s) au chauffeur",
      missions
    });

  } catch (error) {
    console.error("❌ Erreur création mission:", error);
    res.status(500).json({ message: "Erreur de création de mission", error });
  }
};






// Obtenir toutes les missions (avec relations)
exports.getAllMissions = async (req, res) => {
  try {
    const missions = await Mission.findAll({
      include: [
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["id", "immatriculation", "marque" ,"modele"]
        },
        {
  model: Chauffeur,
  as: "chauffeur",
  attributes: ["id"], // ici on ne met que les champs de la table `chauffeurs` si elle ne contient pas `nom`/`prenom`/`matricule`
  include: [
    {
      model: Utilisateur,
      as: "utilisateur",
      attributes: ["nom", "prenom", "matricule"]
    }
  ]
},
        {
          model: Demande,
          as: "demande",
          attributes: ["id","n_ordre", "destination" ,"itineraire", "date_heure_debut" , "date_heure_fin","observation"]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(missions);
  } catch (error) {
    console.error("Erreur lors du chargement des missions :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Obtenir toutes les missions d’un chauffeur par son ID
exports.getMissionsByChauffeur = async (req, res) => {
  try {
    const chauffeurId = req.params.chauffeurId;

    const missions = await Mission.findAll({
      where: { chauffeur_id: chauffeurId },
      include: [
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["id", "immatriculation", "marque", "modele", "kilometrage"]
        },
        {
          model: Chauffeur,
          as: "chauffeur",
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom", "matricule"]
            }
          ]
        },
        {
          model: Demande,
          as: "demande",
          attributes: [
            "id",
            "n_ordre",
            "destination",
            "itineraire",
            "date_heure_debut",
            "date_heure_fin",
            "observation"
          ],
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom", "numero_telephone", "fonction"]
            }
          ]
        },
        {
          model: Checklist,
          as: "checklists",
          attributes: ["type_controle", "kilometrage"]
        }
      ],
      order: [["id", "DESC"]]
    });

    // Toujours travailler sur un tableau (évite ReferenceError)
    const missionsWithDiff = (missions || []).map(mission => {
      const checklists = mission.checklists || [];

      const avant = checklists.find(c => c.type_controle === "AVANT_MISSION");
      const apres = checklists.find(c => c.type_controle === "APRES_MISSION");

      const diffKm =
        avant?.kilometrage != null && apres?.kilometrage != null
          ? apres.kilometrage - avant.kilometrage
          : null;

      return {
        ...mission.toJSON(),
        diffKm
      };
    });

    res.status(200).json(missionsWithDiff);
  } catch (error) {
    console.error("Erreur lors de la récupération des missions du chauffeur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// Obtenir toutes les missions liées à un véhicule par son ID
exports.getMissionsByVehicule = async (req, res) => {
  try {
    const vehiculeId = req.params.vehiculeId;

    const missions = await Mission.findAll({
      where: { vehicule_id: vehiculeId },
      include: [
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["id", "immatriculation", "marque", "modele"]
        },
        {
          model: Chauffeur,
          as: "chauffeur",
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom", "matricule"]
            }
          ]
        },
        {
          model: Demande,
          as: "demande",
          attributes: ["id","n_ordre", "destination" ,"itineraire", "date_heure_debut" , "date_heure_fin","observation"]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(missions);
  } catch (error) {
    console.error("Erreur lors de la récupération des missions du véhicule :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Obtenir une mission par ID
exports.findOne = async (req, res) => {
  try {
    const mission = await Mission.findByPk(req.params.id, {
      include: [
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["id", "immatriculation", "marque", "modele", "kilometrage"]
        },
        {
          model: Chauffeur,
          as: "chauffeur",
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom", "matricule"]
            }
          ]
        },
        {
          model: Demande,
          as: "demande",
          attributes: [
            "id",
            "n_ordre",
            "destination",
            "itineraire",
            "date_heure_debut",
            "date_heure_fin",
            "observation"
          ],
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom", "numero_telephone", "fonction"]
            }
          ]
        }
      ]
    });
    if (!mission) return res.status(404).json({ message: "Mission non trouvée" });
    res.status(200).json(mission);
  } catch (error) {
    res.status(500).json({ message: "Erreur", error });
  }
};

// Mettre à jour une mission
exports.update = async (req, res) => {
  try {
    const [updated] = await Mission.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) return res.status(404).json({ message: "Mission non trouvée" });
    res.status(200).json({ message: "Mission mise à jour" });
  } catch (error) {
    res.status(500).json({ message: "Erreur de mise à jour", error });
  }
};

// Supprimer une mission
exports.delete = async (req, res) => {
  try {
    const deleted = await Mission.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Mission non trouvée" });
    res.status(200).json({ message: "Mission supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur de suppression", error });
  }
};
exports.getMissionsByDemandeur = async (req, res) => {
  try {
    const utilisateurId = req.params.utilisateurId;

    const missions = await Mission.findAll({
      include: [
        {
          model: Demande,
          as: "demande",
          where: { utilisateur_id: utilisateurId },
          attributes: ["id", "destination", "date_heure_debut", "date_heure_fin"]
        },
        {
          model: Chauffeur,
          as: "chauffeur",
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom"]
            }
          ]
        },
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["immatriculation", "marque", "modele"]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(missions);
  } catch (error) {
    console.error("Erreur lors de la récupération des missions par demandeur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



exports.signalerIncident = async (req, res) => {
  try {
    const {
      type,
      description,
      mission_id,
      intervention_demandee,
      intervention_description,
      mission_continue
    } = req.body;

    const photo = req.file ? req.file.filename : null;

    // 🔍 Vérifier mission + inclure Demande
    const mission = await db.missions.findByPk(mission_id, {
      include: [
        {
          model: db.demandes,
          as: "demande",
          attributes: ["n_ordre"]
        }
      ]
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission introuvable" });
    }

    const chauffeur_id = mission.chauffeur_id;

    // 🔍 Récupérer chauffeur + utilisateur lié
    const chauffeur = await db.chauffeurs.findByPk(chauffeur_id, {
      include: [
        {
          model: db.utilisateurs,
          as: "utilisateur",
          attributes: ["nom", "prenom"]
        }
      ]
    });

    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur introuvable" });
    }

    const chauffeurNom = chauffeur.utilisateur
      ? `${chauffeur.utilisateur.nom} ${chauffeur.utilisateur.prenom}`
      : `Chauffeur #${chauffeur_id}`;

    const numeroOrdre = mission.demande ? mission.demande.n_ordre : "N/A";

    // 🔴 Créer le signalement
    const newSignalement = await db.signalements.create({
      type,
      description,
      mission_id,
      chauffeur_id,
      intervention_demandee,
      intervention_description,
      mission_continue,
      photo
    });

    // ✅ Mettre à jour mission
    let updateData = { Probleme: "oui" };
    if (mission_continue === "non") {
      updateData.etat = "bloquer";
    }
    await db.missions.update(updateData, { where: { id: mission_id } });

    // 🔔 Récupérer tous les responsables parc et HSE
    const responsables = await db.utilisateurs.findAll({
      where: { role: ['RESPONSABLE_PARC', 'RESPONSABLE_HSE'] }
    });

    // 🔔 Créer les notifications pour chaque responsable
    const notifications = responsables.map(resp => ({
      titre: "🚨 Incident signalé",
      message: `Un incident de type "${type}" a été signalé par ${chauffeurNom} sur la mission #${numeroOrdre}.`,
      type: "ALERTE",
      mission_id: mission_id,
      utilisateur_id: req.user?.id || null,
      recepteur_id: resp.id,
      lu: 0,
      date_envoi: new Date()
    }));

    await db.notifications.bulkCreate(notifications);

    res.status(201).json({
      message: "Signalement enregistré" + (mission_continue === "non" ? " et mission bloquée" : ""),
      data: newSignalement
    });

  } catch (error) {
    console.error("Erreur signalement :", error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement du signalement", error });
  }
};


// ✅ Récupérer les missions actives (non terminées ou bloquées)
exports.getMissionsActives = async (req, res) => {
  try {
    const missions = await Mission.findAll({
      where: {
        etat: ['en attente', 'en cours', 'bloquer']
      },
      include: [
        {
          model: Chauffeur,
          as: "chauffeur",
          include: [{
            model: Utilisateur,
            as: "utilisateur",
            attributes: ["nom", "prenom"]
          }]
        },
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["marque", "modele", "immatriculation"]
        },
        {
          model: Demande,
          as: "demande",
          include: [{
            model: Utilisateur,
            as: "utilisateur",
            attributes: ["nom", "prenom", "numero_telephone"]
          }],
          attributes: ["destination", "date_heure_debut", "date_heure_fin"]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(missions);
  } catch (error) {
    console.error("Erreur récupération missions actives :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des missions actives." });
  }
};
// Accepter une mission
exports.accepterMission = async (req, res) => {
  try {
    const { id } = req.params;
    await Mission.update({ statut: 'acceptée' }, { where: { id } });
    res.json({ message: "Mission acceptée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refuser une mission
exports.annulerMission = async (req, res) => {
  try {
    const { id } = req.params;

    const mission = await Mission.findByPk(id);
    if (!mission) {
      return res.status(404).json({ code: 404, msg: "Mission non trouvée" });
    }

    // Met à jour la colonne correcte 'etat'
    await mission.update({ etat: 'annuler' });

    res.json({
      code: 200,
      msg: "Mission annulée avec succès",
      mission
    });
  } catch (error) {
    console.error("Erreur annulation mission:", error);
    res.status(500).json({ code: 500, msg: error.message });
  }
};

const PDFDocument = require("pdfkit");




exports.generateFeuilleRoute = async (req, res) => {
  try {
    const missionId = req.params.id;

    const mission = await Mission.findOne({
      where: { id: missionId },
      include: [
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["immatriculation"]
        },
        {
          model: Chauffeur,
          as: "chauffeur",
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom"]
            }
          ]
        },
        {
          model: Demande,
          as: "demande",
          attributes: ["destination", "date_heure_debut", "date_heure_fin"],
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom"]
            }
          ]
        }
      ]
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission non trouvée" });
    }

    // --- Création PDF en format A5 ---
    const doc = new PDFDocument({ size: "A5", margin: 40 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=feuille_route_${missionId}.pdf`
      );
      res.send(pdfData);
    });

    const chauffeur = mission.chauffeur.utilisateur;
    const vehicule = mission.vehicule;
    const demande = mission.demande;
    const demandeur = demande.utilisateur;

    // --- LOGO ---
    const logoPath = path.join(__dirname, "..", "assets", "logo-sonatrach.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 70 });
    }

    // --- EN-TÊTE ---
    doc.fontSize(9).font("Helvetica-Bold").text("Sonatrach", 130, 35);
    doc.fontSize(7).font("Helvetica").text("Direction Corporate Ressources Humaines", 130, 48);
    doc.text("Direction IAP", 130, 58);
    doc.text("Direction École de Boumerdès", 130, 68);
    doc.text("Département Moyens Généraux", 130, 78);
    doc.text("Service Transport.", 130, 88);

    doc.font("Helvetica-Oblique").text("Boumerdès, le ....................", 250, 88);

    // --- TITRE ---
   const pageWidth = doc.page.width;
const margin = 40;
const lineWidth = pageWidth - margin * 2;

let titleY = 130; // position verticale du bloc titre

// Ligne au-dessus du titre
doc.moveTo(margin, titleY)
   .lineTo(margin + lineWidth, titleY)
   .lineWidth(1)
   .strokeColor("#0161a5")
   .stroke();

// Titre centré
doc.fontSize(14)
   .font("Helvetica-Bold")
   .text("Feuille de Route", margin, titleY + 5, {
      align: "center",
      width: lineWidth
   });

// Ligne en dessous du titre
doc.moveTo(margin, titleY + 25)
   .lineTo(margin + lineWidth, titleY + 25)
   .lineWidth(1)
   .strokeColor("#0161a5")
   .stroke();

titleY += 40; // nouvelle position après le bloc titre

    // --- INFORMATIONS RÉPARTIES SUR TOUTE LA PAGE ---
    const infos = [
      ["Nom du chauffeur", `${chauffeur.nom} ${chauffeur.prenom}`],
      ["Type et matricule du véhicule", vehicule.immatriculation],
      ["Destination", demande.destination],
      ["Passager", `${demandeur.nom} ${demandeur.prenom}`],
      ["Date et heure de sortie", new Date(demande.date_heure_debut).toLocaleString("fr-FR")],
      ["Date et heure de retour", new Date(demande.date_heure_fin).toLocaleString("fr-FR")]
    ];

    const startY = titleY + 40;
    const endY = 350;
    const availableHeight = endY - startY;
    const rowSpacing = availableHeight / infos.length;

    let y = startY;
    const labelX = 40;
    const valueX = 180;

    infos.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").fontSize(9).text(label + " :", labelX, y);
      doc.font("Helvetica").fontSize(9).text(value || "....................", valueX, y);

      // Ligne grise sous chaque champ
      doc.moveTo(60, 200)
   .lineTo(300, 200)
   .lineWidth(0.5)
   .strokeColor("#EEEEEE") // gris ultra clair
   .stroke();

      y += rowSpacing;
    });

    // --- SIGNATURES AVEC POINTILLÉS ---
    y = endY + 40;
    doc.font("Helvetica-Bold").fontSize(9).text("Chef de service transport", labelX, y);
    doc.font("Helvetica-Bold").text("Chauffeur", valueX + 60, y);

    doc.font("Helvetica").text("Signature : " + ".".repeat(30), labelX, y + 18);
    doc.text("Signature : " + ".".repeat(30), valueX + 60, y + 18);

    // --- PIED DE PAGE collé en bas ---
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 60;

    // ligne décorative avant pied de page
    doc.moveTo(40, footerY - 10)
      .lineTo(350, footerY - 10)
      .lineWidth(0.5)
      .strokeColor("#0161a5")
      .stroke();

    doc.fontSize(7).fillColor("#000000bb").text(
      "Avenue 1er Novembre, Boumerdès 35000 - Algérie , Tél : 024 79 57 05   Fax : 024 79 57 05",
      0,
      footerY,
      { align: "center" }
    );
    doc.text("www.sonatrach.dz   iap@sonatrach.dz", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Erreur PDF :", error);
    res.status(500).json({
      message: "Erreur lors de la génération du PDF",
      error: error.message,
    });
  }
};




exports.updateMissionPosition = async (req, res) => {
  try {
    const { id } = req.params; // ID de la mission
    const { latitude, longitude } = req.body; // Coordonnées envoyées par le client

    // Vérification des paramètres
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude et longitude sont requises" });
    }

    // Récupération de la mission
    const mission = await Mission.findByPk(id);

    if (!mission) {
      return res.status(404).json({ message: "Mission introuvable" });
    }

    // Mise à jour de la position
    mission.latitude = latitude;
    mission.longitude = longitude;
    await mission.save();

    return res.status(200).json({
      message: "Position de la mission mise à jour avec succès",
      mission
    });

  } catch (error) {
    console.error("Erreur updateMissionPosition:", error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour de la position",
      error: error.message
    });
  }
};

exports.getMissionPosition = async (req, res) => {
  try {
    const missionId = req.params.id;

    const mission = await Mission.findByPk(missionId, {
      attributes: ['latitude', 'longitude']
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission introuvable." });
    }

    res.json({
      latitude: mission.latitude,
      longitude: mission.longitude
    });
  } catch (error) {
    console.error("Erreur getMissionPosition:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la position." });
  }
};

const { Op } = require("sequelize");

// Récupérer toutes les positions des missions en cours sauf celles d'un chauffeur donné
exports.getAllMissionsPositionsExceptMission = async (req, res) => {
   try {
    const missionId = req.params.id; // ID de la mission à exclure

    if (!missionId) {
      return res.status(400).json({ message: "L'ID de la mission est requis." });
    }

    // Récupération des missions en cours sauf celle avec l'ID donné
    const missions = await Mission.findAll({
      where: {
        id: { [Op.ne]: missionId }, 
        etat: 'en cours'
      },
       attributes: ["id", "latitude", "longitude"],
      include: [
        {
          model: Chauffeur,
          as: "chauffeur",   // alias défini dans ton association
          attributes: ["id"],
          include: [
            {
              model: Utilisateur,
              as: "utilisateur", // alias défini dans ton association
              attributes: ["nom", "prenom", "numero_telephone"]
            }
          ]
        },
      ]
    });

    if (!missions || missions.length === 0) {
      return res.status(404).json({ message: "Aucune mission en cours trouvée." });
    }

    return res.status(200).json({
      message: "Positions des missions en cours récupérées avec succès (sauf chauffeur connecté)",
      missions
    });

  } catch (error) {
    console.error("Erreur getAllMissionsPositionsExceptChauffeur:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des positions",
      error: error.message
    });
  }
};

exports.getAllMissionsPositions = async (req, res) => {
  try {
    const missions = await Mission.findAll({
      where: { 
        etat: { [Op.in]: ["en cours", "bloquer"] }  // accepte plusieurs états
      },
      attributes: ["id", "latitude", "longitude", "etat"],
      include: [
        {
          model: Chauffeur,
          as: "chauffeur",
          attributes: ["id"],
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["nom", "prenom", "numero_telephone"]
            }
          ]
        },
        {
          model: Demande,
          as: "demande",
          attributes: ["destination"]
        }
      ]
    });

    // ⚠️ Ne pas tester avec !missions (toujours vrai), mais avec length
    if (missions.length === 0) {
      return res.status(404).json({ message: "Aucune mission en cours trouvée." });
    }

    return res.status(200).json({
      message: "Positions des missions en cours récupérées avec succès",
      missions
    });

  } catch (error) {
    console.error("Erreur getAllMissionsPositions:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des missions",
      error: error.message
    });
  }
};