
const db = require("../models");

// ✅ Import Sequelize pour les transactions
const sequelize = db.sequelize;
const HeureTravail = db.HeuresTravail;
const Demande = db.demandes;
const Mission = db.missions;

// 🔹 Créer une nouvelle heure de travail
exports.create = async (req, res) => {
  try {
    const { chauffeur_id, mission_id, heure_depart, heure_arrivee, duree_total } = req.body;

    const nouvelleHeure = await HeureTravail.create({
      chauffeur_id,
      mission_id,
      heure_depart,
      heure_arrivee,
      duree_total
    });

    res.status(201).json(nouvelleHeure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de l’heure de travail.' });
  }
};

// 🔹 Récupérer toutes les heures de travail
exports.findAll = async (req, res) => {
  try {
    const heures = await HeureTravail.findAll();
    res.json(heures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des heures de travail.' });
  }
};

exports.findByChauffeurId = async (req, res) => {
  try {
    const { chauffeur_id } = req.params;

    const heures = await HeureTravail.findAll({
      where: { chauffeur_id },
      include: [
        {
          model: Mission,
          as: 'mission',           // Assure-toi que l'association est définie : HeureTravail.belongsTo(Mission, { as: 'mission', foreignKey: 'mission_id' })
          include: [
            {
              model: Demande,
              as: 'demande'       // Assure-toi que l'association est définie : Mission.belongsTo(Demande, { as: 'demande', foreignKey: 'demande_id' })
            }
          ]
        }
      ],
      order: [['id', 'ASC']] // optionnel : trier par id ou date
    });


    // Optionnel : transformer les données pour inclure directement n_ordre
    const result = heures.map(h => ({
      id: h.id,
      chauffeur_id: h.chauffeur_id,
      mission_id: h.mission_id,
      heure_depart: h.heure_depart,
      heure_arrivee: h.heure_arrivee,
      duree_total: h.duree_total,
      n_ordre: h.mission?.demande?.n_ordre || null
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des heures de travail du chauffeur.' });
  }
};


// 🔹 Récupérer une heure de travail par ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const heure = await HeureTravail.findByPk(id);
    if (!heure) return res.status(404).json({ message: 'Heure de travail non trouvée.' });
    res.json(heure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l’heure de travail.' });
  }
};

// 🔹 Mettre à jour une heure de travail
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { chauffeur_id, mission_id, heure_depart, heure_arrivee, duree_total } = req.body;

    const heure = await HeureTravail.findByPk(id);
    if (!heure) return res.status(404).json({ message: 'Heure de travail non trouvée.' });

    await heure.update({ chauffeur_id, mission_id, heure_depart, heure_arrivee, duree_total });
    res.json(heure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’heure de travail.' });
  }
};

// 🔹 Supprimer une heure de travail
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const heure = await HeureTravail.findByPk(id);
    if (!heure) return res.status(404).json({ message: 'Heure de travail non trouvée.' });

    await heure.destroy();
    res.json({ message: 'Heure de travail supprimée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l’heure de travail.' });
  }
};
