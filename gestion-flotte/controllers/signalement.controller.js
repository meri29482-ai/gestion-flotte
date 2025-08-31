const db = require('../models');
const Signalement = db.Signalement;
const Mission = db.missions;
const Demande = db.demandes;
const Utilisateur = db.utilisateurs;
const Chauffeur = db.chauffeurs;
const Vehicule = db.vehicules; 

exports.creerSignalement = async (req, res) => {
  try {
    const { titre, description, date, utilisateur_id } = req.body;

    if (!titre || !description || !date || !utilisateur_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const nouveau = await Signalement.create({ titre, description, date, utilisateur_id });
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


exports.listeSignalements = async (req, res) => {
  try {
    const liste = await Signalement.findAll({
      include: [
        {
          model: Mission,
          as: "mission",
          attributes: ["id", "type_mission", "etat", "date_depart", "date_routour"],
          include: [
            {
              model: Vehicule,
              as: "vehicule",
              attributes: ["id", "immatriculation", "marque", "modele", "type"]
            },
            {
              model: Demande,
              as: "demande",
              attributes: ["id", "n_ordre", "destination", "type_trajet", "date_heure_debut", "date_heure_fin"],
              include: [
                {
                  model: Utilisateur,
                  as: "utilisateur",
                  attributes: ["id", "nom", "prenom", "email", "fonction"]
                }
              ]
            },
            {
              model: Chauffeur,
              as: "chauffeur",
              attributes: ["id", "societe", "type_permis", "numero_permis"],
              include: [
                {
                  model: Utilisateur,
                  as: "utilisateur",
                  attributes: ["id", "nom", "prenom", "email", "numero_telephone"]
                }
              ]
            },
            
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(liste);
  } catch (error) {
    console.error("Erreur listeSignalements:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

