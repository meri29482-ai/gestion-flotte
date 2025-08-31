const express = require("express");
const router = express.Router();
const demandeController = require("../controllers/demande.controller");
const auth = require("../middleware/auth"); // Middleware d'authentification

// 🔒 Créer une nouvelle demande (utilisateur connecté)
router.post("/", auth, demandeController.creerDemande);

// 🔒 Obtenir toutes les demandes de l’utilisateur connecté
router.get("/mes-demandes", auth, demandeController.mesDemandes);

// 🔒 Obtenir toutes les demandes (admin/responsable avec rôle à gérer plus tard si besoin)
router.get("/", auth, demandeController.getAllDemandes);

// 🔒 Mettre à jour une demande (par ID)
router.put("/:id", auth, demandeController.updateDemande);

// 🔒 Supprimer une demande (par ID)
router.delete("/:id", auth, demandeController.deleteDemande);

module.exports = router;
