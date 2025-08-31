module.exports = (sequelize, DataTypes) => {
  const Maintenance = sequelize.define("maintenance", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    intervention_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    type_principal: {
      type: DataTypes.ENUM('Préventive', 'Curative'),
      allowNull: false
    },

    categorie: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    duree: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    observation: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },

    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },

    date_modification: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    underscored: true,
    tableName: "maintenance",
    hooks: {
      beforeUpdate: (maintenance) => {
        maintenance.date_modification = new Date();
      }
    }
  });

  Maintenance.associate = (models) => {
    Maintenance.belongsTo(models.Intervention, {
      foreignKey: "intervention_id",
      as: "intervention"
    });
  };

  return Maintenance;
};
