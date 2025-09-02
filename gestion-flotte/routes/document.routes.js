const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// ➤ Export PDF (doit être avant "/:id")
router.get("/export/:type/:id", documentController.exportIntervention);

// ➤ Vérifier les expirations (avant "/:id")
router.get("/verifier-expirations", documentController.verifierExpirations);

// ➤ Créer un document automatiquement à partir d’une intervention
router.post("/from-intervention", documentController.createDocumentFromIntervention);

// ➤ CRUD
// Créer un document avec fichier
router.post("/", auth, upload.single("fichier"), documentController.createDocument);

// Modifier un document (fichier optionnel)
router.put("/:id", auth, upload.single("fichier"), documentController.updateDocument);

// Récupérer tous les documents
router.get("/", auth, documentController.getAllDocuments);

// Récupérer un document par ID (placé après les routes spécifiques)
router.get("/:id", auth, documentController.getDocumentById);

// Supprimer un document
router.delete("/:id", auth, documentController.deleteDocument);

module.exports = router;
