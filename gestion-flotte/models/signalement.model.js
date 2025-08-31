module.exports = (sequelize, DataTypes) => {
  const Signalement = sequelize.define("signalements", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chauffeur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date_signalement: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    intervention_demandee: {
      type: DataTypes.ENUM('oui', 'non'),
      allowNull: false,
      defaultValue: 'non',
    },
    intervention_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mission_continue: {
      type: DataTypes.ENUM('oui', 'non'),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  // Associations
  Signalement.associate = (models) => {
    Signalement.belongsTo(models.missions, {
      foreignKey: "mission_id",
      as: "mission",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    Signalement.belongsTo(models.chauffeurs, {
      foreignKey: "chauffeur_id",
      as: "chauffeur",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };

  return Signalement;
};
