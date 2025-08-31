module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define("utilisateur", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    matricule: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    numero_telephone: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
       unique: true,
      validate: {
        isEmail: true
      }
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fonction: {
      type: DataTypes.STRING(100)
    },
    role: {
      type: DataTypes.ENUM(
        "ADMIN",
        "RESPONSABLE_PARC",
        "CHAUFFEUR",
        "RESPONSABLE_HSE",
        "DEMANDEUR",
        "MAINTENANCE",
        "MANAGER"
      ),
      allowNull: false,
      defaultValue: "DEMANDEUR"
    },
    etat: {
      type: DataTypes.ENUM("ACTIF", "INACTIF"),
      defaultValue: "ACTIF"
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    action: {
      type: DataTypes.ENUM("lecture","ecriture"),
      allowNull: false,
      defaultValue: "lecture"
    }
  }, {
    tableName: "utilisateurs",
    timestamps: false
  });

  return Utilisateur;
};
