const app = require("./app");
const db = require('./models');
require("dotenv").config();
const os = require('os');

const PORT = process.env.PORT || 3000;

// Fonction pour récupérer l'IP locale (IPv4 non loopback)
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

db.sequelize.sync({ alter: true })  // sync une seule fois ici
  .then(() => {
    const ip = getLocalIp();
    console.log("✅ Base de données synchronisée");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://${ip}:${PORT} (ou localhost:${PORT})`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de synchronisation de la base de données :", err);
  });
