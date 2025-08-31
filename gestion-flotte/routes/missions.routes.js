const express = require("express");
const router = express.Router();
const controller = require("../controllers/missions.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// CRUD
router.post("/", controller.create);
router.get("/", controller.getAllMissions);
router.get("/:id/feuille-route", controller.generateFeuilleRoute);
router.get("/:id", controller.findOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
// Récupérer toutes les missions avec positions et détails
router.get("/all/positions", controller.getAllMissionsPositions);
// Récupérer toutes les positions des missions en cours sauf celles du chauffeur connecté
router.get("/positions/exclude/:id", controller.getAllMissionsPositionsExceptMission);
// ✅ Signalement avec photo
router.post("/signalements",auth,upload.single("photo"),controller.signalerIncident);
router.put('/accepter/:id', controller.accepterMission);
router.put('/:id/annuler', controller.annulerMission);
// Nouvelle route pour missions par demandeur
router.get("/demandeur/:utilisateurId", controller.getMissionsByDemandeur);
router.get('/chauffeur/:chauffeurId', controller.getMissionsByChauffeur);
router.get("/vehicule/:vehiculeId", controller.getMissionsByVehicule);
// Mettre à jour position
router.put('/:id/position', controller.updateMissionPosition);

// Obtenir position
router.get('/:id/position', controller.getMissionPosition);





module.exports = router;
