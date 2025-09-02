module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      vehicule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      chauffeur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      intervention_id: {   // ✅ ajout de l’ID intervention
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type_document: {
        type: DataTypes.ENUM(
          "carte_grise",
          "assurance",
          "controle_technique",
          "permis_conduire",
          "certificat_medical",
          "certificat_capacite",
          "demande_achat" ,
          "demande_maintenance"
        ),
        allowNull: false,
      },
      fichier_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
       date_creation: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      date_expiration: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      statut: {
        type: DataTypes.ENUM("valide", "expiré", "à vérifier"),
        defaultValue: "valide",
      },
      cree_le: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      maj_le: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "documents",
      timestamps: false,
    }
  );

  // ✅ Associations
  Document.associate = (models) => {
    Document.belongsTo(models.chauffeurs, {
      foreignKey: "chauffeur_id",
      as: "chauffeur",
    });

    Document.belongsTo(models.vehicules, {
      foreignKey: "vehicule_id",
      as: "vehicule",
    });

    Document.belongsTo(models.Intervention, {   // ✅ nouvelle relation
      foreignKey: "intervention_id",
      as: "intervention",
    });
  };

  return Document;
};
