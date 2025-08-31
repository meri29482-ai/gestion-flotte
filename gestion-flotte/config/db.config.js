module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "",
  DB: "parc",
  dialect: "mysql",
  logging: false,       // met true pour voir les requêtes SQL
  define: {
    freezeTableName: true,  // empêche sequelize de pluraliser les noms de tables
    timestamps: false,       // si tu n'as pas les colonnes createdAt/updatedAt
  },
};
