const db = require("../models");
const Maintenance = db.maintenance;
const Vehicule = db.vehicules; // Pour l'association

// Créer une maintenance
exports.createMaintenance = async (req, res) => {
  try {
    const {
      id_vehicule,
      type_principal,
      categorie,
      date_intervention,
      statut,
      description,
      cout,
      garage_nom
    } = req.body;

    const fichier_facture = req.file ? req.file.filename : null;

    const nouvelleMaintenance = await Maintenance.create({
      id_vehicule,
      type_principal,
      categorie,
      date_intervention,
      statut,
      description,
      cout,
      garage_nom,
      fichier_facture
    });

    res.status(201).json(nouvelleMaintenance);
  } catch (error) {
    console.error("Erreur création maintenance:", error);
    res.status(500).json({ message: "Erreur lors de la création de la maintenance." });
  }
};

// Obtenir toutes les maintenances
exports.getAllMaintenances = async (req, res) => {
  try {
    const maintenances = await Maintenance.findAll({
      include: {
        model: Vehicule,
        as: "vehicule"
      },
      order: [["date_intervention", "DESC"]]
    });

    res.status(200).json(maintenances);
  } catch (error) {
    console.error("Erreur récupération maintenances:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des maintenances." });
  }
};

// Obtenir une maintenance par ID
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: {
        model: Vehicule,
        as: "vehicule"
      }
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance non trouvée." });
    }

    res.status(200).json(maintenance);
  } catch (error) {
    console.error("Erreur récupération maintenance:", error);
    res.status(500).json({ message: "Erreur lors de la récupération." });
  }
};

// Mettre à jour une maintenance
exports.updateMaintenance = async (req, res) => {
  try {
    const id = req.params.id;

    const maintenance = await Maintenance.findByPk(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance non trouvée." });
    }

    const fichier_facture = req.file ? req.file.filename : maintenance.fichier_facture;

    await maintenance.update({
      ...req.body,
      fichier_facture
    });

    res.status(200).json({ message: "Maintenance mise à jour avec succès.", maintenance });
  } catch (error) {
    console.error("Erreur mise à jour maintenance:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la maintenance." });
  }
};

// Supprimer une maintenance
exports.deleteMaintenance = async (req, res) => {
  try {
    const id = req.params.id;

    const maintenance = await Maintenance.findByPk(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance non trouvée." });
    }

    await maintenance.destroy();
    res.status(200).json({ message: "Maintenance supprimée avec succès." });
  } catch (error) {
    console.error("Erreur suppression maintenance:", error);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
