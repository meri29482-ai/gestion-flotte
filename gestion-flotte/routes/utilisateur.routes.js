const express = require("express");
const router = express.Router();
const utilisateurController = require("../controllers/utilisateur.controller");

// 🔐 Connexion
router.post("/login", utilisateurController.login);

// 📄 Récupérer tous les utilisateurs
router.get("/", utilisateurController.findAll);

// 🔍 Récupérer un utilisateur par ID
router.get("/:id", utilisateurController.findOne);

// ➕ Créer un utilisateur avec photo
router.post("/", utilisateurController.create);

// ✏️ Mettre à jour un utilisateur avec nouvelle photo si envoyée
router.put("/:id", utilisateurController.update);

router.patch("/:id/action", utilisateurController.updateAction);

module.exports = router;
