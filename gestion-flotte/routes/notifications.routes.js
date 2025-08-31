const express = require("express");
const router = express.Router();
const controller = require("../controllers/notifications.controller");
const auth = require("../middleware/auth");

// Correction ici :
router.get("/:recepteur_id", controller.getNotificationsPourRecepteur); // ✔
router.post("/", controller.creerNotification);
// Marquer une seule notification comme lue
router.put('/lu/:id', auth, controller.marquerUneNotificationCommeLu);
router.put("/:recepteur_id/lu", controller.marquerToutesCommeLues);
router.delete("/:id", controller.supprimerNotification);

module.exports = router;
