// controllers/intervention.controller.js
const db = require("../models");
const Achat = db.Achat;
const Piece = db.Piece;
const Maintenance = db.maintenance;
const Intervention = db.Intervention;
const Utilisateur = db.utilisateurs; // ⚠️ doit correspondre au nom du modèle défini
const Vehicule = db.vehicules; // ✅ Important : importer Vehicule
const Notification = db.Notification; // ⚠️ Vérifier l’orthographe
exports.creerInterventionAvecNotification = async (req, res) => {
  try {
    // 🔹 Vérifier l'utilisateur connecté
    const responsableId = req.user?.id;
    if (!responsableId) return res.status(401).json({ message: "Utilisateur non trouvé" });

    // 🔹 Récupérer les données de l'intervention depuis le body
    const {
      vehicule_id,
      priorite,
      type_demande,
      cout,
      delai,
      description,
      fournisseur,
      pieces,
      type_maintenance,
      categorie,
      duree,
      observation
    } = req.body;

    if (!vehicule_id || !priorite || !type_demande) {
      return res.status(400).json({ message: "Champs obligatoires manquants !" });
    }

    // 🔹 Préparer l'objet intervention
    let interventionData = {
      vehicule_id,
      priorite,
      type_demande,
      cout,
    };

    if (type_demande === 'achat') {
      interventionData.delai = delai;
      interventionData.description = description;
      interventionData.fournisseur = fournisseur;
      interventionData.pieces = pieces;
    } else if (type_demande === 'maintenance') {
      interventionData.type_principal = type_maintenance;
      interventionData.categorie = categorie;
      interventionData.duree = duree;
      interventionData.observation = observation;
    }

    // 🔹 Créer l'intervention
    const intervention = await Intervention.create(interventionData);

    // 🔹 Récupérer le chef de département actif
    const chef = await Utilisateur.findOne({
      where: { role: 'MANAGER', etat: 'ACTIF' }
    });

    if (chef) {
      // 🔹 Créer la notification pour le chef
      await Notification.create({
        utilisateur_id: responsableId, // auteur = responsable connecté
        recepteur_id: chef.id,
        type: 'ALERTE',
        titre: 'Nouvelle intervention ',
        message: `Le responsable a créé l'intervention ID ${intervention.id}. Elle attend votre validation.`
      });
    }

    res.status(201).json({ intervention, message: "Intervention et notification créées avec succès !" });

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'intervention :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'intervention." });
  }
};

// ✅ Récupérer toutes les interventions avec le véhicule
exports.findAll = async (req, res) => {
  try {
    const interventions = await Intervention.findAll({
      include: [
        {
          model: Vehicule,
          as: "vehicule",   // Assure-toi que l'alias correspond à ton association
          attributes: ["marque", "modele", "type"] // Champs que tu veux récupérer
        }
      ]
    });
    res.json(interventions);
  } catch (error) {
    console.error("Erreur findAll interventions :", error);
    res.status(500).json({ message: error.message });
  }
};
// Détails d'une intervention (debug)
exports.getInterventionDetailsDebug = async (req, res) => {
  const { id } = req.params;
  console.log("➡️ getInterventionDetailsDebug appelé pour id =", id);

  try {
    const intervention = await Intervention.findByPk(id, {
      include: [
        {
          model: Achat,
          as: "achat",
          include: [{ model: Piece, as: "piece" }]
        },
        { 
          model: Maintenance, 
          as: "maintenance" 
        },
        { 
          model: Vehicule, 
          as: "vehicule",
          attributes: ["marque", "modele", "type"]
        }
      ]
    });

    if (!intervention) {
      console.log("❌ Intervention non trouvée");
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    const json = intervention.toJSON();
    console.log("✅ Intervention récupérée :", JSON.stringify(json, null, 2));

    res.json(json);
  } catch (error) {
    console.error("❌ Erreur getInterventionDetailsDebug :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message });
  }
};
// ✅ Valider une intervention
exports.validerIntervention = async (req, res) => {
  const { id } = req.params;
  try {
    const intervention = await Intervention.findByPk(id);
    if (!intervention) {
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    intervention.statut = "Validée";
    await intervention.save();

    res.json({ message: "Intervention validée ✅", intervention });
  } catch (error) {
    console.error("❌ Erreur validerIntervention :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message });
  }
};

// ❌ Rejeter une intervention
exports.rejeterIntervention = async (req, res) => {
  const { id } = req.params;
  try {
    const intervention = await Intervention.findByPk(id);
    if (!intervention) {
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    intervention.statut = "Rejetée";
    await intervention.save();

    res.json({ message: "Intervention rejetée ❌", intervention });
  } catch (error) {
    console.error("❌ Erreur rejeterIntervention :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message });
  }
};
// Récupérer toutes les interventions validées ou rejetées
exports.getHistorique = async (req, res) => {
  try {
    const historique = await Intervention.findAll({
      where: {
        statut: ['Validée', 'Rejetée']  // seulement les interventions terminées
      },
      include: [
        {
          model: Vehicule,
          as: "vehicule",
          attributes: ["marque", "modele", "type"]
        }
      ],
      order: [['createdAt', 'DESC']] // plus récentes en premier
    });

    res.json(historique);
  } catch (error) {
    console.error("Erreur récupération historique :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message });
  }
};

// Récupérer le coût total par véhicule pour histogramme
exports.getCoutParVehicule = async (req, res) => {
  try {
    const data = await Intervention.findAll({
      attributes: [
        'vehicule_id',
        [db.Sequelize.fn('SUM', db.Sequelize.col('cout')), 'total_cout']
      ],
      where: { statut: 'Validée' }, // seulement interventions validées
      group: ['vehicule_id'],
      include: [
        {
          model: Vehicule,
          as: 'vehicule',
          attributes: ['marque','modele','type']
        }
      ]
    });

    // Format facile pour frontend
    const result = data.map(item => ({
      vehicule: item.vehicule ? `${item.vehicule.marque} ${item.vehicule.modele}` : 'Inconnu',
      total_cout: parseFloat(item.get('total_cout')) || 0
    }));

    res.json(result);
  } catch (error) {
    console.error("Erreur getCoutParVehicule :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message });
  }
};
