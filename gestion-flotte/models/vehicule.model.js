module.exports = (sequelize, DataTypes) => {
  const Vehicule = sequelize.define("Vehicule", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    immatriculation: {
  type: DataTypes.STRING(20),
  allowNull: false,
  unique: {
    name: 'uk_vehicules_immatriculation',
    msg: 'Immatriculation déjà utilisée'
  }
},

    marque: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    modele: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    type: {
      type: DataTypes.STRING(30),
      allowNull: true
    },

    etat: {
      type: DataTypes.ENUM('DISPO', 'MAINTENANCE', 'HORS_SERVICE', 'EN_MISSION'),
      defaultValue: 'DISPO'
    },

    kilometrage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    photo_url: {
  type: DataTypes.STRING,
},

    date_achat: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "vehicules",
    timestamps: false
  });

  Vehicule.associate = models => {
    Vehicule.hasMany(models.documents, {
      foreignKey: "vehicule_id",
      as: "documents"
    });

    Vehicule.hasMany(models.missions, {
      foreignKey: "vehicule_id",
      as: "missions"
    });
  };

  return Vehicule;
};
