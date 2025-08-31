module.exports = (sequelize, DataTypes) => {
  const Achat = sequelize.define("achat", {
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

    delai: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },

    fournisseur: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    timestamps: false,
    underscored: true,
    tableName: "achat"
  });

  Achat.associate = (models) => {
    // Achat appartient à une intervention
    Achat.belongsTo(models.Intervention, {
      foreignKey: "intervention_id",
      as: "intervention"
    });

    // Achat a plusieurs pièces (relation manquante ⚠️)
   Achat.hasMany(models.Piece, {
  foreignKey: "achat_id",
  as: "piece"
});
  };

  return Achat;
};
