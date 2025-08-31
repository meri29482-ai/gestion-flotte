module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define("Document", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vehicule_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    chauffeur_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type_document: {
      type: DataTypes.ENUM(
        "carte_grise",
        "assurance",
        "controle_technique",
        "permis_conduire",
        "certificat_medical",
        "certificat_capacite"
      ),
      allowNull: false
    },
    fichier_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_expiration: {
      type: DataTypes.DATE,
      allowNull: true
    },
    statut: {
      type: DataTypes.ENUM("valide", "expiré", "à vérifier"),
      defaultValue: "valide"
    },
    cree_le: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    maj_le: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "documents",
    timestamps: false
  });

  // ✅ AJOUTER ICI L’ASSOCIATION À CHAUFFEUR
  Document.associate = models => {
    Document.belongsTo(models.chauffeurs, {
      foreignKey: "chauffeur_id",
      as: "chauffeur"
    });

    Document.belongsTo(models.vehicules, {
      foreignKey: "vehicule_id",
      as: "vehicule"
    });
  };

  return Document;
};
