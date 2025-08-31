const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenance.controller");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/factures/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.single("fichier_facture"), maintenanceController.createMaintenance);
router.get("/", maintenanceController.getAllMaintenances);
router.get("/:id", maintenanceController.getMaintenanceById);
router.put("/:id", upload.single("fichier_facture"), maintenanceController.updateMaintenance);
router.delete("/:id", maintenanceController.deleteMaintenance);

module.exports = router;
