const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  configureWebpack: {
    resolve: {
      alias: {
        '@css': path.resolve(__dirname, 'src/assets/css')
      }
    }
  },

  // Configuration du serveur de développement
  devServer: {       // Active HTTPS
    host: 'localhost',  // Nom de l'hôte
    port: 8080,         // Port (tu peux changer si besoin)
    hot: true,
    open: true          // Ouvre automatiquement le navigateur
  }
});
