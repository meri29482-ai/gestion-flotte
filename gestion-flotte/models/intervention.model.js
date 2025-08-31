module.exports = (sequelize, DataTypes) => {
  const Intervention = sequelize.define("intervention", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    vehicule_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priorite: {
      type: DataTypes.ENUM("Urgent", "Normal"),
      allowNull: false
    },
    type_demande: {
      type: DataTypes.ENUM("achat", "maintenance"),
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM("En attente", "En cours", "Terminé", "Annulé"),
      defaultValue: "En attente"
    },
    date_prevue: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_en_cours: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    cout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    // ✅ Nouvelle colonne pour stocker le chemin du PDF exporté
    fichier_pdf: {
      type: DataTypes.STRING,   // Stocke le chemin ou l’URL du fichier PDF
      allowNull: true
    }
  }, {
    timestamps: false,
    underscored: true,
    tableName: "intervention"
  });

  Intervention.associate = (models) => {
    Intervention.belongsTo(models.vehicules, {
      foreignKey: "vehicule_id",
      as: "vehicule"
    });

    // Une intervention peut être liée à un achat
    Intervention.hasOne(models.Achat, {
      foreignKey: "intervention_id",
      as: "achat"
    });

    // Une intervention peut être liée à une maintenance
    Intervention.hasOne(models.maintenance, {
      foreignKey: "intervention_id",
      as: "maintenance"
    });
  };

  return Intervention;
};
