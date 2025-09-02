const express = require("express");
const router = express.Router();
const signalementController = require("../controllers/signalement.controller");
const upload = require("../middleware/upload");

// POST signalement avec photo
router.post(
  "/",
  upload.single("photo"),
  signalementController.creerSignalement // ✅ corriger ici
);

// GET tous les signalements
router.get("/", signalementController.listeSignalements);

router.put("/:id", signalementController.mettreAJourSignalement);

// ✅ Récupérer un signalement par ID (avec mission + véhicule)
router.get("/:id", signalementController.getSignalementById);
module.exports = router;
