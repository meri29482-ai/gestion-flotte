const { chauffeurs, utilisateurs, documents} = require("../models");
const path = require("path");
const fs = require("fs");


// ➤ Créer un nouveau chauffeur avec ses documents
exports.createChauffeur = async (req, res) => {
  try {
    // 🚨 S'assurer que utilisateur_id est bien présent dans req.body
    const chauffeur = await chauffeurs.create({
      ...req.body,
      utilisateur_id: req.body.utilisateur_id || null
    });

    const files = req.files;
    const docTypes = {
      permis_conduire: "Permis de conduire",
      certificat_medical: "Certificat médical",
      certificat_capacite: "Certificat de capacité"
    };

    for (const key in docTypes) {
      if (files && files[key]) {
        const fichier = files[key][0];
        await documents.create({
          chauffeur_id: chauffeur.id,
          type_document: docTypes[key],
          fichier_url: `/uploads/documents/${fichier.filename}`,
          date_expiration: req.body[`${key}_expiration`] || null,
          statut: "valide"
        });
      }
    }

    res.status(201).json({ message: "Chauffeur et documents créés avec succès", chauffeur });
  } catch (error) {
    console.error("Erreur création chauffeur :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du chauffeur." });
  }
};

// ➤ Récupérer tous les chauffeurs
exports.getAllChauffeurs = async (req, res) => {
  try {
    const allChauffeurs = await chauffeurs.findAll({
      include: [
        {
          model: utilisateurs,
          as: "utilisateur",
          attributes: ["nom", "prenom", "matricule", "photo", "email", "numero_telephone"]
        },
        {
          model: documents,
          as: "documents", // 👈 Correspond à l'alias défini dans ton modèle
          attributes: ["type_document", "fichier_url", "date_expiration","statut"]
        }
      ]
    });

    res.status(200).json(allChauffeurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ➤ Récupérer un chauffeur par ID avec ses documents
exports.getChauffeurById = async (req, res) => {
  try {
    const chauffeur = await chauffeurs.findByPk(req.params.id, {
      include: [
        {
          model: utilisateurs,
          as: "utilisateur",
          attributes: ["nom", "prenom", "matricule", "photo", "email", "numero_telephone"]
        },
        {
          model: documents,
          as: "documents",
          where: { chauffeur_id: req.params.id },
          required: false
        }
      ]
    });

    if (!chauffeur) {
      return res.status(404).json({ error: "Chauffeur non trouvé" });
    }

    res.status(200).json(chauffeur);
  } catch (error) {
    console.error("Erreur récupération chauffeur avec documents:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Récupérer un chauffeur par utilisateur_id
exports.getByUtilisateurId = async (req, res) => {
  try {
    const { id } = req.params;

    const chauffeur = await chauffeurs.findOne({
      where: { utilisateur_id: id },
      include: [
        {
          model: utilisateurs,
          as: "utilisateur",
          attributes: ["nom", "prenom", "matricule", "photo", "email", "numero_telephone", "fonction", "etat", "action"],
        },
        {
          model: documents,
          as: "documents",
          required: false,
        },
      ],
    });

    if (!chauffeur) {
      return res.status(404).json({ message: "Aucun chauffeur trouvé pour cet utilisateur." });
    }

    res.status(200).json(chauffeur);
  } catch (error) {
    console.error("Erreur récupération chauffeur avec utilisateur_id:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Mettre à jour un chauffeur et ses documents
exports.updateChauffeur = async (req, res) => {
  try {
    const id = req.params.id;
    const chauffeur = await chauffeurs.findByPk(id);
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur non trouvé." });
    }

    await chauffeur.update({
      ...req.body,
      utilisateur_id: req.body.utilisateur_id || chauffeur.utilisateur_id
    });

    const files = req.files;
    const docTypes = {
      permis_conduire: "Permis de conduire",
      certificat_medical: "Certificat médical",
      certificat_capacite: "Certificat de capacité"
    };

    for (const key in docTypes) {
      if (files && files[key]) {
        const fichier = files[key][0];
        const type_document = docTypes[key];
        const fichier_url = `/uploads/documents/${fichier.filename}`;

        const existingDoc = await documents.findOne({
          where: {
            chauffeur_id: chauffeur.id,
            type_document
          }
        });

        if (existingDoc && existingDoc.fichier_url) {
          const oldPath = path.join(__dirname, "..", "..", existingDoc.fichier_url);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        if (existingDoc) {
          await existingDoc.update({
            fichier_url,
            date_expiration: req.body[`${key}_expiration`] || null,
            statut: "valide"
          });
        } else {
          await documents.create({
            chauffeur_id: chauffeur.id,
            type_document,
            fichier_url,
            date_expiration: req.body[`${key}_expiration`] || null,
            statut: "valide"
          });
        }
      }
    }

    res.status(200).json({ message: "Chauffeur mis à jour avec documents", chauffeur });
  } catch (error) {
    console.error("Erreur mise à jour chauffeur :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du chauffeur." });
  }
};

// ➤ Supprimer un chauffeur
exports.deleteChauffeur = async (req, res) => {
  try {
    const deleted = await chauffeurs.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
