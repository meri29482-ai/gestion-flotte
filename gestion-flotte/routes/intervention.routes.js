const express = require("express");
const router = express.Router();
const interventions = require("../controllers/intervention.controller");

// ✅ GET toutes les interventions
router.get("/", interventions.findAll);
router.post("/", interventions.createIntervention);
// Détails intervention – version debug
router.get("/:id/details-debug", interventions.getInterventionDetailsDebug);
module.exports = router;
