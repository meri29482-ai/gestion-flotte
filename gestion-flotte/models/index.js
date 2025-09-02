const config = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

// ➤ Initialisation Sequelize
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  pool: config.pool,
  logging: false,
});

const db = {};

// Sequelize instance
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ➤ Chargement des modèles (les noms en majuscule)
db.utilisateurs    = require("./utilisateur.model.js")(sequelize, DataTypes);
db.chauffeurs      = require("./chauffeur.model.js")(sequelize, DataTypes);
db.vehicules       = require("./vehicule.model.js")(sequelize, DataTypes);
db.demandes         = require("./demande.model.js")(sequelize, DataTypes);
db.missions        = require("./missions.model.js")(sequelize, DataTypes);
db.documents        = require("./document.model.js")(sequelize, DataTypes);
db.Notification     = require("./notification.model.js")(sequelize, DataTypes); 
db.checklists       = require("./checklist_controle.model.js")(sequelize, DataTypes);
db.maintenance     = require("./maintenance.model.js")(sequelize, DataTypes);
db.Conge           = require("./conge.model.js")(sequelize, DataTypes);
db.signalements    = require("./signalement.model.js")(sequelize, DataTypes);
db.HeuresTravail   = require("./heures_travail.model.js")(sequelize, DataTypes);
db.Achat           = require("./achat.model.js")(sequelize, DataTypes);
db.Intervention    = require("./intervention.model.js")(sequelize, DataTypes);
db.Piece           = require("./piece.model.js")(sequelize, DataTypes);
db.NormeHse        = require("./normesHse.model.js")(sequelize, DataTypes) 

// ✅ Appel des méthodes associate() si elles existent
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
