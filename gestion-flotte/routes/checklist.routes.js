const express = require("express");
const router = express.Router();
const checklistController = require("../controllers/checklist_controle.controller");

// ➕ Créer une nouvelle checklist
router.post("/", checklistController.create);

// 📄 Obtenir toutes les checklists
router.get("/", checklistController.findAll);

// 🔍 Obtenir une checklist par ID
router.get("/:id", checklistController.findOne);

// ✏️ Mettre à jour une checklist
router.put("/:id", checklistController.update);

// 🗑 Supprimer une checklist
router.delete("/:id", checklistController.delete);

module.exports = router;
