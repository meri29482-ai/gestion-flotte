// models/missions.model.js

module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define("mission", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    demande_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type_mission: {
      type: DataTypes.ENUM("aller", "retour", "aller-retour"),
      allowNull: false,
      defaultValue: "aller"
    },
    vehicule_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chauffeur_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_depart: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    date_routour: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    etat: {
      type: DataTypes.ENUM('en attente', 'en cours', 'terminer', 'annuler', 'bloquer' ),
      defaultValue: 'en attente'
    },
    Probleme: {
      type: DataTypes.ENUM('oui', 'non'),
      defaultValue: 'non'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
    }
  }, {
    tableName: 'missions',
    timestamps: false
  });

  // ✅ Associations
  Mission.associate = models => {
    Mission.belongsTo(models.vehicules, {
      foreignKey: "vehicule_id",
      as: "vehicule"
    });

    Mission.belongsTo(models.chauffeurs, {
      foreignKey: "chauffeur_id",
      as: "chauffeur"
    });

    Mission.belongsTo(models.demandes, {
      foreignKey: "demande_id",
      as: "demande"
    });
   Mission.hasMany(models.checklists, {
  foreignKey: "mission_id",
  as: "checklists"
});
  };

  return Mission;
};
