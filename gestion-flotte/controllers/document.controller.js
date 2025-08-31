const db = require("../models");
const Document = db.documents;
const Chauffeur = db.chauffeurs;
const Vehicule = db.vehicules;
const path = require("path");
const fs = require("fs");

// ➤ Créer un document (avec upload fichier)
exports.createDocument = async (req, res) => {
  try {
    const {
      vehicule_id,
      chauffeur_id,
      type_document,
      date_expiration
    } = req.body;

    let fichier_url = null;

    // Si un fichier est présent (via multer)
    if (req.file) {
      fichier_url = `/uploads/documents/${req.file.filename}`;
    }

    const document = await Document.create({
      vehicule_id,
      chauffeur_id,
      type_document,
      fichier_url,
      date_expiration
    });

    res.status(201).json(document);
  } catch (err) {
    console.error("Erreur création document:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du document." });
  }
};

// ➤ Obtenir tous les documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [
        { model: Chauffeur, as: "chauffeur" },
        { model: Vehicule, as: "vehicule" }
      ],
      order: [['maj_le', 'DESC']]
    });
    res.json(documents);
  } catch (err) {
    console.error("Erreur récupération documents:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des documents." });
  }
};

// ➤ Obtenir un document par ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: Chauffeur, as: "chauffeur" },
        { model: Vehicule, as: "vehicule" }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }

    res.json(document);
  } catch (err) {
    console.error("Erreur récupération document par ID:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ➤ Mettre à jour un document (avec support de nouveau fichier)
exports.updateDocument = async (req, res) => {
  try {
    const id = req.params.id;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }

    const {
      vehicule_id,
      chauffeur_id,
      type_document,
      date_expiration,
      statut
    } = req.body;

    let fichier_url = document.fichier_url;

    // Nouveau fichier uploadé
    if (req.file) {
      // Supprimer l'ancien fichier s'il existe
      if (fichier_url) {
        const oldPath = path.join(__dirname, "..", "..", fichier_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      fichier_url = `/uploads/documents/${req.file.filename}`;
    }

    await document.update({
      vehicule_id,
      chauffeur_id,
      type_document,
      fichier_url,
      date_expiration,
      statut
    });

    res.json(document);
  } catch (err) {
    console.error("Erreur mise à jour document:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ➤ Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: "Document non trouvé." });
    }

    // Supprimer le fichier associé si présent
    if (document.fichier_url) {
      const filePath = path.join(__dirname, "..", "..", document.fichier_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await document.destroy();
    res.json({ message: "Document supprimé avec succès." });
  } catch (err) {
    console.error("Erreur suppression document:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
