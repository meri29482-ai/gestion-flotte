const express = require("express");
const router = express.Router();
const controller = require("../controllers/notifications.controller");

// Correction ici :
router.get("/:recepteur_id", controller.getNotificationsPourRecepteur); // ✔
 // POST /api/notifications/intervention
  router.post("/intervention", controller.creerPourIntervention);
router.post("/", controller.creerNotification);
router.put("/:recepteur_id/lu", controller.marquerToutesCommeLues);
router.delete("/:id", controller.supprimerNotification);
// Exemple Express.js
router.put('/missions/demarrer/:id', controller.demarrerMission);
router.put('/missions/changer-vehicule/:id', controller.changerVehicule);

// ✅ Créer une notification lorsqu'un responsable ajoute une solution / remarque
// POST /api/notifications/vehicule-ou-remarque
router.post("/vehicule-ou-remarque", controller.notificationVehiculeOuRemarque);
module.exports = router;
