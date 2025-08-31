module.exports = (sequelize, DataTypes) => {
  const Piece = sequelize.define("piece", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    achat_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    nom_piece: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    prix_unitaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    observation: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    }
  }, {
    timestamps: false,
    underscored: true,
    tableName: "piece"
  });

  Piece.associate = (models) => {
    Piece.belongsTo(models.Achat, {
      foreignKey: "achat_id",
      as: "achat"
    });
  };

  return Piece;
};
