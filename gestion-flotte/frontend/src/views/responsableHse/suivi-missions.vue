<template>
  <div class="suivi-missions">
    <div class="page-header d-flex align-items-center justify-content-between mb-4">
      <h2 class="mb-0">
        <i class="bi bi-clipboard-check text-primary me-2"></i>
        Suivi des Missions
      </h2>
      <button class="btn btn-outline-secondary" @click="fetchMissions">
        <i class="bi bi-arrow-clockwise me-1"></i>Actualiser
      </button>
    </div>

    <!-- TABLEAU DES MISSIONS -->
    <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
      <div class="card-header bg-white py-3">
        <h5 class="card-title mb-0">Liste des missions</h5>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Chargement des missions...</p>
        </div>

        <div v-else>
  <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
    <div class="table-responsive">
      <table class="table align-middle table-hover mb-0">
        <thead class="bg-light text-secondary fw-semibold">
          <tr>
            <th scope="col" class="ps-4">#</th>
            <th scope="col">Chauffeur</th>
            <th scope="col">Véhicule</th>
            <th scope="col">Destination</th>
            <th scope="col">État</th>
            <th scope="col" class="text-center pe-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="mission in missions" 
            :key="mission.id" 
            class="mission-row border-bottom"
          >
            <!-- Numéro -->
            <td class="ps-4 fw-bold text-primary">
              {{ mission.demande.n_ordre }}
            </td>

            <!-- Chauffeur -->
            <td>
              <div class="d-flex align-items-center">
                <div 
                  class="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                >
                  <i class="bi bi-person-fill text-primary"></i>
                </div>
                <div>
                  <div class="fw-semibold">
                    {{ mission.chauffeur?.utilisateur?.nom }} {{ mission.chauffeur?.utilisateur?.prenom }}
                  </div>
                  <small class="text-muted">Chauffeur</small>
                </div>
              </div>
            </td>

            <!-- Véhicule -->
            <td>
              <div class="d-flex align-items-center">
                <div 
                  class="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                >
                  <i class="bi bi-truck text-success"></i>
                </div>
                <div>
                  <div class="fw-semibold">
                    {{ mission.vehicule?.marque }} {{ mission.vehicule?.modele }}
                  </div>
                  <small class="text-muted">
                    ({{ mission.vehicule?.immatriculation }})
                  </small>
                </div>
              </div>
            </td>

            <!-- Destination -->
            <td>
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              <span class="fw-medium">{{ mission.demande?.destination }}</span>
            </td>

            <!-- État -->
            <td>
              <span 
                class="badge rounded-pill px-3 py-2 shadow-sm" 
                :class="etatClass(mission.etat)"
              >
                <i :class="etatIcon(mission.etat)" class="me-1"></i>
                {{ mission.etat }}
              </span>
            </td>

            <!-- Actions -->
            <td class="text-center pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <button 
                  class="btn btn-outline-primary rounded-pill px-3"
                  @click="voirDetails(mission)"
                  title="Voir détails">
                  <i class="bi bi-eye text-succes fs-6"></i>
                </button>
                <button 
                  class="btn btn-outline-danger rounded-pill px-3"
                  @click="voirCarte(mission)"
                  title="Voir sur carte">
                  <i class="bi bi-geo-alt-fill text-danger fs-6"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Aucun résultat -->
    <div v-if="missions.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-inbox display-4 d-block mb-2"></i>
      <p class="mb-0">Aucune mission trouvée</p>
      <small>Les nouvelles missions apparaîtront ici</small>
    </div>
  </div>
</div>

      </div>
    </div>

    <!-- MODAL DETAILS -->
    <div 
      class="modal fade" 
      id="detailsModal" 
      tabindex="-1"
      aria-hidden="true"
      ref="detailsModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2 text-primary"></i>
              Détails de la Mission #{{ missionDetails?.id }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <label class="text-muted small mb-1">Chauffeur</label>
                  <p class="mb-0 fw-semibold">
                    <i class="bi bi-person me-1 text-primary"></i>
                    {{ missionDetails?.chauffeur?.utilisateur?.nom }}
                    {{ missionDetails?.chauffeur?.utilisateur?.prenom }}
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <label class="text-muted small mb-1">Véhicule</label>
                  <p class="mb-0 fw-semibold">
                    <i class="bi bi-truck me-1 text-primary"></i>
                    {{ missionDetails?.vehicule?.marque }}
                    {{ missionDetails?.vehicule?.modele }}
                    ({{ missionDetails?.vehicule?.immatriculation }})
                  </p>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <label class="text-muted small mb-1">Destination</label>
                  <p class="mb-0 fw-semibold">
                    <i class="bi bi-geo-alt me-1 text-primary"></i>
                    {{ missionDetails?.demande?.destination }}
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <label class="text-muted small mb-1">État</label>
                  <p class="mb-0">
                    <span class="badge rounded-pill" :class="etatClass(missionDetails?.etat)">
                      {{ missionDetails?.etat }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div class="detail-item mb-3">
              <label class="text-muted small mb-1">Itinéraire</label>
              <p class="mb-0">{{ missionDetails?.demande?.itineraire || 'Non spécifié' }}</p>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <label class="text-muted small mb-1">Date de départ</label>
                  <p class="mb-0">
                    <i class="bi bi-calendar-event me-1 text-primary"></i>
                    {{ formatDate(missionDetails?.demande?.date_heure_debut) }}
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-item mb-3">
                  <label class="text-muted small mb-1">Date de retour</label>
                  <p class="mb-0">
                    <i class="bi bi-calendar-check me-1 text-primary"></i>
                    {{ formatDate(missionDetails?.demande?.date_heure_fin) }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="detail-item">
              <label class="text-muted small mb-1">Observation</label>
              <p class="mb-0">{{ missionDetails?.demande?.observation || 'Aucune observation' }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CARTE -->
    <div 
      class="modal fade" 
      id="mapModal" 
      tabindex="-1"
      aria-hidden="true"
      ref="mapModal">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              <i class="bi bi-map me-2 text-info"></i>
              Position de la mission #{{ missionDetails?.id }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <div id="map" style="height: 500px;"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';

// Correction de l'icône Leaflet (problème courant)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: "SuiviMissions",
  setup() {
    const missions = ref([]);
    const loading = ref(true);
    const missionDetails = ref(null);
    let map = null;

    // Charger missions
    const fetchMissions = async () => {
      try {
        loading.value = true;
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/missions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        missions.value = await res.json();
      } catch (err) {
        console.error("Erreur fetch missions", err);
      } finally {
        loading.value = false;
      }
    };

    // Formatter date
    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString("fr-FR");
    };

    // Classes pour badge état
    const etatClass = (etat) => {
      switch (etat) {
        case "en attente": return "bg-warning text-dark";
        case "en cours": return "bg-primary";
        case "terminer": return "bg-success";
        case "annuler": return "bg-danger";
        case "bloquer": return "bg-dark";
        default: return "bg-secondary";
      }
    };
    
    // Icônes pour badge état
    const etatIcon = (etat) => {
      switch (etat) {
        case "en attente": return "bi bi-clock-history";
        case "en cours": return "bi bi-play-circle";
        case "terminer": return "bi bi-check-circle";
        case "annuler": return "bi bi-x-circle";
        case "bloquer": return "bi bi-lock";
        default: return "bi bi-question-circle";
      }
    };

    // Voir détails
    const voirDetails = (mission) => {
      missionDetails.value = mission;
      const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
      modal.show();
    };

    // Générer PDF
    const genererPDF = (id) => {
      window.open(`http://localhost:3000/api/missions/${id}/feuille-route`, "_blank");
    };

    // Voir sur carte
    const voirCarte = async (mission) => {
  missionDetails.value = mission;
  const modal = new bootstrap.Modal(document.getElementById("mapModal"));
  modal.show();

  setTimeout(async () => {
    if (!map) {
      map = L.map("map").setView([36.75, 3.06], 10); // Alger par défaut
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);
    } else {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
    }

    try {
      // ➤ Position actuelle
      const res = await fetch(`http://localhost:3000/api/missions/${mission.id}/position`);
      const pos = await res.json();

      if (pos.latitude && pos.longitude && missionDetails.value?.demande?.destination) {
        // Marqueur position actuelle
        L.marker([pos.latitude, pos.longitude]).addTo(map)
          .bindPopup("Position actuelle")
          .openPopup();

        // ➤ Géocodage destination (adresse → coordonnées)
        const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(missionDetails.value.demande.destination)}`);
        const destData = await destRes.json();

        if (destData.length > 0) {
          const destLat = parseFloat(destData[0].lat);
          const destLon = parseFloat(destData[0].lon);

          // Marqueur destination
          L.marker([destLat, destLon], { icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })}).addTo(map).bindPopup("Destination");

          // ➤ Calcul de l’itinéraire via OSRM
          const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${pos.longitude},${pos.latitude};${destLon},${destLat}?overview=full&geometries=geojson`);
          const routeData = await routeRes.json();

          if (routeData.routes.length > 0) {
            const route = routeData.routes[0].geometry;

            // Affichage ligne réelle
            L.geoJSON(route, {
              style: { color: "blue", weight: 4, opacity: 0.7 }
            }).addTo(map);

            // Ajuster la vue pour voir tout le trajet
            const bounds = [
              [pos.latitude, pos.longitude],
              [destLat, destLon]
            ];
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      }
    } catch (err) {
      console.error("Erreur récupération position ou itinéraire mission", err);
    }
  }, 500);
};



    // Annuler mission
    const annulerMission = async (id) => {
      if (!confirm("Voulez-vous vraiment annuler cette mission ?")) return;
      try {
        await fetch(`http://localhost:3000/api/missions/${id}/annuler`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        fetchMissions();
      } catch (err) {
        console.error("Erreur annulation mission", err);
      }
    };

    onMounted(fetchMissions);

    return {
      missions,
      loading,
      missionDetails,
      formatDate,
      etatClass,
      etatIcon,
      voirDetails,
      genererPDF,
      voirCarte,
      annulerMission,
      fetchMissions
    };
  }
};
</script>

<style scoped>
.suivi-missions {
  font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #343a40;
}

.page-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.card {
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08) !important;
}

.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-top: none;
  padding: 1rem 0.75rem;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f4;
}

.mission-row {
  transition: background-color 0.15s ease;
}

.mission-row:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  font-weight: 500;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.btn {
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.detail-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}

.modal-content {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  border-radius: 0.75rem 0.75rem 0 0 !important;
}

#map {
  border-radius: 0 0 0.75rem 0.75rem;
}

.text-muted {
  color: #6c757d !important;
}

/* Animation de chargement */
.spinner-border {
  width: 2.5rem;
  height: 2.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .table-responsive {
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .btn-group {
    display: flex;
    flex-wrap: nowrap;
  }
  
  .btn-group .btn {
    padding: 0.25rem 0.5rem;
  }
}
</style>