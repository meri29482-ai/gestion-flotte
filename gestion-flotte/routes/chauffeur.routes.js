const express = require("express");
const router = express.Router();
const chauffeurController = require("../controllers/chauffeur.controller");
const multer = require("multer");
const path = require("path");

// 🔧 Configuration Multer pour stocker les fichiers des chauffeurs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    cb(null, `${base}-${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

// 🔒 Middleware pour gérer plusieurs fichiers par type
const uploadFields = upload.fields([
  { name: "permis_conduire", maxCount: 1 },
  { name: "certificat_medical", maxCount: 1 },
  { name: "certificat_capacite", maxCount: 1 }
]);

// ➤ Créer un nouveau chauffeur avec documents
router.post("/", uploadFields, chauffeurController.createChauffeur);

// ➤ Obtenir tous les chauffeurs
router.get("/", chauffeurController.getAllChauffeurs);

// ➤ Obtenir un chauffeur par ID (avec documents)
router.get("/:id", chauffeurController.getChauffeurById);
router.get("/utilisateur/:id", chauffeurController.getByUtilisateurId);
// ➤ Mettre à jour un chauffeur avec documents
router.put("/:id", uploadFields, chauffeurController.updateChauffeur);

// ➤ Supprimer un chauffeur
router.delete("/:id", chauffeurController.deleteChauffeur);

module.exports = router;
