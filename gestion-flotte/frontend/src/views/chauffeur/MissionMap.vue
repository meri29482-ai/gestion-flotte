<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Sidebar -->
      <div class="col-md-4 p-3 bg-light" style="height: 100vh; overflow-y: auto;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">{{ $t('missionDetails.title') }}</h4>
          <div>
            <button class="btn btn-sm btn-outline-secondary" @click="$router.go(-1)">
              <i class="bi bi-arrow-left"></i> {{ $t('general.back') }}
            </button>
          </div>
        </div>

        <!-- Mission Details Card -->
        <div v-if="mission" class="card mb-3 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ mission.demande.destination }}</h5>
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-calendar me-2 text-muted"></i>
              <span class="text-muted">
                {{ formatDate(mission.demande.date_heure_debut) }} - 
                {{ formatDate(mission.demande.date_heure_fin) }}
              </span>
            </div>
            <div class="d-flex align-items-center">
              <i class="bi bi-car-front me-2 text-muted"></i>
              <span class="text-muted">
                {{ mission.vehicule.marque }} {{ mission.vehicule.modele }}
                ({{ mission.vehicule.immatriculation }})
              </span>
            </div>
          </div>
        </div>

        <!-- Route Instructions Card -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ $t('route.instructions') }}</h5>
            <button class="btn btn-sm btn-outline-secondary me-2" @click="toggleLanguage">
              <i class="bi bi-translate"></i> {{ currentLanguage === 'fr' ? 'AR' : 'Fr' }}
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="loading" class="p-3 text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('general.loading') }}</span>
              </div>
              <p class="mt-2 mb-0 text-muted">{{ $t('route.calculating') }}</p>
            </div>
            <div v-else-if="routeInstructions.length > 0" class="p-3">
              <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0 bg-primary rounded-circle p-2 me-2">
                  <i class="bi bi-geo-alt-fill text-white"></i>
                </div>
                <div>
                  <p class="mb-0 fw-bold">{{ $t('route.start') }}</p>
                  <small class="text-muted">{{ $t('route.currentPosition') }}</small>
                </div>
              </div>

              <div v-for="(step, index) in routeInstructions" :key="index" class="mb-3">
                <div class="d-flex">
                  <div class="flex-shrink-0 me-3">
                    <div class="position-relative">
                      <div class="vr" style="height: 100%; position: absolute; left: 10px;"></div>
                      <div class="rounded-circle p-1 d-flex align-items-center justify-content-center" 
                           :class="step.isSummary ? 'bg-info' : 'bg-primary'" 
                           style="width: 24px; height: 24px;">
                        <i class="text-white" :class="getStepIcon(step)"></i>
                      </div>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <template v-if="step.isSummary">
                      <h6 class="mb-1 fw-bold">{{ step.instruction }}</h6>
                    </template>
                    <template v-else>
                      <p class="mb-1">{{ step.instruction }}</p>
                      <p class="text-muted small mb-0">
                        <i class="bi bi-signpost"></i> {{ step.distance }} • 
                        <i class="bi bi-clock"></i> {{ step.duration }}
                      </p>
                    </template>
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center mt-3">
                <div class="flex-shrink-0 bg-success rounded-circle p-2 me-2">
                  <i class="bi bi-flag-fill text-white"></i>
                </div>
                <div>
                  <p class="mb-0 fw-bold">{{ $t('route.destination') }}</p>
                  <small class="text-muted">{{ mission.demande.destination }}</small>
                </div>
              </div>
            </div>
            <div v-else class="p-3 text-center text-muted">
              <i class="bi bi-info-circle fs-4"></i>
              <p class="mt-2 mb-0">{{ $t('route.noRoute') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="col-md-8 p-0">
        <div id="map" style="height: 100vh;"></div>
      </div>
    </div>
  </div>
</template>


<script>
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import axios from "axios";

// Correction icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: "MissionMap",
  data() {
    return {
      mission: null,
      map: null,
      routingControl: null,
      routeInstructions: [],
      loading: false,
      positionWatchId: null,
      userPosition: null,
      destinationPosition: null,
      error: null,
      currentLanguage: 'fr',
      voiceEnabled: false,
      speechSynthesis: null,
      utterance: null,
      lastSpokenInstruction: null,
      speakTimeouts: [],
      watchId: null,
      colleagueMarkers: []
    };
  },
  mounted() {
    this.speechSynthesis = window.speechSynthesis || null;
    this.loadMission();

    // 🔹 Rafraîchir la position des collègues toutes les 15 sec
    this.colleagueInterval = setInterval(() => {
      this.loadColleaguesPositions();
    }, 15000);

    if (this.speechSynthesis) {
      if (this.speechSynthesis.onvoiceschanged !== undefined) {
        this.speechSynthesis.onvoiceschanged = () => {
          this.setVoiceForLanguage();
        };
      }
      this.setVoiceForLanguage();
    }
  },
  beforeUnmount() {
    this.cleanup();
    if (this.colleagueInterval) clearInterval(this.colleagueInterval);
  },
  methods: {
    cleanup() {
      if (this.positionWatchId) {
        navigator.geolocation.clearWatch(this.positionWatchId);
      }
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
      }
      if (this.map) {
        this.map.remove();
      }
      this.stopVoiceGuidance();
    },

    async loadMission() {
      try {
        this.loading = true;
        const missionData = localStorage.getItem('currentMission');
        if (!missionData) {
          this.$router.push('/chauffeur/missions');
          return;
        }

        this.mission = JSON.parse(missionData);

        if (!this.mission?.demande?.destination) {
          throw new Error(this.$t('route.noRoute'));
        }

        this.destinationPosition = await this.getCoordinatesFromDestination(this.mission.demande.destination);
        if (!this.destinationPosition) {
          throw new Error(this.$t('route.noRoute'));
        }

        // Démarrer le suivi de position pour la mission
    this.startTracking();

        this.positionWatchId = navigator.geolocation.watchPosition(
          (pos) => {
            this.handlePositionUpdate(pos);
          },
          (err) => {
            console.error("Erreur géolocalisation :", err);
            this.error = this.$t('route.noRoute');
            this.loading = false;
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

      } catch (error) {
        console.error("Erreur chargement mission:", error);
        this.error = error.message || this.$t('route.noRoute');
        this.loading = false;
         if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    } }
    },
    async loadColleaguesPositions() {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/missions/positions/exclude/${this.mission.id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    // Vérifie ce qui est renvoyé
    console.log("📌 Missions récupérées :", response.data);

    // Si ton backend renvoie { missions: [...] }
    const missions = response.data.missions || response.data;

    // Effacer les anciens marqueurs
    if (this.colleagueMarkers) {
      this.colleagueMarkers.forEach((marker) => marker.remove());
    }
    this.colleagueMarkers = [];

    // Ajouter un marqueur pour chaque mission
    missions.forEach((mission) => {
      if (mission.latitude && mission.longitude) {
        const marker = L.marker([mission.latitude, mission.longitude])
          .addTo(this.map)
          .bindPopup(
             `<b>${mission.chauffeur.utilisateur.nom} ${mission.chauffeur.utilisateur.prenom}</b><br>
             📞 ${mission.chauffeur.utilisateur.numero_telephone || "Non disponible"}<br>`
          );
        this.colleagueMarkers.push(marker);
      }
    });
  } catch (error) {
    console.error("❌ Erreur lors du chargement des positions :", error);
  }
},
 

    handlePositionUpdate(pos) {
      if (!pos?.coords) return;

      this.userPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      };

      this.$nextTick(() => {
        // Si la carte n'est pas initialisée, on l'initialise
        if (!this.map) {
          this.initMap();
        } else {
          // Déplacer ou créer le marqueur utilisateur
          if (this.userMarker) {
            this.userMarker.setLatLng([this.userPosition.lat, this.userPosition.lng]);
          } else {
            this.userMarker = L.marker([this.userPosition.lat, this.userPosition.lng], {
              icon: L.icon({
                iconUrl: require('leaflet/dist/images/marker-icon.png'),
                shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
              })
            }).addTo(this.map)
            .bindPopup("Vous êtes ici")
            .openPopup();
          }

          // Mettre à jour l’itinéraire uniquement si le contrôle existe
          if (this.routingControl) this.updateRoute();
        }

        // Charger les positions des collègues
        if (this.map) this.loadColleaguesPositions();
      });
    },
    async getCoordinatesFromDestination(destination) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            address: data[0].display_name
          };
        }
        return null;
      } catch (error) {
        console.error("Erreur géocodage :", error);
        return null;
      }
    },
   initMap() {
      if (!this.userPosition || !this.destinationPosition) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map('map', { zoomControl: true, preferCanvas: true })
                  .setView([this.userPosition.lat, this.userPosition.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      const createIcon = (color) => L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Marqueur utilisateur
      this.userMarker = L.marker([this.userPosition.lat, this.userPosition.lng], { icon: createIcon('blue') })
                         .addTo(this.map)
                         .bindPopup("Vous êtes ici")
                         .openPopup();

      // Cercle de précision
      if (this.userPosition.accuracy) {
        L.circle([this.userPosition.lat, this.userPosition.lng], {
          radius: this.userPosition.accuracy,
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2
        }).addTo(this.map);
      }

      // Marqueur destination
      L.marker([this.destinationPosition.lat, this.destinationPosition.lng], { icon: createIcon('green') })
       .addTo(this.map)
       .bindPopup(`<b>Destination :</b><br>${this.mission?.demande?.destination || ''}`);

      // Itinéraire
      this.setupRoutingControl();
    },

    setupRoutingControl() {
      if (!this.userPosition || !this.destinationPosition) return;

      if (this.routingControl && this.map) {
        this.map.removeControl(this.routingControl);
        this.routingControl = null;
      }

      const routingLanguage = this.currentLanguage === 'ar' ? 'fr' : this.currentLanguage;

      this.routingControl = L.Routing.control({
        waypoints: [
          L.latLng(this.userPosition.lat, this.userPosition.lng),
          L.latLng(this.destinationPosition.lat, this.destinationPosition.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        collapsible: false,
        fitSelectedRoutes: 'smart',
        show: false,
        lineOptions: {
          styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }]
        },
        altLineOptions: {
          styles: [{ color: '#666', opacity: 0.7, weight: 3 }]
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        }),
        formatter: new L.Routing.Formatter({
          language: routingLanguage,
          units: 'metric'
        })
      }).addTo(this.map);

      this.routingControl.on('routesfound', (event) => {
        this.handleRoutesFound(event);
      });
    },
    handleRoutesFound(event) {
      this.routeInstructions = [];
      const route = event.routes[0];

      const summaryText = this.currentLanguage === 'ar'
        ? `مسار يبلغ طوله ${(route.summary.totalDistance / 1000).toFixed(1)} كيلومتر`
        : `Itinéraire de ${(route.summary.totalDistance / 1000).toFixed(1)} km`;

      this.routeInstructions.push({
        instruction: summaryText,
        distance: `${(route.summary.totalDistance / 1000).toFixed(1)} km`,
        duration: this.formatDuration(route.summary.totalTime),
        isSummary: true
      });

      route.instructions.forEach((instruction) => {
        let text = instruction.text;

        if (this.currentLanguage === 'fr') {
          text = this.translateToFrench(text);
        } else if (this.currentLanguage === 'ar') {
          text = this.translateToArabic(text);
        }

        this.routeInstructions.push({
          instruction: text,
          distance: `${(instruction.distance / 1000).toFixed(2)} km`,
          duration: this.formatDuration(instruction.time),
          isSummary: false,
          type: this.getInstructionType(instruction)
        });
      });

      this.loading = false;

      if (this.voiceEnabled) {
        this.speakRouteInstructions();
      }
    },
     async startTracking() {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par ce navigateur.");
    return;
  }

  if (!this.mission?.id) {
    console.error("Aucune mission sélectionnée");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Aucun token trouvé, impossible de suivre la position.");
    return;
  }

  try {
    this.watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        if (!latitude || !longitude) {
          console.warn("Coordonnées invalides :", latitude, longitude);
          return;
        }

        console.log("Position actuelle :", latitude, longitude);

        try {
          const response = await axios.put(
            `http://localhost:3000/api/missions/${this.mission.id}/position`,
            {
              latitude,
              longitude,
              mission_id: this.mission.id,
              timestamp: new Date().toISOString()
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );

          if (response.status !== 200) {
            console.error("Erreur lors de l'enregistrement de la position :", response.statusText);
          }
        } catch (error) {
          console.error("Erreur lors de l'envoi de la position :", error);
          if (error.response) {
            console.error("Détails de l'erreur:", error.response.data);
          }
        }
      },
      (err) => {
        console.error("Erreur géolocalisation :", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  } catch (error) {
    console.error("Erreur lors du démarrage du tracking :", error);
  }
},
    stopTracking() {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    },
    updateRoute() {
      if (!this.routingControl || !this.userPosition) return;

      const waypoints = this.routingControl.getWaypoints();
      if (!waypoints || waypoints.length === 0) return;

      waypoints[0].latLng = L.latLng(this.userPosition.lat, this.userPosition.lng);

      try {
        this.routingControl.setWaypoints(waypoints);
      } catch (error) {
        console.warn('Erreur mise à jour itinéraire:', error);
      }
    },
    translateToFrench(instruction) {
      const translations = {
        'Head east': 'Dirigez-vous vers l\'est',
        'Head west': 'Dirigez-vous vers l\'ouest',
        'Head north': 'Dirigez-vous vers le nord',
        'Head south': 'Dirigez-vous vers le sud',
        'Turn right': 'Tournez à droite',
        'Turn left': 'Tournez à gauche',
        'Turn sharp right': 'Tournez franchement à droite',
        'Turn sharp left': 'Tournez franchement à gauche',
        'Make a slight right': 'Prenez légèrement à droite',
        'Make a slight left': 'Prenez légèrement à gauche',
        'Slight right': 'Légèrement à droite',
        'Slight left': 'Légèrement à gauche',
        'Continue straight': 'Continuez tout droit',
        'Continue': 'Continuez',
        'Keep left': 'Restez à gauche',
        'Keep right': 'Restez à droite',
        'Go straight': 'Allez tout droit',
        'Take the 1st exit': 'Prenez la première sortie',
        'Take the 2nd exit': 'Prenez la deuxième sortie',
        'Take the 3rd exit': 'Prenez la troisième sortie',
        'Enter the traffic circle': 'Entrez dans le rond-point',
        'Exit the traffic circle': 'Sortez du rond-point',
        'At the roundabout': 'Au rond-point',
        'Roundabout': 'Rond-point',
        'Traffic circle': 'Rond-point',
        'Merge left': 'Fusionnez à gauche',
        'Merge right': 'Fusionnez à droite',
        'You have arrived': 'Vous êtes arrivé',
        'destination': 'destination',
        'on the left': 'sur la gauche',
        'on the right': 'sur la droite',
        'towards': 'en direction de',
        'onto': 'sur',
        'to stay on': 'pour rester sur',
        'Keep going': 'Continuez',
        'Exit': 'Sortie',
        'Turn around': 'Faites demi-tour',
        'Arrive at': 'Arrivée à',
        'Start at': 'Commencez à',
        'Start': 'Départ',
        'Follow': 'Suivez',
        'Pass the': 'Passez devant',
        'Cross the': 'Traversez',
      };

      let result = instruction;
      for (const [en, fr] of Object.entries(translations)) {
        const regex = new RegExp(en, 'gi');
        result = result.replace(regex, fr);
      }
      return result;
    },
    translateToArabic(instruction) {
      const translations = {
        'Head east': 'توجه شرقاً',
        'Head west': 'توجه غرباً',
        'Head north': 'توجه شمالاً',
        'Head south': 'توجه جنوباً',
        'Head': 'توجه',
        'Turn right': 'انعطف يميناً',
        'Turn left': 'انعطف يساراً',
        'Turn sharp right': 'انعطف يميناً بشدة',
        'Turn sharp left': 'انعطف يساراً بشدة',
        'Make a slight right': 'انعطف قليلاً يميناً',
        'Make a slight left': 'انعطف قليلاً يساراً',
        'Slight right': 'انعطف قليلاً يميناً',
        'Slight left': 'انعطف قليلاً يساراً',
        'Continue straight': 'استمر مباشرةً',
        'Continue': 'استمر',
        'Keep left': 'حافظ على اليسار',
        'Keep right': 'حافظ على اليمين',
        'Go straight': 'تابع مباشرةً',
        'Take the 1st exit': 'خذ المخرج الأول',
        'Take the 2nd exit': 'خذ المخرج الثاني',
        'Take the 3rd exit': 'خذ المخرج الثالث',
        'Enter the traffic circle': 'ادخل الدوار',
        'Exit the traffic circle': 'اخرج من الدوار',
        'At the roundabout': 'عند الدوار',
        'Roundabout': 'دوار',
        'Traffic circle': 'دوار',
        'Merge left': 'اندمج يساراً',
        'Merge right': 'اندمج يميناً',
        'You have arrived': 'لقد وصلت',
        'destination': 'الوجهة',
        'arrived': 'وصلت',
        'on the left': 'على اليسار',
        'on the right': 'على اليمين',
        'towards': 'باتجاه',
        'onto': 'على',
        'at your': 'إلى',
        'to stay on': 'للبقاء على',
        'Keep going': 'استمر في السير',
        'Exit': 'اخرج',
        'Turn around': 'قم بالدوران',
        'Arrive at': 'وصل إلى',
        'Start at': 'ابدأ من',
        'Start': 'ابدأ',
        'Follow': 'اتبع',
        'Pass the': 'تجاوز',
        'Cross the': 'اعبر',
      };

      const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
      let result = instruction;

      for (const key of sortedKeys) {
        const regex = new RegExp(key, 'gi');
        result = result.replace(regex, translations[key]);
      }

      return result;
    },
    getInstructionType(instruction) {
      if (!instruction.text) return 'default';

      const text = instruction.text.toLowerCase();

      if (this.currentLanguage === 'fr') {
        if (text.includes('gauche')) return 'left';
        if (text.includes('droite')) return 'right';
        if (text.includes('tout droit') || text.includes('continue') || text.includes('suivre') || text.includes('direct')) return 'straight';
        if (text.includes('rond-point') || text.includes('carrefour giratoire')) return 'roundabout';
        if (text.includes('destination') || text.includes('arrivée') || text.includes('arrivé')) return 'arrival';
        if (text.includes('départ') || text.includes('commence')) return 'departure';
      } else if (this.currentLanguage === 'ar') {
        if (text.includes('يسار')) return 'left';
        if (text.includes('يمين')) return 'right';
        if (text.includes('مستقيم') || text.includes('تابع') || text.includes('استمر')) return 'straight';
        if (text.includes('دوار')) return 'roundabout';
        if (text.includes('وجهة') || text.includes('وصول') || text.includes('وصلت')) return 'arrival';
        if (text.includes('بداية') || text.includes('ابدأ')) return 'departure';
      }

      return 'default';
    },
    getStepIcon(step) {
      if (step.isSummary) return 'bi bi-info-circle';

      switch (step.type) {
        case 'left':
          return 'bi bi-arrow-left-circle';
        case 'right':
          return 'bi bi-arrow-right-circle';
        case 'straight':
          return 'bi bi-arrow-up-circle';
        case 'roundabout':
          return 'bi bi-signpost-split';
        case 'arrival':
          return 'bi bi-flag';
        case 'departure':
          return 'bi bi-geo-alt';
        default:
          return 'bi bi-signpost';
      }
    },
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (this.currentLanguage === 'ar') {
        return hours > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${minutes} دقيقة`;
      } else {
        return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(this.$i18n.locale, options);
    },
    async toggleLanguage() {
      this.currentLanguage = this.currentLanguage === 'fr' ? 'ar' : 'fr';

      if (this.mission?.demande?.destination) {
        const coords = await this.getCoordinatesFromDestination(this.mission.demande.destination);
        if (coords) {
          this.destinationPosition = coords;
          if (this.map) {
            this.setupRoutingControl();
          }
        }
      }

      if (this.routingControl) {
        const waypoints = this.routingControl.getWaypoints();
        if (waypoints && waypoints.length > 0) {
          this.routingControl.setWaypoints(waypoints);
        }
      }
    },
    toggleVoiceGuidance() {
      this.voiceEnabled = !this.voiceEnabled;
      if (this.voiceEnabled) {
        this.speakRouteInstructions();
      } else {
        this.stopVoiceGuidance();
      }
    },
    speakRouteInstructions() {
      if (!this.voiceEnabled || !this.speechSynthesis || this.routeInstructions.length === 0) return;

      this.stopVoiceGuidance();

      const instructionsToSpeak = this.routeInstructions.filter(step => !step.isSummary);

      instructionsToSpeak.forEach((step, index) => {
        const timeoutId = setTimeout(() => {
          if (!this.voiceEnabled) return;

          this.utterance = new SpeechSynthesisUtterance(step.instruction);
          this.utterance.lang = this.currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR';
          this.utterance.rate = 0.9;
          this.setVoiceForLanguage();

          this.utterance.onend = () => {
            this.lastSpokenInstruction = index;
          };

          this.speechSynthesis.speak(this.utterance);
        }, index * 6000);

        this.speakTimeouts.push(timeoutId);
      });
    },
    setVoiceForLanguage() {
      if (!this.speechSynthesis) return;

      const voices = this.speechSynthesis.getVoices();
      const targetLang = this.currentLanguage === 'ar' ? 'ar' : 'fr';

      const preferredVoice = voices.find(voice =>
        voice.lang.startsWith(targetLang) && voice.localService
      );

      if (preferredVoice && this.utterance) {
        this.utterance.voice = preferredVoice;
      }
    },
    stopVoiceGuidance() {
      if (this.speechSynthesis) {
        this.speechSynthesis.cancel();
      }
      this.speakTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      this.speakTimeouts = [];
      this.lastSpokenInstruction = null;
    }
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.card {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
}

.card-header {
  border-radius: 0.75rem 0.75rem 0 0 !important;
  padding: 1rem 1.25rem;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.vr {
  border-left: 2px dashed #dee2e6;
}

.leaflet-routing-container {
  display: none;
}

/* RTL support for Arabic */
[dir="rtl"] .me-2 {
  margin-right: 0 !important;
  margin-left: 0.5rem !important;
}

[dir="rtl"] .me-3 {
  margin-right: 0 !important;
  margin-left: 1rem !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>