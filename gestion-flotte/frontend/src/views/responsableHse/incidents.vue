<template>
  <div class="container py-4">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-gradient">
          <i class="bi bi-exclamation-octagon-fill me-2"></i> Suivi des Incidents
        </h2>
        <p class="text-muted mb-0">suivez tous les incidents signalés</p>
      </div>
      
    </div>

    <!-- Tableau des signalements -->
    <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-4">Type</th>
            <th>Date</th>
            <th>Mission</th>
            <th>Chauffeur</th>
            <th>Véhicule</th>
            <th>Intervention</th>
            <th class="text-center pe-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="incident in incidents" :key="incident.id" class="incident-row">
            <td class="ps-4">
              <span class="fw-semibold text-primary">{{ incident.type }}</span>
            </td>
            
            <td>
              <div class="text-nowrap">
                <i class="bi bi-calendar-event me-1 text-primary"></i>
                {{ formatDate(incident.date_signalement) }}
              </div>
            </td>
            <td>
              <div v-if="incident.mission">
                <span class="badge bg-light text-dark">#{{ incident.mission.demande.n_ordre }}</span>
                <div class="small">
                  <i class="bi bi-geo me-1 text-success"></i>
                  {{ incident.mission.demande?.destination }}
                </div>
              </div>
            </td>
            <td>
              <div v-if="incident.mission?.chauffeur">
                <span class="fw-semibold">
                  {{ incident.mission.chauffeur.utilisateur?.nom }}
                  {{ incident.mission.chauffeur.utilisateur?.prenom }}
                </span>
                <div class="small text-muted">
                  <i class="bi bi-telephone me-1"></i>
                  {{ incident.mission.chauffeur.utilisateur?.numero_telephone }}
                </div>
                
              </div>
            </td>
            <td>
              <div v-if="incident.mission?.vehicule">
                <span class="fw-semibold">{{ incident.mission.vehicule.immatriculation }}</span>
                <div class="small text-muted">
                  {{ incident.mission.vehicule.marque }} - {{ incident.mission.vehicule.modele }}
                </div>
              </div>
            </td>
            <td>
              <span class="badge rounded-pill py-2 px-3"
                    :class="incident.intervention_demandee === 'oui' ? 'bg-warning text-dark' : 'bg-success'">
                <i :class="incident.intervention_demandee === 'oui' ? 'bi bi-exclamation-triangle' : 'bi bi-check-circle'" class="me-1"></i>
                {{ incident.intervention_demandee }}
              </span>
            </td>
            <td class="text-center pe-4">
              <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-outline-info" @click="voirDetails(incident)" title="Voir détails">
                  <i class="bi bi-eye fs-6"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="incidents.length === 0">
            <td colspan="8" class="text-center text-muted py-5">
              <i class="bi bi-inbox display-4 d-block mb-2"></i>
              Aucun incident signalé
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>


    <!-- Modal Détails -->
    <!-- Modal Détails -->
<div class="modal fade" id="modalDetails" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content shadow-lg border-0 rounded-4">
      <div class="modal-header bg-info text-white py-3">
        <h5 class="modal-title d-flex align-items-center">
          <i class="bi bi-info-circle me-2"></i>
          Détails de l'incident
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">
        <!-- Type + Date signalement -->
        <div class="mb-4">
          <h4 class="fw-bold text-primary">{{ details.type }}</h4>
          <p class="text-muted mb-0">
            <i class="bi bi-calendar-event me-1"></i>
            {{ formatDate(details.date_signalement) }}
          </p>
        </div>

        <!-- Mission + Chauffeur -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="detail-card p-3 rounded-3 bg-light mb-3">
              <label class="text-muted small mb-1">Mission</label>
              <p class="mb-0 fw-semibold">
                <i class="bi bi-briefcase me-1 text-primary"></i>
                #{{ details.mission?.demande?.n_ordre }} - {{ details.mission?.type_mission }}
              </p>
              <small class="text-muted">
                <i class="bi bi-geo me-1 text-success"></i>
                {{ details.mission?.demande?.destination }}
              </small>
              <br>
              <small class="text-muted">
                <i class="bi bi-clock-history me-1"></i>
                Départ : {{ formatDate(details.mission?.date_depart) }}  
                <br>Retour : {{ formatDate(details.mission?.date_routour) }}
              </small>
              <br>
              <span class="badge rounded-pill mt-2"
                    :class="details.mission?.etat === 'en cours' ? 'bg-warning text-dark' : 
                            details.mission?.etat === 'terminée' ? 'bg-success' : 'bg-secondary'">
                {{ details.mission?.etat }}
              </span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="detail-card p-3 rounded-3 bg-light mb-3">
              <label class="text-muted small mb-1">Demandeur</label>
          <p class="mb-0 fw-semibold">
            <i class="bi bi-person-circle me-1 text-info"></i>
            {{ details.mission?.demande?.utilisateur?.nom }} {{ details.mission?.demande?.utilisateur?.prenom }}
          </p>
          <small class="text-muted">
            Fonction : {{ details.mission?.demande?.utilisateur?.fonction }}  
            <br>Email : {{ details.mission?.demande?.utilisateur?.email }}
          </small>
             
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6">
        <div class="detail-card p-3 rounded-3 bg-light mb-3">
          <label class="text-muted small mb-1">Véhicule</label>
          <p class="mb-0 fw-semibold">
            <i class="bi bi-truck me-1 text-dark"></i>
            {{ details.mission?.vehicule?.immatriculation }}
          </p>
          <small class="text-muted">
            {{ details.mission?.vehicule?.marque }} - {{ details.mission?.vehicule?.modele }}
            ({{ details.mission?.vehicule?.type }})
          </small>
        </div>

        <!-- Demandeur -->
        <div class="col-md-6">
        <div class="detail-card p-3 rounded-3 bg-light mb-3">
          <label class="text-muted small mb-1">Chauffeur</label>
              <p class="mb-0 fw-semibold">
                <i class="bi bi-person-badge me-1 text-success"></i>
                {{ details.mission?.chauffeur?.utilisateur?.nom }} {{ details.mission?.chauffeur?.utilisateur?.prenom }}
              </p>
              <small class="text-muted">
                <i class="bi bi-telephone me-1"></i>
                {{ details.mission?.chauffeur?.utilisateur?.numero_telephone }}
              </small>
              <br>
              <small class="text-muted">
                Permis : {{ details.mission?.chauffeur?.type_permis }}  
                ({{ details.mission?.chauffeur?.numero_permis }})
              </small>
        </div>
          </div>
          </div>
        </div>
        <!-- Description -->
        <div class="detail-card p-3 rounded-3 bg-light mb-3">
          <label class="text-muted small mb-1">Description</label>
          <p class="mb-0">{{ details.description }}</p>
        </div>

        <!-- Intervention + Mission continue -->
        <div class="row">
          <div class="col-md-6">
            <div class="detail-card p-3 rounded-3 bg-light mb-3">
              <label class="text-muted small mb-1">Intervention demandée</label>
              <p class="mb-0">
                <span class="badge rounded-pill py-2 px-3"
                      :class="details.intervention_demandee === 'oui' ? 'bg-warning text-dark' : 'bg-success'">
                  {{ details.intervention_demandee }}
                </span>
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-card p-3 rounded-3 bg-light mb-3">
              <label class="text-muted small mb-1">Mission continue</label>
              <p class="mb-0">
                <span class="badge rounded-pill py-2 px-3"
                      :class="details.mission_continue === 'oui' ? 'bg-success' : 'bg-danger'">
                  {{ details.mission_continue }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Description intervention -->
        <div v-if="details.intervention_description" class="detail-card p-3 rounded-3 bg-light mb-3">
          <label class="text-muted small mb-1">Description de l'intervention</label>
          <p class="mb-0 fst-italic">{{ details.intervention_description }}</p>
        </div>

        <!-- Photo -->
        <div v-if="details.photo" class="mt-4">
          <label class="text-muted small mb-2 d-block">Photo</label>
          <img :src="details.photo" alt="photo incident" class="img-fluid rounded-3 shadow-sm" />
        </div>
      </div>
    </div>
  </div>
</div>
</div>
  </div>
</template>

<script>
import axios from "axios";
import * as bootstrap from "bootstrap";

export default {
  name: "HSEIncidents",
  data() {
    return {
      incidents: [],
      form: {
        type: "",
        description: "",
        date_signalement: "",
        mission_id: "",
        chauffeur_id: "",
        intervention_demandee: "non",
        intervention_description: "",
        mission_continue: "oui",
        photo: ""
      },
      details: {}
    };
  },
  mounted() {
    this.fetchIncidents();
  },
  methods: {
    async fetchIncidents() {
      try {
        const { data } = await axios.get("http://localhost:3000/api/signalements");
        this.incidents = data;
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
      }
    },
    ouvrirFormulaire() {
      const modal = new bootstrap.Modal(document.getElementById("modalFormulaire"));
      modal.show();
    },
    voirDetails(incident) {
      this.details = incident;
      const modal = new bootstrap.Modal(document.getElementById("modalDetails"));
      modal.show();
    },
    async ajouterIncident() {
      try {
        await axios.post("http://localhost:3000/api/signalements", this.form);
        this.fetchIncidents();
        bootstrap.Modal.getInstance(document.getElementById("modalFormulaire")).hide();
        this.form = { type: "", description: "", date_signalement: "", mission_id: "", chauffeur_id: "", intervention_demandee: "non", intervention_description: "", mission_continue: "oui", photo: "" };
      } catch (err) {
        console.error("Erreur ajout incident :", err);
      }
    },
    async supprimerIncident(id) {
      if (!confirm("Voulez-vous supprimer cet incident ?")) return;
      try {
        await axios.delete(`http://localhost:3000/api/signalements/${id}`);
        this.fetchIncidents();
      } catch (err) {
        console.error("Erreur suppression :", err);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString("fr-FR");
    }
  }
};
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.incident-row {
  transition: all 0.2s ease;
}

.incident-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

.description-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-card {
  transition: all 0.2s ease;
}

.detail-card:hover {
  background-color: #e9ecef !important;
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
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
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

.modal-content {
  border: none;
}

.modal-header {
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.form-control, .form-select {
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
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
  
  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .d-flex.justify-content-between .btn {
    margin-top: 1rem;
    align-self: flex-end;
  }
}
</style>