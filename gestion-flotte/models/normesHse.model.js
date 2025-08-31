// models/normesHse.model.js
module.exports = (sequelize, DataTypes) => {
  const NormeHse = sequelize.define("NormeHse", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fichier: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(20),
      defaultValue: '1.0',
    },
    type: {
      type: DataTypes.ENUM('Sécurité','Santé','Environnement','Temps de conduite','Autre'),
      defaultValue: 'Autre',
    },
    description: {
      type: DataTypes.TEXT,
    },
    date_creation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    date_fichier: {
      type: DataTypes.DATEONLY,
    },
    statut: {
      type: DataTypes.ENUM('Actif','Obsolète'),
      defaultValue: 'Actif',
    },
    lien_externe: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  }, {
    tableName: 'normes_hse',
    timestamps: false, // on gère manuellement date_creation
  });

  return NormeHse;
};
