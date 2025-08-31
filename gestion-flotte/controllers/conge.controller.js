const db = require("../models");
const Conge = db.Conge;

// 🔹 Créer un congé
exports.createConge = async (req, res) => {
  try {
    const newConge = await Conge.create(req.body);
    res.status(201).json(newConge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtenir tous les congés (avec chauffeur associé)
exports.getAllConges = async (req, res) => {
  try {
    const conges = await Conge.findAll({ include: ["chauffeur"] });
    res.status(200).json(conges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtenir un congé par ID (avec chauffeur associé)
exports.getCongeById = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id, { include: ["chauffeur"] });
    if (conge) res.status(200).json(conge);
    else res.status(404).json({ message: "Congé non trouvé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtenir les congés d’un chauffeur (par ID du chauffeur)
exports.getCongesByChauffeur = async (req, res) => {
  try {
    const id_chauffeur = req.params.id_chauffeur;
    const conges = await Conge.findAll({
      where: { id_chauffeur },
      order: [['date_debut', 'DESC']]
    });

    res.status(200).json(conges);
  } catch (error) {
    console.error("Erreur lors de la récupération des congés :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔹 Mettre à jour un congé
exports.updateConge = async (req, res) => {
  try {
    const [updated] = await Conge.update(req.body, { where: { id: req.params.id } });
    if (updated) res.status(200).json({ message: "Congé mis à jour" });
    else res.status(404).json({ message: "Congé non trouvé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Supprimer un congé
exports.deleteConge = async (req, res) => {
  try {
    const deleted = await Conge.destroy({ where: { id: req.params.id } });
    if (deleted) res.status(200).json({ message: "Congé supprimé" });
    else res.status(404).json({ message: "Congé non trouvé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
