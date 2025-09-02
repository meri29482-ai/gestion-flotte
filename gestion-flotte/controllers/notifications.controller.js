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

// Exemple d'action démarrer mission
exports.demarrerMission = async (req, res) => {
  try {
    const { missionId, utilisateurId } = req.params;

    // Logique démarrer mission (exemple)
    const mission = await db.missions.findByPk(missionId);
    if (!mission) return res.status(404).json({ message: "Mission introuvable." });

    mission.status = "en cours";
    await mission.save();

    // Créer notification pour le chauffeur de la mission
    const recepteur_id = mission.chauffeur_id; // récupère id chauffeur lié
    const titre = "Mission démarrée";
    const message = `La mission ${mission.nom} a été démarrée.`;

    await envoyerNotification({
      utilisateur_id: utilisateurId, // qui démarre la mission
      recepteur_id,
      titre,
      message,
      type: "INFO",
    });

    res.json({ message: "Mission démarrée et notification envoyée." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Exemple d'action changer véhicule
exports.changerVehicule = async (req, res) => {
  try {
    const { missionId, nouveauVehiculeId, utilisateurId } = req.body;

    const mission = await db.missions.findByPk(missionId);
    if (!mission) return res.status(404).json({ message: "Mission introuvable." });

    mission.vehicule_id = nouveauVehiculeId;
    await mission.save();

    const recepteur_id = mission.chauffeur_id;
    const titre = "Changement de véhicule";
    const message = `Le véhicule de la mission ${mission.nom} a été changé.`;

    await envoyerNotification({
      utilisateur_id: utilisateurId,
      recepteur_id,
      titre,
      message,
      type: "INFO",
    });

    res.json({ message: "Véhicule changé et notification envoyée." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
// ✅ Créer une notification (Chef Département → Responsable)
exports.creerPourIntervention = async (req, res) => {
  try {
    const { intervention_id, statut } = req.body;

    if (!intervention_id || !statut) {
      return res.status(400).json({ message: "Champs requis : intervention_id et statut" });
    }

    const notification = await Notification.create({
      utilisateur_id: 30,  // ID Chef Département
      recepteur_id: 22,    // ID Responsable
      type: "INFO",
      titre: `Intervention ${statut}`,
      message: `L'intervention #${intervention_id} a été ${statut.toLowerCase()} par le Chef de Département.`
    });

    return res.status(201).json(notification);
  } catch (error) {
    console.error("❌ Erreur creation notification intervention :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création." });
  }
};
exports.notificationVehiculeOuRemarque = async (req, res) => {
  try {
    const { signalementId, vehiculeId, remarque, utilisateurId } = req.body;

    if (!signalementId || !remarque) {
      return res.status(400).json({ message: "Champs requis : signalementId et remarque" });
    }

    // Récupérer le signalement
    const signalement = await db.signalements.findByPk(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement introuvable" });
    }

    // ⚡ Ici chauffeur_id correspond à chauffeurs.id
    const chauffeur = await db.chauffeurs.findByPk(signalement.chauffeur_id);
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur introuvable" });
    }

    // ⚡ Utiliser l'utilisateur lié au chauffeur
    const recepteur_id = chauffeur.utilisateur_id;

    const titre = vehiculeId ? "Remplacement de véhicule" : "Pas de véhicule disponible";

    const notification = await Notification.create({
      utilisateur_id: 22|| null, // Responsable qui agit
      recepteur_id, // ✅ id de l'utilisateur associé au chauffeur
      type: "INFO",
      titre,
      message: remarque || "Aucune remarque fournie",
      date_envoi: new Date(),
    });

    return res.status(201).json({
      message: "Notification créée avec succès",
      notification,
    });

  } catch (error) {
    console.error("❌ Erreur création notification :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création." });
  }
};
