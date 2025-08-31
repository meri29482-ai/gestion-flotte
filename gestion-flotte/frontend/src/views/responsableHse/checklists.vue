<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 page-header">
      <div>
        <h3 class="fw-bold text-primary mb-1">
          <i class="bi bi-clipboard-check me-2"></i>
          Suivi des Checklists
        </h3>
        <p class="text-muted mb-0">Gestion et suivi des contrôles véhicules avant et après mission</p>
      </div>
      <div class="d-flex">
        <div class="input-group input-group-sm me-2" style="max-width: 250px;">
          <span class="input-group-text bg-transparent"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" placeholder="Rechercher..." />
        </div>
        <button class="btn btn-sm btn-outline-secondary me-2 d-flex align-items-center">
          <i class="bi bi-filter me-1"></i>Filtrer
        </button>
        <button class="btn btn-sm btn-primary d-flex align-items-center">
          <i class="bi bi-plus-circle me-1"></i>Nouveau
        </button>
      </div>
    </div>

    <!-- Tableau des Checklists groupées par mission -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>N° Mission</th>
                <th>Type Contrôle</th>
                <th>Véhicule</th>
                <th>Chauffeur</th>
                <th>Kilométrage</th>
                <th>État</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="mission in groupedChecklists" :key="mission.id">
                <tr v-for="(check, index) in mission.checklists" :key="check.id" class="hover-shadow">
                  
                  <!-- N° Mission fusionné -->
                  <td v-if="index === 0" :rowspan="mission.checklists.length" class="fw-semibold text-primary">
                    {{ mission.n_ordre }}
                  </td>
                  <td v-else class="d-none"></td>
                  
                  <!-- Type Contrôle -->
                 <td>
  <span
    class="badge text-uppercase d-flex align-items-center gap-1"
    :class="check.type_controle === 'AVANT_MISSION' 
      ? 'bg-success-subtle text-success' 
      : 'bg-danger-subtle text-danger'"
  >
    <!-- Icône unique selon le type -->
    <i v-if="check.type_controle === 'AVANT_MISSION'" class="bi bi-rocket-takeoff"></i>
    <i v-else class="bi bi-flag-fill"></i>

    <!-- Texte unique -->
    {{ check.type_controle === 'AVANT_MISSION' ? 'Avant mission' : 'Après mission' }}
  </span>
</td>




                  <!-- Véhicule -->
                  <td>
                    <div v-if="mission.vehicule" class="d-flex align-items-center gap-2">
                      <i class="bi bi-car-front-fill text-primary"></i>
                      <span class="fw-medium">{{ mission.vehicule }}</span>
                    </div>
                    <span v-else class="text-muted">—</span>
                  </td>

                  <!-- Chauffeur -->
                  <td>
                    <div v-if="mission.chauffeur" class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <span>{{ mission.chauffeur }}</span>
                    </div>
                    <span v-else class="text-muted">—</span>
                  </td>

                  <!-- Kilométrage -->
                  <td>
                    <i class="bi bi-speedometer2 text-muted me-1"></i>
                    {{ check.kilometrage || '—' }} km
                  </td>

                  <!-- État -->
                  <td>
                    <span class="badge rounded-pill px-3 py-2"
                          :class="check.valide ? 'bg-success text-white' : 'bg-danger text-white'">
                      {{ check.valide ? "Valide" : "Anomalies" }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                      <button class="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                              style="width: 32px; height: 32px;"
                              @click="voirDetails(check)"
                              title="Détails">
                        <i class="bi bi-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Détails Checklist -->
    <div class="modal fade" id="modalDetails" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-3 overflow-hidden">
          <!-- Header -->
          <div class="modal-header modal-header-custom text-white p-4">
            <div>
              <h5 class="modal-title mb-1">
                <i class="bi bi-clipboard-data me-2"></i>
                Détails Checklist
              </h5>
              <p class="mb-0 small opacity-75">Contrôle complet du véhicule</p>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4" v-if="details">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 class="fw-bold text-primary mb-0">Mission #{{ details.mission?.demande?.n_ordre }}</h5>
                <span class="badge type-badge mt-1" :class="details.type_controle === 'AVANT_MISSION' ? 'type-badge-before' : 'type-badge-after'">
                  {{ formatTypeControle(details.type_controle) }}
                </span>
              </div>
              <span class="status-badge-lg" :class="details.valide ? 'status-valid' : 'status-invalid'">
                <i :class="details.valide ? 'bi bi-check-lg me-1' : 'bi bi-exclamation-lg me-1'"></i>
                {{ details.valide ? "Checklist validée" : "Anomalies détectées" }}
              </span>
            </div>

            <!-- Chauffeur / Véhicule -->
            <div class="row mb-4">
              <div class="col-md-6 mb-3">
                <div class="info-card p-3 rounded-3 h-100">
                  <h6 class="fw-bold mb-1"><i class="bi bi-person me-2"></i> Chauffeur</h6>
                  <p class="mb-0 text-dark fw-semibold">{{ details.mission.chauffeur?.utilisateur?.nom }} {{ details.mission.chauffeur?.utilisateur?.prenom }}</p>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <div class="info-card p-3 rounded-3 h-100">
                  <h6 class="fw-bold mb-1"><i class="bi bi-truck me-2"></i> Véhicule</h6>
                  <p class="mb-0 text-dark fw-semibold">{{ details.mission.vehicule?.immatriculation }}</p>
                  <small class="text-muted">{{ details.mission.vehicule?.marque }} - {{ details.mission.vehicule?.modele }}</small>
                </div>
              </div>
            </div>

            <!-- Éléments du contrôle -->
            <h6 class="fw-bold mb-3 section-title">
              <i class="bi bi-clipboard-check me-2"></i>
              Éléments contrôlés
            </h6>
            <div class="row g-3">
              <div class="col-md-4" v-for="(val, champ) in controleDetails(details)" :key="champ">
                <div class="control-card p-3 rounded-3 h-100"
                     :class="getControlClass(val)">
                  <div class="d-flex align-items-center mb-2">
                    <i class="bi me-2" :class="getValueIcon(val)"></i>
                    <h6 class="fw-semibold mb-0">{{ champ }}</h6>
                  </div>
                  <p class="mb-0 control-value">{{ formatValue(val) }}</p>
                </div>
              </div>
            </div>

            <!-- Remarques -->
            <div v-if="details.remarques" class="remarks-card p-3 rounded-3 mt-4">
              <h6 class="fw-bold mb-2"><i class="bi bi-chat-left-text me-2"></i> Remarques</h6>
              <p class="mb-0">{{ details.remarques }}</p>
            </div>
          </div>

          <div class="modal-footer border-top-0 p-4">
            <button type="button" class="btn btn-outline-secondary rounded-2" data-bs-dismiss="modal">
              <i class="bi bi-x-lg me-1"></i>Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import * as bootstrap from "bootstrap";

export default {
  name: "HSEchiklistes",
  setup() {
    const checklists = ref([]);
    const details = ref(null);

    const valeursAnormales = ["VIDE", "BASSE", "A_PLAT", "INEFFICACES", "DEFAILLANTS", "NON_CONFORMES"];

    const fetchChecklists = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/checklists");
        checklists.value = await res.json();
      } catch (err) {
        console.error("Erreur récupération checklists", err);
      }
    };

    const groupedChecklists = computed(() => {
      const missions = {};
      checklists.value.forEach(check => {
        const missionId = check.mission?.id;
        if (!missions[missionId]) {
          missions[missionId] = {
            id: missionId,
            n_ordre: check.mission?.demande?.n_ordre,
            chauffeur: check.mission?.chauffeur?.utilisateur?.nom + " " + check.mission?.chauffeur?.utilisateur?.prenom,
            vehicule: check.mission?.vehicule?.immatriculation,
            checklists: []
          };
        }
        missions[missionId].checklists.push(check);
      });
      return Object.values(missions);
    });

    const voirDetails = (check) => {
      details.value = check;
      const modal = new bootstrap.Modal(document.getElementById("modalDetails"));
      modal.show();
    };

    const formatTypeControle = (type) => {
      return type === "AVANT_MISSION" ? "Avant Mission" : "Après Mission";
    };

    const controleDetails = (details) => {
      if (!details) return {};
      return {
        "Niveau huile": details.niveau_huile,
        "Pression pneus": details.pression_pneus,
        "Phares": details.phares,
        "Niveau carburant": details.niveau_carburant,
        "Freins": details.freins,
        "Ceintures": details.ceintures,
      };
    };

    const getControlClass = (val) => {
      if (!val) return "bg-light";
      return valeursAnormales.includes(val) ? "bg-danger text-white" : "bg-success-subtle";
    };

    const getValueIcon = (val) => {
      if (!val) return "bi-question-circle";
      return valeursAnormales.includes(val) ? "bi-exclamation-triangle" : "bi-check-circle";
    };

    const formatValue = (val) => {
      return val || "—";
    };

    onMounted(fetchChecklists);

    return { checklists, groupedChecklists, details, voirDetails, formatTypeControle, controleDetails, getControlClass, getValueIcon, formatValue };
  }
};
</script>


<style scoped>
/* Variables de couleurs */
:root {
  --primary: #2c6fbb;
  --primary-dark: #1d3557;
  --primary-light: #8fc1e3;
  --secondary: #457b9d;
  --success: #28a745;
  --success-light: #d4edda;
  --danger: #dc3545;
  --danger-light: #f8d7da;
  --warning: #ffc107;
  --light: #f8f9fa;
  --dark: #343a40;
  --gray: #6c757d;
  --gray-light: #e9ecef;
}

/* En-tête de page */
.page-header {
  border-bottom: 1px solid var(--gray-light);
  padding-bottom: 1rem;
}

/* Carte de mission */
.mission-card {
  transition: all 0.3s ease;
  border: 1px solid var(--gray-light);
}

.mission-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.mission-header {
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary));
}

.mission-badge {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.checklist-count {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

/* Cartes de checklist */
.check-card {
  border: 1px solid var(--gray-light);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.check-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08) !important;
}

.check-valid {
  background-color: var(--success-light);
  border-left: 4px solid var(--success) !important;
}

.check-invalid {
  background-color: var(--danger-light);
  border-left: 4px solid var(--danger) !important;
}

.check-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.check-icon-before {
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  color: white;
}

.check-icon-after {
  background: linear-gradient(135deg, #6cce6c, var(--success));
  color: white;
}

/* Badges de statut */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
}

.status-valid {
  background-color: var(--success);
  color: white;
}

.status-invalid {
  background-color: var(--danger);
  color: white;
}

.status-badge-lg {
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

/* Bouton d'action */
.btn-action {
  background-color: white;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background-color: var(--primary);
  color: white;
}

/* État vide */
.empty-state {
  opacity: 0.7;
}

/* Modal */
.modal-header-custom {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
}

.type-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-badge-before {
  background-color: var(--primary-light);
  color: var(--primary-dark);
}

.type-badge-after {
  background-color: #c3e6cb;
  color: #155724;
}

/* Cartes d'information */
.info-card {
  border: 1px solid var(--gray-light);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.driver-icon {
  background: linear-gradient(135deg, #a8dadc, #457b9d);
  color: white;
}

.vehicle-icon {
  background: linear-gradient(135deg, #fca311, #e63946);
  color: white;
}

.km-icon {
  background: linear-gradient(135deg, #caf0f8, #00b4d8);
  color: white;
}

.date-icon {
  background: linear-gradient(135deg, #cdb4db, #9b5de5);
  color: white;
}

.time-icon {
  background: linear-gradient(135deg, #ffafcc, #ff6392);
  color: white;
}

/* Titres de section */
.section-title {
  color: var(--primary-dark);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--gray-light);
}

/* Cartes de contrôle */
.control-card {
  border: 1px solid var(--gray-light);
  transition: all 0.3s ease;
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.control-valid {
  border-left: 4px solid var(--success) !important;
  background-color: rgba(40, 167, 69, 0.05);
}

.control-anomaly {
  border-left: 4px solid var(--danger) !important;
  background-color: rgba(220, 53, 69, 0.05);
}

.control-normal {
  border-left: 4px solid var(--gray) !important;
}

.control-value {
  font-weight: 500;
  color: var(--dark);
}

/* Cartes de remarques */
.remarks-card {
  background-color: #f8f9fa;
  border-left: 4px solid var(--warning);
}

.remarks-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
  color: #5c4a00;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

/* Arrondissement des boutons */
.btn {
  border-radius: 8px;
}

/* Animation d'entrée */
.card {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .page-header > div:last-child {
    margin-top: 1rem;
    width: 100%;
  }
  
  .mission-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .checklist-count {
    margin-top: 1rem;
    align-self: flex-start;
  }
}
</style>