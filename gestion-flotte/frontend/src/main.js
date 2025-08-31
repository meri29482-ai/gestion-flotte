import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/css/main.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// JS Bootstrap
import 'bootstrap';

import i18n from './i18n';

// Création de l'application
const app = createApp(App);

app.use(router);
app.use(i18n);

app.mount('#app');
