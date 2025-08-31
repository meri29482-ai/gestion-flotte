const db = require("../models");
const Notification = db.Notification;
const Utilisateur = db.utilisateurs;

// ✅ Créer une notification
exports.creerNotification = async (req, res) => {
  try {
    const { utilisateur_id, recepteur_id, type = "INFO", titre, message } = req.body;

    if (!titre || !message || !recepteur_id) {
      return res.status(400).json({ message: "Champs requis manquants (titre, message, recepteur_id)." });
    }

    const notification = await Notification.create({
      utilisateur_id: utilisateur_id || null,
      recepteur_id,
      type,
      titre,
      message
    });

    return res.status(201).json(notification);
  } catch (error) {
    console.error("❌ Erreur création notification :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création." });
  }
};

// 📬 Récupérer les notifications reçues par un utilisateur
exports.getNotificationsPourRecepteur = async (req, res) => {
  try {
    const { recepteur_id } = req.params;

    const notifications = await Notification.findAll({
      where: { recepteur_id },
      include: [
        {
          model: Utilisateur,
          as: "auteur",
          attributes: ["id", "nom", "prenom", "role"]
        }
      ],
      order: [["date_envoi", "DESC"]]
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Erreur récupération notifications :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération." });
  }
};

// ✅ Marquer toutes les notifications comme lues
exports.marquerToutesCommeLues = async (req, res) => {
  try {
    const { recepteur_id } = req.params;

    const [count] = await Notification.update(
      { lu: true },
      { where: { recepteur_id } }
    );

    return res.status(200).json({ message: `${count} notification(s) marquée(s) comme lue(s).` });
  } catch (error) {
    console.error("❌ Erreur mise à jour notifications :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🗑️ Supprimer une notification
exports.supprimerNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Notification.destroy({ where: { id } });

    if (!result) {
      return res.status(404).json({ message: "Notification introuvable." });
    }

    return res.status(200).json({ message: "Notification supprimée avec succès." });
  } catch (error) {
    console.error("❌ Erreur suppression notification :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// PUT /api/notifications/lu/:id
exports.marquerUneNotificationCommeLu = async (req, res) => {
  try {
    const { id } = req.params;

    const [count] = await Notification.update(
      { lu: true },
      { where: { id } }
    );

    if (count === 0) {
      return res.status(404).json({ message: "Notification non trouvée." });
    }

    return res.status(200).json({ message: "Notification marquée comme lue." });
  } catch (error) {
    console.error("❌ Erreur mise à jour notification :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
