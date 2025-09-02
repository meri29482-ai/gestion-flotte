const db = require('../models');
const Signalement = db.signalements;
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
    console.log("Appel GET /api/signalements");

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

    console.log("Liste récupérée:", liste.length);
    res.json(liste);
  } catch (error) {
    console.error("Erreur listeSignalements:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Récupérer un signalement avec mission + véhicule
exports.getSignalementById = async (req, res) => {
  try {
    const { id } = req.params;

    const signalement = await Signalement.findByPk(id, {
      include: [
        {
          model: Mission,
          as: "mission",
          include: [
            {
              model: Vehicule,
              as: "vehicule"
            }
          ]
        }
      ]
    });

    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    res.json(signalement);
  } catch (error) {
    console.error("Erreur getSignalementById:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du signalement" });
  }
};
// ✅ Mettre à jour un signalement et l'état de la mission associée
exports.mettreAJourSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    const { intervention_description, vehicule_remplacement_id, mission_continue } = req.body;

    const signalement = await Signalement.findByPk(id, {
      include: [{ model: Mission, as: "mission" }]
    });

    if (!signalement) {
      return res.status(404).json({ message: "Signalement introuvable" });
    }

    // 🔹 Mettre à jour les champs du signalement
    if (intervention_description !== undefined)
      signalement.intervention_description = intervention_description;
    if (vehicule_remplacement_id !== undefined)
      signalement.vehicule_remplacement_id = vehicule_remplacement_id;
    if (mission_continue !== undefined)
      signalement.mission_continue = mission_continue;

    // Si une solution est donnée → marquer comme enregistrée
    if (intervention_description || vehicule_remplacement_id) {
      signalement.solution_enregistree = true;
    }

    await signalement.save();

    // 🔹 Mettre à jour l’état de la mission dans la BDD
    if (signalement.solution_enregistree && signalement.mission) {
      if (!signalement.vehicule_remplacement_id) {
        // aucun véhicule de remplacement → mission terminée
        signalement.mission.etat = "terminer";
      } else {
        // avec véhicule remplacement → mission continue
        signalement.mission.etat = "en cours";
      }

      await signalement.mission.save();
    }

    return res.status(200).json({
      message: "✅ Signalement et mission mis à jour avec succès",
      signalement,
      mission: signalement.mission
    });

  } catch (error) {
    console.error("Erreur mettreAJourSignalement:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du signalement" });
  }
};
