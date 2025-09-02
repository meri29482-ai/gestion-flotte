const express = require("express");
const router = express.Router();
const interventions = require("../controllers/intervention.controller");
const auth = require("../middleware/auth"); // Middleware d'authentification
// ✅ GET toutes les interventions
router.get("/", interventions.findAll);
// Route pour créer intervention + notification automatiquement
router.post('/', auth, interventions.creerInterventionAvecNotification);
// Détails intervention – version debug
router.get("/:id/details-debug", interventions.getInterventionDetailsDebug);

// Validation / Rejet
router.put("/:id/valider", interventions.validerIntervention);
router.put("/:id/rejeter", interventions.rejeterIntervention);

// ✅ Nouvelle route historique
router.get('/historique', interventions.getHistorique);

// ✅ Nouvelle route : coût total par véhicule
router.get('/cout-par-vehicule', interventions.getCoutParVehicule);

module.exports = router;
