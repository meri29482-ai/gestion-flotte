const express = require("express");
const router = express.Router();
const congeController = require("../controllers/conge.controller");

// 🔹 Créer un congé
router.post("/", congeController.createConge);

// 🔹 Lister tous les congés
router.get("/", congeController.getAllConges);

// 🔹 Obtenir un congé par ID
router.get("/:id", congeController.getCongeById);

// 🔹 Obtenir les congés d’un chauffeur
router.get("/chauffeur/:id_chauffeur", congeController.getCongesByChauffeur);

// 🔹 Mettre à jour un congé
router.put("/:id", congeController.updateConge);

// 🔹 Supprimer un congé
router.delete("/:id", congeController.deleteConge);

module.exports = router;
