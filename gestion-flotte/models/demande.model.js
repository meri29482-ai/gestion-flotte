module.exports = (sequelize, DataTypes) => {
  const Demande = sequelize.define("demande", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    n_ordre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '0'
    },
    type_trajet: {
      type: DataTypes.ENUM("ALLER_SIMPLE", "ALLER_RETOUR"),
      allowNull: false,
      defaultValue: "ALLER_SIMPLE"
    },
    utilisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_heure_debut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date_heure_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    itineraire: {
      type: DataTypes.TEXT
    },
    observation: {
      type: DataTypes.TEXT
    },
    etat: {
      type: DataTypes.ENUM('EN COURS', 'PLANIFIER', 'TERMINER', 'REJETER','ANNULER'),
      defaultValue: 'EN COURS'
    }
  }, {
    tableName: 'demande',
    timestamps: false
  });

  // ✅ Associations
  Demande.associate = models => {
    // 🔁 Demande appartient à un utilisateur
    Demande.belongsTo(models.utilisateurs, {
      foreignKey: "utilisateur_id",
      as: "utilisateur"
    });

    // 🔁 Une demande peut avoir une mission
    Demande.hasOne(models.missions, {
      foreignKey: "demande_id",
      as: "mission"
    });
  };

  return Demande;
};
