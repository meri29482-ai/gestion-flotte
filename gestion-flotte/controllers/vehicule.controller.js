const db = require("../models");
const Vehicule = db.vehicules;
const Document = db.documents;
const Mission = db.missions;
const Chauffeur = db.chauffeurs;   // ✅ Ajouter ceci
const Utilisateur = db.utilisateurs; // ✅ Ajouter ceci
const Demande = db.demandes;  
const ChecklistControle = db.checklists;

const { Op } = require("sequelize");


// 📁 Utilitaire pour créer un chemin de fichier
const buildFilePath = (folder, file) => (file ? `uploads/${folder}/${file.filename}` : null);

// 📌 Créer un véhicule
exports.createVehicule = async (req, res) => {
  try {
    const {
      immatriculation,
      marque,
      modele,
      type,
      etat = "DISPO",
      kilometrage,
      date_achat,
    } = req.body;

    const files = req.files;

    if (!immatriculation || !marque || !modele || !type) {
      return res.status(400).json({ message: "⚠️ Champs requis manquants." });
    }

    const photoUrl = buildFilePath("vehicules", files?.photo?.[0]);

    const vehicule = await Vehicule.create({
      immatriculation,
      marque,
      modele,
      type,
      etat,
      kilometrage,
      date_achat,
      photo_url: photoUrl,
    });

    const docTypes = ["assurance", "carte_grise", "controle_technique"];

    for (const type_document of docTypes) {
      const file = files?.[type_document]?.[0];
      if (file) {
        await Document.create({
          vehicule_id: vehicule.id,
          type_document,
          fichier_url: buildFilePath("documents", file),
          date_expiration: req.body[`${type_document}_expiration`] || null,
          statut: "valide",
          cree_le: new Date(),
          maj_le: new Date(),
        });
      }
    }

    res.status(201).json({ message: "✅ Véhicule créé avec succès", vehicule });
  } catch (error) {
    console.error("Erreur création véhicule :", error);
    res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};
exports.getVehiculeDetails = async (req, res) => {
  try {
    const id = req.params.id;

    // Vérification de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "ID de véhicule invalide" });
    }

    // 1. Récupération du véhicule
    const vehicule = await Vehicule.findByPk(id);
    if (!vehicule) {
      return res.status(404).json({ message: "Véhicule non trouvé" });
    }

    // 2. Récupération des documents
    const documents = await Document.findAll({
      where: { vehicule_id: id },
    });

    // 3. Récupération des missions
   const missions = await Mission.findAll({
      where: { vehicule_id: id },
      include: [
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

    // 4. Récupération des contrôles techniques
    const checklist_controles = await ChecklistControle.findAll({
      where: { vehicule_id: id },
      order: [["date_controle", "DESC"]],
    });

  

    // 6. Envoi de la réponse
    return res.status(200).json({
      vehicule,
      documents,
      missions,
      checklist_controles
    });

  } catch (error) {
    console.error("Erreur récupération détails véhicule :", error);
    return res.status(500).json({
      message: "❌ Erreur interne du serveur",
      error: error.message,
    });
  }
};



// 🔄 Mettre à jour un véhicule
exports.updateVehicule = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      immatriculation,
      marque,
      modele,
      type,
      etat,
      kilometrage,
      date_achat,
    } = req.body;
    const files = req.files;

    const vehicule = await Vehicule.findByPk(id);
    if (!vehicule) {
      return res.status(404).json({ message: "❌ Véhicule non trouvé" });
    }

    const newPhoto = files?.photo?.[0];
    const photoUrl = newPhoto ? buildFilePath("vehicules", newPhoto) : vehicule.photo_url;

    await vehicule.update({
      immatriculation,
      marque,
      modele,
      type,
      etat,
      kilometrage,
      date_achat,
      photo_url: photoUrl,
    });

    const docTypes = ["assurance", "carte_grise", "controle_technique"];

    for (const type_document of docTypes) {
      const file = files?.[type_document]?.[0];
      const expiration = req.body[`${type_document}_expiration`] || null;
      const fichier_url = file ? buildFilePath("documents", file) : null;

      if (fichier_url) {
        const existingDoc = await Document.findOne({
          where: { vehicule_id: id, type_document },
        });

        if (existingDoc) {
          await existingDoc.update({
            fichier_url,
            date_expiration: expiration,
            maj_le: new Date(),
          });
        } else {
          await Document.create({
            vehicule_id: id,
            type_document,
            fichier_url,
            date_expiration: expiration,
            statut: "valide",
            cree_le: new Date(),
            maj_le: new Date(),
          });
        }
      }
    }

    res.json({ message: "✅ Véhicule mis à jour avec succès", vehicule });
  } catch (error) {
    console.error("Erreur mise à jour véhicule :", error);
    res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// 📥 Obtenir tous les véhicules
exports.getAllVehicules = async (req, res) => {
  try {
    const vehicules = await Vehicule.findAll({
      include: [{ model: Document, as: "documents" }],
      order: [["id", "DESC"]],
    });

    if (!vehicules.length) {
      return res.status(404).json({ message: "Aucun véhicule trouvé." });
    }

    res.json(vehicules);
  } catch (error) {
    console.error("Erreur récupération véhicules :", error);
    res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// 📥 Obtenir un véhicule par ID
exports.getVehiculeById = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id, {
      include: [{ model: Document, as: "documents" }],
    });

    if (!vehicule) {
      return res.status(404).json({ message: "Véhicule non trouvé" });
    }

    res.json(vehicule);
  } catch (error) {
    console.error("Erreur récupération véhicule :", error);
    res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// 🗑 Supprimer un véhicule
exports.deleteVehicule = async (req, res) => {
  try {
    const id = req.params.id;
    const vehicule = await Vehicule.findByPk(id);

    if (!vehicule) {
      return res.status(404).json({ message: "Véhicule non trouvé" });
    }

    await Document.destroy({ where: { vehicule_id: id } });
    await vehicule.destroy();

    res.json({ message: "✅ Véhicule supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression véhicule :", error);
    res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};
