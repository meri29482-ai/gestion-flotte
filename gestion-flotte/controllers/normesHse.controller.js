// controllers/normesHse.controller.js
const db = require("../models");
const NormeHse = db.NormeHse;
const Utilisateur = db.utilisateurs;
const Notification = db.Notification;
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

// ✅ Fonction utilitaire pour notifier les responsables HSE
async function notifierResponsables(message, titre, utilisateurId = null) {
  try {
    // récupérer tous les responsables HSE
    const responsables = await Utilisateur.findAll({
      where: { role: "RESPONSABLE_PARC" } // ⚠️ corrige ici si c’est "RESPONSABLE_PARC"
    });

    // créer une notif pour chaque responsable
    const notifs = responsables.map(r => ({
      type: "HSE",
      titre,
      message,
      lu: 0,
      date_envoi: new Date(),
      utilisateur_id: utilisateurId, // celui qui a créé/modifié
      recepteur_id: r.id
    }));

    if (notifs.length > 0) {
      await Notification.bulkCreate(notifs);
      console.log("✅ Notifications envoyées aux responsables HSE :", notifs.length);
    } else {
      console.warn("⚠️ Aucun responsable HSE trouvé pour notifier");
    }
  } catch (err) {
    console.error("❌ Erreur lors de la notification des responsables HSE :", err);
  }
}

// ✅ Créer une norme HSE
exports.create = async (req, res) => {
  try {
    const { titre, version, type, description, date_fichier, statut, lien_externe } = req.body;
    const fichier = req.file ? req.file.filename : null;

    if (!titre || !fichier) {
      return res.status(400).json({ message: "Le titre et le fichier sont obligatoires." });
    }

    const norme = await NormeHse.create({
      titre,
      fichier,
      version: version || "1.0",
      type: type || "Autre",
      description,
      date_fichier,
      statut: statut || "Actif",
      lien_externe
    });

    // 🔔 notifier les responsables HSE
    await notifierResponsables(
      `Une nouvelle norme HSE "${titre}" a été ajoutée.`,
      "Nouvelle norme HSE",
      req.user ? req.user.id : null
    );

    res.status(201).json(norme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la norme HSE.", error });
  }
};

// ✅ Mettre à jour une norme
exports.update = async (req, res) => {
  try {
    const norme = await NormeHse.findByPk(req.params.id);
    if (!norme) return res.status(404).json({ message: "Norme HSE non trouvée." });

    if (req.file && norme.fichier) {
      const oldPath = path.join("uploads", norme.fichier);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const fichier = req.file ? req.file.filename : norme.fichier;
    const { titre, version, type, description, date_fichier, statut, lien_externe } = req.body;

    await norme.update({
      titre: titre || norme.titre,
      fichier,
      version: version || norme.version,
      type: type || norme.type,
      description: description || norme.description,
      date_fichier: date_fichier || norme.date_fichier,
      statut: statut || norme.statut,
      lien_externe: lien_externe || norme.lien_externe
    });

    // 🔔 notifier les responsables HSE
    await notifierResponsables(
      `La norme HSE "${norme.titre}" a été mise à jour.`,
      "Mise à jour norme HSE",
      req.user ? req.user.id : null
    );

    res.json(norme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la norme HSE." });
  }
};

// ✅ Récupérer toutes les normes
exports.findAll = async (req, res) => {
  try {
    const normes = await NormeHse.findAll({ order: [["id", "DESC"]] });
    res.json(normes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des normes HSE." });
  }
};

// ✅ Récupérer une norme par ID
exports.findOne = async (req, res) => {
  try {
    const norme = await NormeHse.findByPk(req.params.id);
    if (!norme) return res.status(404).json({ message: "Norme HSE non trouvée." });
    res.json(norme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la norme HSE." });
  }
};

// ✅ Supprimer une norme
exports.delete = async (req, res) => {
  try {
    const norme = await NormeHse.findByPk(req.params.id);
    if (!norme) return res.status(404).json({ message: "Norme HSE non trouvée." });

    if (norme.fichier) {
      const filePath = path.join("uploads", norme.fichier);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await norme.destroy();
    res.json({ message: "Norme HSE supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la norme HSE." });
  }
};
