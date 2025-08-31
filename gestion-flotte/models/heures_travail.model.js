module.exports = (sequelize, DataTypes) => {
  const HeuresTravail = sequelize.define("heures_travail", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chauffeur_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    heure_depart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    heure_arrivee: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duree_total: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    tableName: "heures_travail",
    timestamps: false // car ta table n’a pas createdAt / updatedAt
  });

  // 📌 Associations
  HeuresTravail.associate = (models) => {
    HeuresTravail.belongsTo(models.chauffeurs, {
      foreignKey: "chauffeur_id",
      as: "chauffeur"
    });

    HeuresTravail.belongsTo(models.missions, {
      foreignKey: "mission_id",
      as: "mission"
    });
  };

  return HeuresTravail;
};
