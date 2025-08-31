const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");


// 📦 Création de l'application
const app = express();

// 🌍 Middlewares globaux
  app.use(cors({
 origin: '*',
  methods:  ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
  
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 📁 Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/documents", express.static(path.join(__dirname, "uploads/documents")));

// ✅ Importation des routes (assure-toi que tous ces fichiers existent)
const utilisateurRoutes = require("./routes/utilisateur.routes");
const vehiculeRoutes = require("./routes/vehicules.routes");
const chauffeurRoutes = require("./routes/chauffeur.routes");
const missionRoutes = require("./routes/missions.routes");
const demandeRoutes = require("./routes/demande.routes");
const documentRoutes = require("./routes/document.routes");
const checklistRoutes = require("./routes/checklist.routes");
const notificationRoutes = require("./routes/notifications.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const congeRoutes = require("./routes/conge.routes");
const signalementsRouter = require("./routes/signalement.routes")
const heuresTravailRoutes = require('./routes/heuresTravail.routes');
const interventionRouter = require("./routes/intervention.routes");
const normesHseRoutes = require('./routes/normesHse.routes');

// 🧭 Utilisation des routes
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/vehicules", vehiculeRoutes);
app.use("/api/chauffeurs", chauffeurRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/demandes", demandeRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/conges", congeRoutes);
app.use("/api/signalements",signalementsRouter);
app.use('/api/heures-travail', heuresTravailRoutes);
app.use('/api/interventions' , interventionRouter);
app.use('/api/normes-hse', normesHseRoutes);

// 🏠 Route principale
app.get("/", (req, res) => {
  res.send("Bienvenue dans l'API de gestion de flotte.");
});

// ✅ Export de l'application
module.exports = app;
