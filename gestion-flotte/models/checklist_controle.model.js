module.exports = (sequelize, DataTypes) => {
  const ChecklistControle = sequelize.define("checklist_controle", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vehicule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chauffeur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type_controle: {
      type: DataTypes.ENUM('AVANT_MISSION', 'APRES_MISSION'),
      allowNull: false,
    },
    date_controle: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    niveau_huile: {
      type: DataTypes.ENUM('CORRECT','BAS','VIDE'),
      allowNull: true,
    },
    freins: {
      type: DataTypes.ENUM('FONCTIONNELS','INEFFICACES','DEFAILLANTS'),
      allowNull: true,
    },
    pression_pneus: {
      type: DataTypes.ENUM('NORMALE','BASSE','A_PLAT'),
      allowNull: true,
    },
    phares: {
      type: DataTypes.ENUM('FONCTIONNELS','INEFFICACES','DEFAILLANTS'),
      allowNull: true,
    },
    ceintures: {
      type: DataTypes.ENUM('OK','NON_CONFORMES'),
      allowNull: true,
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    niveau_carburant: {
      type: DataTypes.ENUM('PLEIN', '3/4', '1/2', '1/4', 'VIDE'),
      allowNull: true,
    },
    remarques: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valide: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  ChecklistControle.associate = (models) => {
    ChecklistControle.belongsTo(models.missions, { foreignKey: "mission_id" });
    ChecklistControle.belongsTo(models.vehicules, { foreignKey: "vehicule_id" });
    ChecklistControle.belongsTo(models.chauffeurs, { foreignKey: "chauffeur_id" });
  };

  return ChecklistControle;
};
