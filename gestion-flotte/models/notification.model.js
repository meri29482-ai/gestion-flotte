// models/notification.model.js

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    type: {
      type: DataTypes.ENUM('INFO', 'ALERTE', 'MISSION', 'HSE', 'DOCUMENT', 'AUTRE'),
      defaultValue: 'INFO',
      allowNull: false
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    date_envoi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    utilisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recepteur_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: false
  });

  Notification.associate = (models) => {
    // 🔹 Auteur de la notification
    Notification.belongsTo(models.utilisateurs, {
      foreignKey: "utilisateur_id",
      as: "auteur",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // 🔸 Destinataire de la notification
    Notification.belongsTo(models.utilisateurs, {
      foreignKey: "recepteur_id",
      as: "recepteur",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  };

  return Notification;
};
