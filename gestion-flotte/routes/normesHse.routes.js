const express = require("express");
const router = express.Router();
const normesController = require("../controllers/normesHse.controller");
const upload = require("../middleware/upload");

// POST avec upload d’un fichier nommé "document"
router.post("/", upload.single("document"), normesController.create);

// PUT pour mise à jour (optionnel fichier)
router.put("/:id", upload.single("document"), normesController.update);

// GET, DELETE classiques
router.get("/", normesController.findAll);
router.get("/:id", normesController.findOne);
router.delete("/:id", normesController.delete);

module.exports = router;
