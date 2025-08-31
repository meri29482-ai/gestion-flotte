<template>
  <div class="chauffeur-dashboard">
    <!-- Header avec rafraîchissement -->
    <div class="dashboard-header">
      <div class="header-title">
        <i class="bi bi-speedometer2"></i>
        <h1>Tableau de bord Chauffeur</h1>
      </div>
      <button @click="fetchMissions" class="btn-refresh">
        <i class="bi bi-arrow-clockwise"></i> Actualiser
      </button>
    </div>

    <!-- Cartes de résumé -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon bg-light-primary">
          <i class="bi bi-list-task text-primary"></i>
        </div>
        <div class="card-content">
          <h3>Total Missions</h3>
          <p>{{ missions.length }}</p>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon bg-light-info">
          <i class="bi bi-play-circle text-info"></i>
        </div>
        <div class="card-content">
          <h3>En cours</h3>
          <p>{{ missionsEnCours.length }}</p>
          <small v-if="missionsEnCours.length > 0">Dernière : {{ formatDate(missionsEnCours[0].demande.date_heure_debut) }}</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon bg-light-warning">
          <i class="bi bi-hourglass text-warning"></i>
        </div>
        <div class="card-content">
          <h3>À venir</h3>
          <p>{{ missionsEnAttente.length }}</p>
          <small v-if="prochaineMission">Prochaine : {{ formatDate(prochaineMission.demande.date_heure_debut) }}</small>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon bg-light-success">
          <i class="bi bi-check-circle text-success"></i>
        </div>
        <div class="card-content">
          <h3>Terminées</h3>
          <p>{{ missionsTerminees.length }}</p>
          <small v-if="missionsTerminees.length > 0">Dernière : {{ formatDate(missionsTerminees[0].demande.date_heure_fin) }}</small>
        </div>
      </div>
    </div>

     <!-- Mission en cours -->
    <div v-if="missionsEnCours.length > 0" class="current-mission">
      <div class="section-title">
        <i class="bi bi-play-fill"></i>
        <h2>Mission en cours</h2>
      </div>
      
      <div class="mission-card">
        <div class="mission-header">
          <h3>{{ missionsEnCours[0].demande.destination }}</h3>
          <span :class="'status-badge ' + getStatusClass(missionsEnCours[0].etat)">
            {{ formatStatus(missionsEnCours[0].etat) }}
          </span>
        </div>
        
        <div class="mission-details">
          <div class="detail-item">
            <i class="bi bi-car-front"></i>
            <div>
              <small>Véhicule</small>
              <p>{{ missionsEnCours[0].vehicule.marque }} {{ missionsEnCours[0].vehicule.modele }}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <i class="bi bi-calendar"></i>
            <div>
              <small>Départ</small>
              <p>{{ formatDateTime(missionsEnCours[0].demande.date_heure_debut) }}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <i class="bi bi-clock"></i>
            <div>
              <small>Temps écoulé</small>
              <p>{{ calculateDuration(missionsEnCours[0].demande.date_heure_debut) }}</p>
            </div>
          </div>
        </div>
        
        <div class="mission-actions">
          <button @click="terminerMission(missionsEnCours[0])" class="btn btn-danger">
            <i class="bi bi-stop-fill"></i> Terminer la mission
          </button>
          <button @click="showMissionMap(missionsEnCours[0])" class="btn btn-outline-primary">
            <i class="bi bi-map"></i> Voir itinéraire
          </button>
        </div>
      </div>
    </div>

    <!-- Prochaine Mission -->
    <div v-if="prochaineMission" class="next-mission">
      <div class="section-title">
        <i class="bi bi-arrow-right-circle"></i>
        <h2>Prochaine Mission</h2>
      </div>
      
      <div class="mission-card alert">
        <div class="mission-header">
          <h3>{{ prochaineMission.demande.destination }}</h3>
          <div class="countdown">
            <i class="bi bi-alarm"></i>
            Départ dans {{ calculateTimeBeforeMission(prochaineMission.demande.date_heure_debut) }}
          </div>
        </div>
        
        <div class="mission-details">
          <div class="detail-item">
            <i class="bi bi-calendar-date"></i>
            <div>
              <small>Date de départ</small>
              <p>{{ formatDateTime(prochaineMission.demande.date_heure_debut) }}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <i class="bi bi-car-front"></i>
            <div>
              <small>Véhicule attribué</small>
              <p>{{ prochaineMission.vehicule.marque }} {{ prochaineMission.vehicule.modele }}</p>
            </div>
          </div>
        </div>
        
        <div class="mission-actions">
          <button @click="goDetails(prochaineMission)" class="btn btn-primary">
            <i class="bi bi-clipboard-check"></i> voir détails
          </button>
        </div>
      </div>
    </div>

    

    <!-- Dernières missions -->
    <div class="section-title">
      <i class="bi bi-clock-history"></i>
      <h2>Dernières missions</h2>
    </div>

    <div class="recent-missions">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="latestMissions.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Aucune mission récente</p>
      </div>

      <table v-else class="missions-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Véhicule</th>
            <th>Destination</th>
            <th>Dates</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mission, index) in latestMissions" :key="mission.id">
            <td class="mission-id">{{ index + 1 }}</td>
            <td class="vehicle-info">
              <div class="vehicle-icon">
                <i class="bi bi-car-front"></i>
              </div>
              <div>
                <strong>{{ mission.vehicule.marque }} {{ mission.vehicule.modele }}</strong>
                <small>{{ mission.vehicule.immatriculation }}</small>
              </div>
            </td>
            <td class="destination">
              <i class="bi bi-geo-alt"></i>
              {{ mission.demande.destination }}
            </td>
            <td class="dates">
              <div>
                <strong>Départ :</strong> {{ formatDateTime(mission.demande.date_heure_debut) }}
              </div>
              <div>
                <strong>Retour :</strong> {{ formatDateTime(mission.demande.date_heure_fin) }}
              </div>
            </td>
            <td>
              <span :class="'status-badge ' + getStatusClass(mission.etat)">
                <i :class="getStatusIcon(mission.etat)"></i>
                {{ formatStatus(mission.etat) }}
              </span>
            </td>
            <td class="actions">
              <button @click="viewDetails(mission)" class="btn-action" title="Détails">
                <i class="bi bi-eye"></i>
              </button>
              <button 
                v-if="mission.etat === 'en cours'" 
                @click="showMissionMap(mission)" 
                class="btn-action" 
                title="Itinéraire"
              >
                <i class="bi bi-map"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

   

    

    <!-- Modal Détails -->
    <div v-if="selectedMission" class="modal-overlay" @click.self="selectedMission = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Détails de la mission</h3>
          <button @click="selectedMission = null" class="btn-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="detail-row">
            <div class="detail-col">
              <h4><i class="bi bi-info-circle"></i> Informations</h4>
              <ul class="detail-list">
                <li>
                  <i class="bi bi-geo-alt"></i>
                  <strong>Destination :</strong> {{ selectedMission.demande.destination }}
                </li>
                <li>
                  <i class="bi bi-calendar"></i>
                  <strong>Départ :</strong> {{ formatDateTime(selectedMission.demande.date_heure_debut) }}
                </li>
                <li>
                  <i class="bi bi-calendar-check"></i>
                  <strong>Retour :</strong> {{ formatDateTime(selectedMission.demande.date_heure_fin) }}
                </li>
                <li>
                  <i class="bi bi-clock"></i>
                  <strong>Durée :</strong> {{ calculateDuration(selectedMission.demande.date_heure_debut, selectedMission.demande.date_heure_fin) }}
                </li>
              </ul>
            </div>
            
            <div class="detail-col">
              <h4><i class="bi bi-car-front"></i> Véhicule</h4>
              <div class="vehicle-details">
                <div class="vehicle-icon-lg">
                  <i class="bi bi-car-front"></i>
                </div>
                <div>
                  <p class="vehicle-model">{{ selectedMission.vehicule.marque }} {{ selectedMission.vehicule.modele }}</p>
                  <p class="vehicle-plate">{{ selectedMission.vehicule.immatriculation }}</p>
                  <p class="vehicle-km">
                    <i class="bi bi-speedometer2"></i>
                    {{ selectedMission.vehicule.kilometrage }} km
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedMission.notes" class="mission-notes">
            <h4><i class="bi bi-journal-text"></i> Notes</h4>
            <p>{{ selectedMission.notes }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="selectedMission = null" class="btn btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from 'xlsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: "ChauffeurDashboard",
  data() {
    return {
      missions: [],
      loading: false,
      selectedMission: null,
      currentTime: new Date(),
      currentWeather: {
        temp: '--',
        description: 'Chargement...',
        humidity: '--',
        windSpeed: '--',
        visibility: '--'
      },
      weatherIcon: '',
      weatherAlerts: [],
      map: null,
      mapInitialized: false
    };
  },
  computed: {
    missionsEnCours() {
      return this.missions.filter(m => m.etat === 'en cours')
        .sort((a, b) => new Date(b.demande.date_heure_debut) - new Date(a.demande.date_heure_debut));
    },
    missionsEnAttente() {
      return this.missions.filter(m => m.etat === 'en attente')
        .sort((a, b) => new Date(a.demande.date_heure_debut) - new Date(b.demande.date_heure_debut));
    },
    missionsTerminees() {
      return this.missions.filter(m => m.etat === 'terminer')
        .sort((a, b) => new Date(b.demande.date_heure_fin) - new Date(a.demande.date_heure_fin));
    },
    latestMissions() {
      return [...this.missions]
        .sort((a, b) => new Date(b.demande.date_heure_debut) - new Date(a.demande.date_heure_debut))
        .slice(0, 5);
    },
    prochaineMission() {
      return this.missionsEnAttente.length > 0 ? this.missionsEnAttente[0] : null;
    },
    currentVehicle() {
      return this.missionsEnCours.length > 0 ? this.missionsEnCours[0].vehicule : null;
    },
    totalKilometers() {
      return this.missionsTerminees.reduce((sum, mission) => {
        return sum + (parseInt(mission.kilometrage) || 0);
      }, 0);
    },
    totalDrivingTime() {
      const hours = this.missionsTerminees.reduce((sum, mission) => {
        const start = new Date(mission.demande.date_heure_debut);
        const end = new Date(mission.demande.date_heure_fin);
        return sum + ((end - start) / (1000 * 60 * 60)); // en heures
      }, 0);
      
      return hours.toFixed(1);
    },
    averageDailyTime() {
      if (this.missionsTerminees.length === 0) return 0;
      
      const firstMissionDate = new Date(this.missionsTerminees[this.missionsTerminees.length - 1].demande.date_heure_fin);
      const daysActive = (new Date() - firstMissionDate) / (1000 * 60 * 60 * 24);
      
      return (this.totalDrivingTime / daysActive).toFixed(1);
    },
    missionsPerWeek() {
      if (this.missionsTerminees.length === 0) return 0;
      
      const firstMissionDate = new Date(this.missionsTerminees[this.missionsTerminees.length - 1].demande.date_heure_fin);
      const daysActive = (new Date() - firstMissionDate) / (1000 * 60 * 60 * 24);
      
      return (this.missionsTerminees.length / (daysActive / 7)).toFixed(1);
    },
    missionFrequency() {
      // Pourcentage arbitraire pour la démo
      return Math.min(100, this.missionsPerWeek * 20);
    }
  },
  methods: {
    async fetchMissions() {
      try {
        this.loading = true;
        const token = localStorage.getItem("token");
        const utilisateur = JSON.parse(localStorage.getItem("user"));

        if (!token || !utilisateur?.nom || !utilisateur?.prenom) return;

        const response = await axios.get("http://localhost:3000/api/missions", {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.missions = response.data.filter(m =>
          m.chauffeur?.utilisateur?.nom === utilisateur.nom &&
          m.chauffeur?.utilisateur?.prenom === utilisateur.prenom
        );

        // Initialiser la carte après avoir chargé les missions
        this.$nextTick(() => {
          this.initMap();
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des missions :", error);
        this.$toast.error("Erreur lors du chargement des missions");
      } finally {
        this.loading = false;
      }
    },
    initMap() {
      if (this.mapInitialized || this.missions.length === 0) return;
      
      try {
        this.map = L.map('mission-map').setView([46.2276, 2.2137], 5); // Centré sur la France
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Ajouter des marqueurs pour les missions
        this.missionsTerminees.slice(0, 10).forEach(mission => {
          if (mission.demande.latitude && mission.demande.longitude) {
            L.circleMarker([mission.demande.latitude, mission.demande.longitude], {
              radius: 8,
              fillColor: "#198754",
              color: "#fff",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(this.map)
              .bindPopup(`<b>${mission.demande.destination}</b><br>${this.formatDate(mission.demande.date_heure_fin)}`);
          }
        });

        this.missionsEnAttente.slice(0, 10).forEach(mission => {
          if (mission.demande.latitude && mission.demande.longitude) {
            L.circleMarker([mission.demande.latitude, mission.demande.longitude], {
              radius: 8,
              fillColor: "#ffc107",
              color: "#fff",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(this.map)
              .bindPopup(`<b>${mission.demande.destination}</b><br>${this.formatDate(mission.demande.date_heure_debut)}`);
          }
        });

        this.mapInitialized = true;
      } catch (error) {
        console.error("Erreur initialisation carte:", error);
      }
    },
    async fetchWeatherData() {
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: 'Paris,fr',
            appid: 'YOUR_API_KEY', // Remplacez par votre clé API
            units: 'metric',
            lang: 'fr'
          }
        });
        
        this.currentWeather = {
          temp: Math.round(response.data.main.temp),
          description: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          windSpeed: Math.round(response.data.wind.speed * 3.6), // conversion m/s -> km/h
          visibility: (response.data.visibility / 1000).toFixed(1)
        };
        
        this.weatherIcon = `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`;
        
        // Simuler une alerte météo pour la démo
        if (response.data.weather[0].main === 'Rain') {
          this.weatherAlerts = ['Alerte pluie - Prudence sur la route'];
        }
      } catch (error) {
        console.error("Erreur de récupération météo:", error);
        this.currentWeather.description = "Données météo indisponibles";
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    formatDateTime(dateStr) {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatStatus(etat) {
      switch (etat) {
        case 'en cours': return 'En cours';
        case 'en attente': return 'Planifiée';
        case 'terminer': return 'Terminée';
        case 'annuler' : return 'annuler';
        default: return etat;
      }
    },
    getStatusClass(etat) {
      switch (etat) {
        case 'en cours': return 'status-en-cours';
        case 'en attente': return 'status-en-attente';
        case 'terminer': return 'status-terminee';
        case 'annuler' : return 'status-annuler';
        default: return '';
      }
    },
    getStatusIcon(etat) {
      switch (etat) {
        case 'en cours': return 'bi bi-play-fill';
        case 'en attente': return 'bi bi-hourglass';
        case 'terminer': return 'bi bi-check-circle-fill';
        case 'annuler' : return 'bi bi-x-circle-fill';
        default: return '';
      }
    },
    calculateDuration(startStr, endStr = null) {
      if (!startStr) return 'N/A';
      
      const end = endStr ? new Date(endStr) : this.currentTime;
      const start = new Date(startStr);
      const diffMs = end - start;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? `${minutes}m` : ''}`;
      } else {
        return `${minutes}m`;
      }
    },
    calculateTimeBeforeMission(startDate) {
      const now = new Date();
      const missionStart = new Date(startDate);
      const diff = missionStart - now;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}j ${hours}h`;
      if (hours > 0) return `${hours}h`;
      return "Moins d'une heure";
    },
    calculateEquivalentDistance() {
      const parisMarseille = 775; // km
      const equivalent = this.totalKilometers / parisMarseille;
      return equivalent.toFixed(1);
    },
    viewDetails(mission) {
      this.selectedMission = mission;
    },
    showMissionMap(mission) {
      localStorage.setItem('currentMission', JSON.stringify(mission));
      this.$router.push('/chauffeur/mission-map');
    },
    async terminerMission(mission) {
      localStorage.setItem('currentMission', JSON.stringify(mission));
      this.$router.push('/chauffeur/missions');
    },
    goDetails(mission) {
      localStorage.setItem('currentMission', JSON.stringify(mission));
      this.$router.push('/chauffeur/missions');
    },
    async downloadDocument(type) {
      try {
        this.$toast.info(`Préparation du téléchargement: ${type}`);
        // Simuler un délai de téléchargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.$toast.success(`${type} prêt au téléchargement`);
      } catch (error) {
        console.error(`Erreur téléchargement ${type}:`, error);
        this.$toast.error(`Échec du téléchargement`);
      }
    },
    showVehicleDocs(vehicle) {
      if (!vehicle) {
        this.$toast.warning("Aucun véhicule actuellement assigné");
        return;
      }
      this.$toast.info(`Affichage des documents pour ${vehicle.marque} ${vehicle.modele}`);
    },
    exportMissionHistory() {
      try {
        // Préparer les données pour l'export
        const data = this.missionsTerminees.map(mission => ({
          'Date Début': this.formatDateTime(mission.demande.date_heure_debut),
          'Date Fin': this.formatDateTime(mission.demande.date_heure_fin),
          'Destination': mission.demande.destination,
          'Véhicule': `${mission.vehicule.marque} ${mission.vehicule.modele}`,
          'Immatriculation': mission.vehicule.immatriculation,
          'Kilométrage': mission.kilometrage,
          'Durée': this.calculateDuration(mission.demande.date_heure_debut, mission.demande.date_heure_fin)
        }));

        // Créer un nouveau classeur
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Ajouter la feuille au classeur
        XLSX.utils.book_append_sheet(wb, ws, "Historique Missions");
        
        // Générer le fichier Excel
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `historique_missions_${date}.xlsx`);
        
        this.$toast.success("Export Excel réussi");
      } catch (error) {
        console.error("Erreur lors de l'export Excel:", error);
        this.$toast.error("Erreur lors de l'export");
      }
    }
  },
  mounted() {
    this.fetchMissions();
    this.fetchWeatherData();
    
    // Mettre à jour l'heure actuelle chaque minute pour le calcul de durée
    this.interval = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
    if (this.map) {
      this.map.remove();
    }
  }
};
</script>

<style scoped>
.chauffeur-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title i {
  font-size: 1.8rem;
  color: #0d6efd;
}

.header-title h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.btn-refresh {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background-color: #e9ecef;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-content h3 {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.card-content p {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #212529;
}

.card-content small {
  font-size: 0.75rem;
  color: #6c757d;
}

.bg-light-primary {
  background-color: rgba(13, 110, 253, 0.1);
}
.bg-light-info {
  background-color: rgba(13, 202, 240, 0.1);
}
.bg-light-warning {
  background-color: rgba(255, 193, 7, 0.1);
}
.bg-light-success {
  background-color: rgba(25, 135, 84, 0.1);
}

.text-primary {
  color: #0d6efd;
}
.text-info {
  color: #0dcaf0;
}
.text-warning {
  color: #ffc107;
}
.text-success {
  color: #198754;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-title i {
  font-size: 1.25rem;
  color: #0d6efd;
}

.section-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.next-mission .mission-card.alert {
  border-left: 4px solid #ffc107;
  background-color: #fff8e1;
  margin-bottom: 2rem;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #ff9800;
}

.map-container {
  position: relative;
  margin-bottom: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.map-legend {
  display: flex;
  gap: 1rem;
  justify-content: center;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
}

.stat-card h3 {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-card p {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #212529;
}

.stat-card small {
  font-size: 0.75rem;
  color: #6c757d;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.progress {
  height: 100%;
  border-radius: 4px;
  background-color: #0d6efd;
  transition: width 0.5s ease;
}

.recent-missions {
  position: relative;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 3rem;
}

.loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 0.75rem;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.missions-table {
  width: 100%;
  border-collapse: collapse;
}

.missions-table th {
  text-align: left;
  padding: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #dee2e6;
}

.missions-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f1f1;
  vertical-align: middle;
}

.mission-id {
  font-weight: 600;
  color: #6c757d;
}

.vehicle-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vehicle-icon {
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d6efd;
}

.destination i {
  color: #0d6efd;
  margin-right: 0.5rem;
}

.dates {
  font-size: 0.9rem;
}

.dates div {
  margin-bottom: 0.25rem;
}

.dates strong {
  font-weight: 500;
  color: #6c757d;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-en-cours {
  background-color: #e3f2fd;
  color: #0d6efd;
}

.status-annuler {
  background-color: #e3f2fd;
  color: #ca0000;
}


.status-en-attente {
  background-color: #fff8e1;
  color: #ff9800;
}

.status-terminee {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #f8f9fa;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background-color: #e9ecef;
  color: #0d6efd;
}

.current-mission {
  margin-bottom: 3rem;
}

.mission-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f1f1;
}

.mission-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.mission-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.detail-item i {
  font-size: 1.25rem;
  color: #0d6efd;
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-item small {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.detail-item p {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.mission-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f1f1;
}

.documents-section {
  margin-bottom: 2rem;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.document-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f1f1f1;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.document-card i {
  font-size: 2rem;
  color: #0d6efd;
  margin-bottom: 0.5rem;
}

.document-card span {
  font-size: 0.9rem;
}

.weather-section {
  margin-bottom: 2rem;
}

.weather-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.weather-main img {
  width: 64px;
  height: 64px;
}

.weather-main h3 {
  font-size: 2rem;
  margin: 0;
}

.weather-main p {
  margin: 0;
  text-transform: capitalize;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  font-size: 0.9rem;
}

.weather-details div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.weather-alert {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff3cd;
  border-radius: 6px;
  display: flex;
  gap: 0.75rem;
  color: #856404;
}

.weather-alert i {
  color: #fd7e14;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-col {
  flex: 1;
  min-width: 0;
}

.detail-col h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-list li i {
  color: #0d6efd;
  font-size: 1.1rem;
}

.vehicle-details {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.vehicle-icon-lg {
  width: 64px;
  height: 64px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #0d6efd;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
}

.vehicle-model {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.vehicle-plate {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.vehicle-km {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.mission-notes {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-top: 1.5rem;
}

.mission-notes h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f1f1;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #bb2d3b;
}

.btn-outline-primary {
  background-color: transparent;
  border: 1px solid #0d6efd;
  color: #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

@media (max-width: 768px) {
  .detail-row {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .missions-table th, 
  .missions-table td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
  
  .mission-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .documents-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .chauffeur-dashboard {
    padding: 1rem;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .missions-table {
    display: block;
    overflow-x: auto;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
  }
}
</style>