const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../models");

const Utilisateur = db.utilisateurs;
const Notification = db.Notification;

// 📁 Configuration de stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage }).single("photo");


// ➕ Créer un utilisateur
exports.create = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).send({ message: "Erreur upload image : " + err.message });

    try {
      const { nom, prenom, email, mot_de_passe, role, etat, matricule } = req.body;
      const photo = req.file ? req.file.filename : null;

      // ✅ Hachage du mot de passe
      const hash = await bcrypt.hash(mot_de_passe, 10);

      const utilisateur = await Utilisateur.create({
        nom,
        prenom,
        email,
        mot_de_passe: hash,
        role,
        etat,
        matricule,
        photo,
      });

      await Notification.create({
        utilisateur_id: utilisateur.id,
        type: "INFO",
        titre: "Bienvenue",
        message: `👋 Bienvenue ${utilisateur.prenom}, votre compte a été créé avec succès.`,
      });

      res.status(201).send(utilisateur);
    } catch (error) {
      console.error("❌ Erreur lors de la création :", error);
      res.status(500).send({ message: error.message });
    }
  });
};


// 🔐 Connexion
exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) return res.status(404).send({ message: "Utilisateur non trouvé." });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).send({ message: "Mot de passe incorrect." });

    const token = jwt.sign(
      {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "cle-secrete-par-defaut",
      { expiresIn: "24h" }
    );

    const userData = user.toJSON();
    delete userData.mot_de_passe;
    if (userData.photo) {
      userData.photoUrl = `http://localhost:3000/uploads/${userData.photo}`;
    }

    res.status(200).send({
      message: "Connexion réussie",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("❌ Erreur connexion :", error);
    res.status(500).send({ message: "Erreur serveur." });
  }
};


// 📖 Lire tous les utilisateurs
exports.findAll = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll();
    const liste = utilisateurs.map(u => {
      const user = u.toJSON();
      if (user.photo) user.photoUrl = `http://localhost:3000/uploads/${user.photo}`;
      delete user.mot_de_passe;
      return user;
    });
    res.status(200).send(liste);
  } catch (error) {
    console.error("❌ Erreur findAll :", error);
    res.status(500).send({ message: error.message });
  }
};


// 📖 Lire un utilisateur par ID
exports.findOne = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).send({ message: "Utilisateur non trouvé." });

    const user = utilisateur.toJSON();
    if (user.photo) user.photoUrl = `http://localhost:3000/uploads/${user.photo}`;
    delete user.mot_de_passe;

    res.status(200).send(user);
  } catch (error) {
    console.error("❌ Erreur findOne :", error);
    res.status(500).send({ message: error.message });
  }
};


// ✏️ Mettre à jour un utilisateur
exports.update = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Erreur upload image :", err);
      return res.status(500).send({ message: "Erreur upload image : " + err.message });
    }

    try {
      const id = req.params.id;
      const utilisateur = await Utilisateur.findByPk(id);
      if (!utilisateur) {
        return res.status(404).send({ message: "Utilisateur non trouvé." });
      }

      const data = { ...req.body };

      // 🔐 Hachage si mot de passe présent
      if (data.mot_de_passe && data.mot_de_passe.trim() !== "") {
        data.mot_de_passe = await bcrypt.hash(data.mot_de_passe, 10);
      } else {
        delete data.mot_de_passe;
      }

      // 📷 Gestion de la photo
      if (req.file) {
        const oldPath = path.join(__dirname, "../uploads/", utilisateur.photo || "");
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        data.photo = req.file.filename;
      }

      await utilisateur.update(data);

      await Notification.create({
        utilisateur_id: utilisateur.id,
        type: "INFO",
        titre: "Mise à jour du profil",
        message: "✏️ Votre profil a été mis à jour par l'administrateur.",
      });

      const utilisateurMaj = await Utilisateur.findByPk(utilisateur.id);
      const user = utilisateurMaj.toJSON();
      if (user.photo) user.photoUrl = `http://localhost:3000/uploads/${user.photo}`;
      delete user.mot_de_passe;

      res.status(200).send(user);
    } catch (error) {
      console.error("❌ Erreur update :", error);
      res.status(500).send({ message: "Erreur interne : " + error.message });
    }
  });
};


// ✅ Modifier le droit d’action
exports.updateAction = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!["lecture", "ecriture"].includes(action)) {
    return res.status(400).json({ message: "Action invalide (lecture ou ecriture)." });
  }

  try {
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé." });

    utilisateur.action = action;
    await utilisateur.save();

    res.status(200).json({ message: `✅ Action mise à jour en '${action}' pour ${utilisateur.nom}.` });
  } catch (error) {
    console.error("❌ Erreur updateAction :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


// 📩 Envoyer un code de vérification
exports.envoyerCode = async (req, res) => {
  const { email } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    codesParEmail[email] = code;

    await envoyerCodeParEmail(email, code); // ✅ nom correct
    res.json({ message: "📩 Code envoyé à votre adresse e-mail." });
  } catch (error) {
    console.error("Erreur envoyerCode:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du code." });
  }
};

// ✅ Vérifier le code
exports.verifierCode = (req, res) => {
  const { email, code } = req.body;
  const codeAttendu = codesParEmail[email];

  if (parseInt(code) === codeAttendu) {
    res.json({ message: "✅ Code vérifié avec succès." });
  } else {
    res.status(400).json({ message: "❌ Code incorrect ou expiré." });
  }
};

// 🔁 Modifier le mot de passe
exports.modifierMotDePasse = async (req, res) => {
  const { email, nouveauMotDePasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const motDePasseCrypte = await bcrypt.hash(nouveauMotDePasse, 10);
    utilisateur.mot_de_passe = motDePasseCrypte;
    await utilisateur.save();

    delete codesParEmail[email];

    res.json({ message: "🔐 Mot de passe modifié avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." });
  }
};
// 📖 Récupérer les utilisateurs par rôle
exports.findByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const utilisateurs = await Utilisateur.findAll({ where: { role } });
    const utilisateursSansMdp = utilisateurs.map(u => {
      const user = u.toJSON();
      delete user.mot_de_passe;
      if (user.photo) user.photoUrl = `http://localhost:3000/uploads/${user.photo}`;
      return user;
    });

    res.status(200).send(utilisateursSansMdp);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// 🔹 Récupérer le chef de département
exports.getChefDepartement = async (req, res) => {
  try {
    const chef = await Utilisateur.findOne({
      where: { role: 'MANAGER', etat: 'ACTIF' }
    });
    if (!chef) return res.status(404).json({ message: "Chef de département introuvable" });
    res.json(chef);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};