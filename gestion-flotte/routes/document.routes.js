const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Créer un document avec fichier
router.post("/", auth, upload.single("fichier"), documentController.createDocument);

// Modifier un document (fichier optionnel)
router.put("/:id", auth, upload.single("fichier"), documentController.updateDocument);

// Autres routes
router.get("/", auth, documentController.getAllDocuments);
router.get("/:id", auth, documentController.getDocumentById);
router.delete("/:id", auth, documentController.deleteDocument);

module.exports = router;
