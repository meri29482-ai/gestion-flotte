module.exports = (sequelize, DataTypes) => {
  const Conge = sequelize.define("conge", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_chauffeur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Annuel', 'Maladie', 'Urgence', 'Sans solde', 'Autre'),
      allowNull: false
    },
    date_debut: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('En attente', 'Approuvé', 'Rejeté'),
      defaultValue: 'En attente'
    },
    remarque: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "conges",
    timestamps: false
  });

  Conge.associate = (models) => {
    Conge.belongsTo(models.chauffeurs, {
      foreignKey: "chauffeur_id",
      as: "chauffeur"
    });
  };

  return Conge;
};
