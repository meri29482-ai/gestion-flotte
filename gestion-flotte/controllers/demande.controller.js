const db = require("../models");

// ✅ Import Sequelize pour les transactions
const sequelize = db.sequelize;

// ✅ Import des modèles (⚠ bien mettre la même casse que dans models/index.js)
const Demande = db.demandes;
const Utilisateur = db.utilisateurs;
const Mission = db.missions;
const Chauffeur = db.chauffeurs;
const Vehicule = db.vehicules;
const Notification = db.Notification;

// ✅ Créer une nouvelle demande
exports.creerDemande = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      n_ordre,
      type_trajet,
      date_heure_debut,
      date_heure_fin,
      destination,
      observation,
      itineraire
    } = req.body;

    const utilisateur_id = req.user?.id;
    if (!utilisateur_id) {
      await t.rollback();
      return res.status(401).json({ message: "⚠️ Utilisateur non authentifié. Veuillez vous reconnecter." });
    }

    // ✅ Validation des dates
    if (!date_heure_debut || (type_trajet === "ALLER_RETOUR" && !date_heure_fin)) {
      await t.rollback();
      return res.status(400).json({ message: "Dates début/fin obligatoires." });
    }

    if (date_heure_fin && new Date(date_heure_debut) >= new Date(date_heure_fin)) {
      await t.rollback();
      return res.status(400).json({ message: "La date de fin doit être postérieure à la date de début." });
    }

    // ✅ Création de la demande
    const nouvelleDemande = await Demande.create({
      n_ordre,
      type_trajet,
      date_heure_debut,
      date_heure_fin: type_trajet === "ALLER_RETOUR" ? date_heure_fin : null,
      destination,
      observation,
      itineraire,
      etat: "EN COURS",
      utilisateur_id
    }, { transaction: t });

    // ✅ Création de la notification
    await Notification.create({
      type: "MISSION",
      titre: "Nouvelle demande reçue",
      message: `Une nouvelle demande #${nouvelleDemande.n_ordre} a été créée par l'utilisateur ${utilisateur_id}.`,
      lu: 0,
      date_envoi: new Date(),
      utilisateur_id, // émetteur
      recepteur_id: 22 // ⚠️ à rendre dynamique plus tard
    }, { transaction: t });

    await t.commit();
    return res.status(201).json(nouvelleDemande);
  } catch (error) {
    await t.rollback();
    console.error("❌ Erreur lors de la création de la demande :", error);
    return res.status(500).json({
      message: "Erreur interne lors de la création de la demande.",
      error: error.message
    });
  }
};

// ✅ Obtenir les demandes de l'utilisateur connecté
exports.mesDemandes = async (req, res) => {
  try {
    const utilisateur_id = req.user?.id || req.userId;
    if (!utilisateur_id) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const demandes = await Demande.findAll({
      where: { utilisateur_id },
      include: [
        {
          model: Mission,
          as: "mission",
          include: [
            {
              model: Chauffeur,
              as: "chauffeur",
              include: [
                {
                  model: Utilisateur,
                  as: "utilisateur",
                  attributes: ["nom", "prenom", "numero_telephone"]
                }
              ]
            },
            {
              model: Vehicule,
              as: "vehicule",
              attributes: ["immatriculation", "marque"]
            }
          ]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(demandes);
  } catch (error) {
    console.error("❌ Erreur récupération des demandes utilisateur:", error);
    res.status(500).json({ message: "Erreur lors de la récupération de vos demandes." });
  }
};

// ✅ Obtenir toutes les demandes
exports.getAllDemandes = async (req, res) => {
  try {
    const demandes = await Demande.findAll({
      include: [
        {
          model: Utilisateur,
          as: "utilisateur",
          attributes: ["matricule", "nom", "prenom"]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(demandes);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur récupération demandes." });
  }
};

// ✅ Mise à jour demande
exports.updateDemande = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date_heure_debut,
      date_heure_fin,
      destination,
      observation,
      etat
    } = req.body;

    const demande = await Demande.findByPk(id);
    if (!demande) {
      return res.status(404).json({ message: "Demande introuvable." });
    }

    if (date_heure_debut && date_heure_fin && new Date(date_heure_debut) >= new Date(date_heure_fin)) {
      return res.status(400).json({ message: "La date de fin doit être postérieure à la date de début." });
    }

    await demande.update({
      date_heure_debut,
      date_heure_fin,
      destination,
      observation,
      etat
    });

    res.status(200).json({ message: "Demande mise à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur mise à jour demande:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la demande." });
  }
};

// ✅ Supprimer une demande
exports.deleteDemande = async (req, res) => {
  try {
    const { id } = req.params;

    const demande = await Demande.findByPk(id);
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée." });
    }

    await demande.destroy();
    res.status(200).json({ message: "Demande supprimée avec succès." });
  } catch (error) {
    console.error("❌ Erreur suppression demande:", error);
    res.status(500).json({ message: "Erreur lors de la suppression de la demande." });
  }
};
