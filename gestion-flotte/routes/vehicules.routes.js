const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehicule.controller");
const upload = require("../middleware/upload");

// Upload multiple fields
const multiUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "assurance", maxCount: 1 },
  { name: "carte_grise", maxCount: 1 },
  { name: "controle_technique", maxCount: 1 }
]);

// ✅ Routes véhicules
router.post("/", multiUpload, vehiculeController.createVehicule);
router.put("/:id", multiUpload, vehiculeController.updateVehicule);
router.get("/disponibles", vehiculeController.getVehiculesDisponibles); // Spécifique avant /:id
router.get("/:id/details", vehiculeController.getVehiculeDetails);
router.get("/:id", vehiculeController.getVehiculeById);
router.get("/", vehiculeController.getAllVehicules);
router.delete("/:id", vehiculeController.deleteVehicule);

module.exports = router;
