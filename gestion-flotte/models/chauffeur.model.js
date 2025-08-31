module.exports = (sequelize, DataTypes) => {
  const Chauffeur = sequelize.define("Chauffeur", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    societe: {
      type: DataTypes.ENUM('SONATRACH', 'SOTRAZ'),
      defaultValue: 'SONATRACH',
    },

    utilisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    numero_permis: {
      type: DataTypes.STRING(30),
      allowNull: true
    },

    adresse: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    etat: {
      type: DataTypes.ENUM('Dispo', 'en mission', 'hors service'),
      defaultValue: 'Dispo'
     },
     type_permis: {
      type: DataTypes.ENUM('C', 'D'),
      allowNull: true,
      defaultValue: 'D'
    }
  }, {
    tableName: 'chauffeurs',  
    timestamps: false
  });

  Chauffeur.associate = models => {
    Chauffeur.belongsTo(models.utilisateurs, {
      foreignKey: "utilisateur_id",
      as: "utilisateur"
    });

    Chauffeur.hasMany(models.missions, {
      foreignKey: "chauffeur_id",
      as: "mission"
    });

    Chauffeur.hasMany(models.documents, {
      foreignKey: "chauffeur_id",
      as: "documents"
    });
  };


  return Chauffeur;
};
