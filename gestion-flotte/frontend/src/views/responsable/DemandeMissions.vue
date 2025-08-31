<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
        <h5 class="mb-0 fw-semibold text-primary">
          <i class="fas fa-clipboard-list me-2"></i>Gestion des demandes de mission
        </h5>
        <div class="d-flex gap-3">
          <div class="input-group input-group-sm" style="width: 300px;">
            <span class="input-group-text bg-light border-end-0"><i class="fas fa-search"></i></span>
            <input
              v-model="filtre"
              type="search"
              placeholder="Rechercher..."
              class="form-control border-start-0"
            />
          </div>
          <button class="btn btn-sm btn-outline-primary" @click="exporterExcel">
            <i class="fas fa-file-excel me-1"></i> Exporter
          </button>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown">
              <i class="fas fa-filter me-1"></i> Filtres
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li><h6 class="dropdown-header">Statut</h6></li>
              <li v-for="etat in etatsPossibles" :key="etat">
                <a class="dropdown-item" href="#" @click.prevent="toggleFiltreEtat(etat)">
                  <i class="far fa-check-square me-2" :class="{ 'far fa-square': !filtresEtats.includes(etat) }"></i>
                  {{ etat }}
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><h6 class="dropdown-header">Type de trajet</h6></li>
              <li v-for="type in typesTrajet" :key="type.value">
                <a class="dropdown-item" href="#" @click.prevent="toggleFiltreType(type.value)">
                  <i class="far fa-check-square me-2" :class="{ 'far fa-square': !filtresTypes.includes(type.value) }"></i>
                  {{ type.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="mt-2 text-muted">Chargement des demandes en cours...</p>
        </div>

        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
          <button type="button" class="btn-close" @click="error = null"></button>
        </div>

        <div class="table" v-if="!loading">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th width="40"><i class="fas fa-route"></i></th>
                <th width="50">#</th>
                <th>N° Ordre</th>
                <th>Demandeur</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(demande, index) in demandesFiltrees" :key="demande.id" @click="voirDetails(demande)" style="cursor: pointer;">
                <td class="text-center">
                  <i class="fas fa-fw" :class="typeTrajetIcon(demande.type_trajet)" :title="formatTypeTrajet(demande.type_trajet)"></i>
                </td>
                <td class="text-muted">{{ index + 1 }}</td>
                <td>
                  <span class="badge bg-light text-dark">{{ demande.n_ordre }}</span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      <span class="avatar-title rounded-circle bg-primary text-white">
                        {{ (demande.utilisateur?.nom?.charAt(0) || '') + (demande.utilisateur?.prenom?.charAt(0) || '') }}
                      </span>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ demande.utilisateur?.nom }} {{ demande.utilisateur?.prenom }}</h6>
                      <small class="text-muted">{{ demande.utilisateur?.matricule || 'N/A' }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ demande.destination }}</td>
                <td>
                  <div>{{ formatDate(demande.date_heure_debut) }}</div>
                  <small class="text-muted" v-if="demande.date_heure_fin">
                    au {{ formatDate(demande.date_heure_fin) }}
                  </small>
                </td>
                <td>
                  <span class="badge" :class="etatClass(demande.etat)">
                    {{ demande.etat }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-light" @click.stop="voirDetails(demande)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="demande.etat === 'EN COURS'"
                      class="btn btn-sm btn-primary"
                      @click.stop="ouvrirFormulaire(demande)"
                      title="Planifier"
                    >
                      <i class="fas fa-calendar-check"></i>
                    </button>
                    <button
                      v-if="demande.etat === 'EN COURS'"
                      class="btn btn-sm btn-danger"
                      @click.stop="rejeterDemande(demande)"
                      title="Rejeter"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!loading && demandesFiltrees.length === 0" class="text-center py-5">
            <div class="empty-state">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">Aucune demande trouvée</h5>
              <p class="text-muted">Aucune demande ne correspond à vos critères de recherche</p>
              <button class="btn btn-outline-primary" @click="reinitialiserFiltres">
                <i class="fas fa-sync-alt me-1"></i> Réinitialiser les filtres
              </button>
            </div>
          </div>

          
        </div>
      </div>
    </div>

    <!-- Modale de planification -->
    <div 
  v-if="demandeAPlanifier" 
  class="modal fade show d-block" 
  tabindex="-1" 
  role="dialog" 
  style="background-color: rgba(0,0,0,0.5)"
>
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      
      <!-- Header -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">
          <i class="fas fa-calendar-alt me-2"></i> Planifier une mission
        </h5>
        <button type="button" class="btn-close btn-close-white" @click="fermerFormulaire"></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="row mb-4">

          <!-- Colonne gauche : Détails de la demande -->
          <div class="col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <h6 class="card-title text-muted mb-3">Détails de la demande</h6>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">N° Ordre:</span>
                    <span class="fw-semibold">{{ demandeAPlanifier.n_ordre }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Demandeur:</span>
                    <span class="fw-semibold">{{ demandeAPlanifier.utilisateur?.nom }} {{ demandeAPlanifier.utilisateur?.prenom }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Destination:</span>
                    <span class="fw-semibold">{{ demandeAPlanifier.destination }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Dates:</span>
                    <span class="fw-semibold">
                      {{ formatDateTime(demandeAPlanifier.date_heure_debut) }}
                      <span v-if="demandeAPlanifier.date_heure_fin">
                        - {{ formatDateTime(demandeAPlanifier.date_heure_fin) }}
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Colonne droite : Formulaire -->
          <div class="col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
            <form @submit.prevent="planifierMission">
             
              <!-- Type de mission -->
              <div class="mb-3">
                <h6 class="card-title text-muted mb-3">Planifier mission</h6>
                
              </div>

              <!-- Sélection véhicule -->
              <div class="mb-3">
                <label class="form-label">Véhicule</label>
                <select v-model="vehiculeSelectionne" class="form-select" required>
                  <option disabled value="">Sélectionner un véhicule</option>
                  <option v-for="v in vehiculesDisponibles" :key="v.id" :value="v.id">
                    {{ v.immatriculation }} - {{ v.marque }} {{ v.modele }} ({{ v.type_vehicule }})
                  </option>
                </select>
              </div>

              <!-- Sélection chauffeur -->
              <div class="mb-3">
                <label class="form-label">Chauffeur</label>
                <select v-model="chauffeurSelectionne" class="form-select" required>
                  <option disabled value="">Sélectionner un chauffeur</option>
                  <option v-for="c in chauffeursDisponibles" :key="c.id" :value="c.id">
                    {{ c.utilisateur.nom }} {{ c.utilisateur.prenom }} ({{ c.categorie_permis }})
                  </option>
                </select>
              </div>

             

              <!-- Actions -->
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="fermerFormulaire">
                  <i class="fas fa-times me-1"></i> Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-check me-1"></i> Confirmer la mission
                </button>
              </div>

              
            </form>
            </div>
            </div>
          
          </div>

        </div>
      </div>
    </div>
  </div>
</div>


    <!-- Modale de détails -->
    <div v-if="demandeDetails" class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>Détails de la demande
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="demandeDetails = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-4">
                  <h6 class="text-muted mb-3">Informations générales</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span class="text-muted">N° Ordre:</span>
                      <span class="fw-semibold">{{ demandeDetails.n_ordre }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span class="text-muted">Statut:</span>
                      <span class="badge" :class="etatClass(demandeDetails.etat)">
                        {{ demandeDetails.etat }}
                      </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span class="text-muted">Type de trajet:</span>
                      <span class="badge" :class="typeTrajetClass(demandeDetails.type_trajet)">
                        <i class="fas fa-fw me-1" :class="typeTrajetIcon(demandeDetails.type_trajet)"></i>
                        {{ formatTypeTrajet(demandeDetails.type_trajet) }}
                      </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span class="text-muted">Date création:</span>
                      <span class="fw-semibold">{{ formatDateTime(demandeDetails.created_at) }}</span>
                    </li>
                  </ul>
                </div>

                <div class="mb-4">
                  <h6 class="text-muted mb-3">Détails du trajet</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <span class="text-muted">Destination:</span>
                      <span class="fw-semibold">{{ demandeDetails.destination }}</span>
                    </li>
                    <li class="list-group-item px-0 py-2">
                      <div class="text-muted mb-1">Itinéraire:</div>
                      <div class="fw-semibold">{{ demandeDetails.itineraire || 'Non spécifié' }}</div>
                    </li>
                    <li class="list-group-item px-0 py-2">
                      <div class="text-muted mb-1">Dates:</div>
                      <div class="fw-semibold">
                        Départ: {{ formatDateTime(demandeDetails.date_heure_debut) }}
                        <template v-if="demandeDetails.date_heure_fin">
                          <br>Retour: {{ formatDateTime(demandeDetails.date_heure_fin) }}
                        </template>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-4">
                  <h6 class="text-muted mb-3">Demandeur</h6>
                  <div class="d-flex align-items-center mb-3">
                    <div class="avatar-lg me-3">
                      <span class="avatar-title rounded-circle bg-primary text-white fs-3">
                        {{ (demandeDetails.utilisateur?.nom?.charAt(0) || '') + (demandeDetails.utilisateur?.prenom?.charAt(0) || '') }}
                      </span>
                    </div>
                    <div>
                      <h5 class="mb-0">{{ demandeDetails.utilisateur?.nom }} {{ demandeDetails.utilisateur?.prenom }}</h5>
                      <div class="text-muted">{{ demandeDetails.utilisateur?.matricule || 'N/A' }}</div>
                      <div class="text-muted small">{{ demandeDetails.utilisateur?.service || 'Service non spécifié' }}</div>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <h6 class="text-muted mb-3">Mission associée</h6>
                  <div v-if="missionAssociee" class="card border-0 shadow-sm">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge" :class="etatMissionClass(missionAssociee.etat)">
                          {{ missionAssociee.etat }}
                        </span>
                        <small class="text-muted">#{{ missionAssociee.id }}</small>
                      </div>
                      <div class="mb-2">
                        <div class="d-flex align-items-center">
                          <i class="fas fa-car me-2 text-muted"></i>
                          <span class="fw-semibold">{{ missionAssociee.vehicule?.immatriculation }} - {{ missionAssociee.vehicule?.marque }}</span>
                        </div>
                        <div class="d-flex align-items-center">
                          <i class="fas fa-user-tie me-2 text-muted"></i>
                          <span class="fw-semibold">{{ missionAssociee.chauffeur?.utilisateur.nom }} {{ missionAssociee.chauffeur?.utilisateur.prenom }}</span>
                        </div>
                      </div>
                      <div class="text-muted small">
                        <div>Départ: {{ formatDateTime(missionAssociee.date_depart) }}</div>
                        <div v-if="missionAssociee.date_retour">Retour: {{ formatDateTime(missionAssociee.date_retour) }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-muted">
                    <i class="fas fa-info-circle me-2"></i>Aucune mission associée
                  </div>
                </div>

                <div>
                  <h6 class="text-muted mb-3">Observations</h6>
                  <div class="card border-0 shadow-sm">
                    <div class="card-body">
                      {{ demandeDetails.observation || 'Aucune observation' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="demandeDetails = null">
              <i class="fas fa-times me-1"></i> Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      demandes: [],
      loading: true,
      error: null,
      filtre: '',
      filtresEtats: [],
      filtresTypes: [],
      demandeAPlanifier: null,
      demandeDetails: null,
      missionAssociee: null,
      vehiculesDisponibles: [],
      chauffeursDisponibles: [],
      vehiculeSelectionne: '',
      chauffeurSelectionne: '',
      typeMission: 'aller',
      dateDepart: '',
      dateRetour: '',
      remarques: '',
      typesMission: [
        { value: 'aller', label: 'Aller simple' },
        { value: 'retour', label: 'Retour' },
        { value: 'aller-retour', label: 'Aller-retour' }
      ],
      etatsPossibles: ['EN COURS', 'PLANIFIER', 'TERMINER', 'REJETER', 'ANNULER'],
      typesTrajet: [
        { value: 'ALLER_SIMPLE', label: 'Aller simple' },
        { value: 'ALLER_RETOUR', label: 'Aller-retour' }
      ]
    };
  },
  mounted() {
    this.chargerDemandes();
  },
  computed: {
    demandesFiltrees() {
      let result = this.demandes;

      if (this.filtre) {
        const filtreMinuscule = this.filtre.toLowerCase();
        result = result.filter(d =>
          d.n_ordre?.toLowerCase().includes(filtreMinuscule) ||
          d.utilisateur?.nom?.toLowerCase().includes(filtreMinuscule) ||
          d.utilisateur?.prenom?.toLowerCase().includes(filtreMinuscule) ||
          d.destination?.toLowerCase().includes(filtreMinuscule) ||
          d.itineraire?.toLowerCase().includes(filtreMinuscule)
        );
      }

      if (this.filtresEtats.length > 0) {
        result = result.filter(d => this.filtresEtats.includes(d.etat));
      }

      if (this.filtresTypes.length > 0) {
        result = result.filter(d => this.filtresTypes.includes(d.type_trajet));
      }

      return result;
    }
  },
  methods: {
    async chargerDemandes() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/demandes", {
          headers: { Authorization: `Bearer ${token}` },
          params: { include: 'utilisateur' }
        });
        this.demandes = res.data;
      } catch (err) {
        this.error = "Erreur lors du chargement des demandes.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async voirDetails(demande) {
      this.demandeDetails = demande;
      try {
        const token = localStorage.getItem("token");
        if (demande.etat === 'PLANIFIER' || demande.etat === 'TERMINER') {
          const res = await axios.get(`http://localhost:3000/api/missions?demande_id=${demande.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { include: 'vehicule,chauffeur.utilisateur' }
          });
          this.missionAssociee = res.data[0] || null;
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la mission associée:", error);
      }
    },

    async rejeterDemande(demande) {
      const confirmation = await Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Vous êtes sur le point de rejeter cette demande. Cette action est irréversible.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, rejeter',
        cancelButtonText: 'Annuler'
      });

      if (!confirmation.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:3000/api/demandes/${demande.id}`, {
          etat: "REJETER",
          observation: "Demande rejetée par l'administrateur"
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('Rejeté!', 'La demande a été rejetée avec succès.', 'success');
        this.chargerDemandes();
      } catch (error) {
        console.error("Erreur lors du rejet de la demande :", error);
        Swal.fire('Erreur!', 'Une erreur est survenue lors du rejet de la demande.', 'error');
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatTypeTrajet(type) {
      const types = {
        'ALLER_SIMPLE': 'Aller simple',
        'ALLER_RETOUR': 'Aller-retour'
      };
      return types[type] || type;
    },

    typeTrajetIcon(type) {
      const icons = {
        'ALLER_SIMPLE': 'fa-arrow-right',
        'ALLER_RETOUR': 'fa-exchange-alt'
      };
      return icons[type] || 'fa-route';
    },

    typeTrajetClass(type) {
      return {
        'bg-primary-light text-primary': type === 'ALLER_SIMPLE',
        'bg-info-light text-info': type === 'ALLER_RETOUR'
      };
    },
    etatMissionClass(etat) {
    const map = {
      'en attente': 'bg-info text-white',
      'en cours': 'bg-primary text-white',
      'terminer': 'bg-success text-white',
      'annuler': 'bg-danger text-white'
    };
    return map[etat] || 'bg-secondary text-white';
  },

    etatClass(etat) {
      return {
        'bg-warning-light text-warning': etat === 'EN COURS',
        'bg-primary-light text-primary': etat === 'PLANIFIER',
        'bg-success-light text-success': etat === 'TERMINER',
        'bg-danger-light text-danger': etat === 'REJETER',
        'bg-secondary-light text-secondary': etat === 'ANNULER'
      };
    },

    async ouvrirFormulaire(demande) {
      this.demandeAPlanifier = demande;
      this.vehiculeSelectionne = '';
      this.chauffeurSelectionne = '';
      this.typeMission = demande.type_trajet === 'ALLER_RETOUR' ? 'aller-retour' : 'aller';
      this.dateDepart = new Date(demande.date_heure_debut).toISOString().slice(0, 16);
      this.dateRetour = demande.date_heure_fin ? new Date(demande.date_heure_fin).toISOString().slice(0, 16) : '';
      this.remarques = '';

      try {
        const token = localStorage.getItem("token");

        const [vehiculesRes, chauffeursRes] = await Promise.all([
          axios.get("http://localhost:3000/api/vehicules", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/chauffeurs", {
            headers: { Authorization: `Bearer ${token}` },
            params: { include: 'utilisateur' }
          })
        ]);

        const dateActuelle = new Date();

        this.vehiculesDisponibles = vehiculesRes.data.filter(v =>
          v.etat === 'DISPO' &&
          (!v.assurance_expiration || new Date(v.assurance_expiration) >= dateActuelle) &&
          (!v.controle_technique_expiration || new Date(v.controle_technique_expiration) >= dateActuelle)
        );

        this.chauffeursDisponibles = chauffeursRes.data.filter(c =>
          c.etat === 'Dispo' &&
          (!c.certificat_capacite_expiration || new Date(c.certificat_capacite_expiration) >= dateActuelle) &&
          (!c.certificat_medical_expiration || new Date(c.certificat_medical_expiration) >= dateActuelle) &&
          (!c.permis_expiration || new Date(c.permis_expiration) >= dateActuelle)
        );

      } catch (error) {
        console.error("Erreur lors du chargement des ressources :", error);
        Swal.fire('Erreur!', 'Une erreur est survenue lors du chargement des véhicules ou chauffeurs disponibles.', 'error');
      }
    },

    fermerFormulaire() {
      this.demandeAPlanifier = null;
    },

   async planifierMission() {
  if (!this.vehiculeSelectionne || !this.chauffeurSelectionne || !this.dateDepart) {
    Swal.fire('Champs manquants', 'Veuillez remplir tous les champs obligatoires.', 'warning');
    return;
  }

  if (this.typeMission === 'aller-retour' && !this.dateRetour) {
    Swal.fire('Date de retour manquante', 'Veuillez spécifier une date de retour.', 'warning');
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // 🔹 Données envoyées au backend
    const missionData = {
      demande_id: this.demandeAPlanifier.id,
      vehicule_id: this.vehiculeSelectionne,
      chauffeur_id: this.chauffeurSelectionne,
      date_depart: this.dateDepart,
      date_retour: this.typeMission === "aller-retour" ? this.dateRetour : null,
      etat: "en attente",
      type_trajet: this.typeMission.toUpperCase().replace("-", "_") // "ALLER_SIMPLE" ou "ALLER_RETOUR"
    };

    // 🔹 Un seul appel → le backend crée 1 ou 2 missions selon type_trajet
    await axios.post("http://localhost:3000/api/missions", missionData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🔹 Mise à jour de l'état de la demande
    await axios.put(
      `http://localhost:3000/api/demandes/${this.demandeAPlanifier.id}`,
      { etat: "PLANIFIER" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Swal.fire('Succès!', 'La mission a été planifiée avec succès.', 'success');
    this.fermerFormulaire();
    this.chargerDemandes();

  } catch (error) {
    let message = "Une erreur est survenue lors de la planification de la mission.";
    if (error.response?.data?.message) message = error.response.data.message;
    Swal.fire('Erreur!', message, 'error');
  }
},

    exporterExcel() {
      if (!this.demandesFiltrees || this.demandesFiltrees.length === 0) {
        this.$toast?.warning("Aucune donnée à exporter.");
        return;
      }

      const data = this.demandesFiltrees.map(d => ({
        'N° Ordre': d.n_ordre,
        'Nom': d.utilisateur?.nom || '',
        'Prénom': d.utilisateur?.prenom || '',
        'Type trajet': this.formatTypeTrajet(d.type_trajet),
        'Destination': d.destination || '',
        'Date début': this.formatDateTime(d.date_heure_debut) || '',
        'Date fin': d.date_heure_fin ? this.formatDateTime(d.date_heure_fin) : '',
        'Statut': d.etat || '',
        'Observation': d.observation || ''
      }));

      const headers = Object.keys(data[0]).join(';');
      const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(';'));
      const csv = [headers, ...rows].join('\n');

      try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `demandes_mission_${new Date().toISOString().slice(0, 10)}.csv`);
        Swal.fire('Export réussi!', 'Les données ont été exportées avec succès.', 'success');
      } catch (error) {
        console.error("Erreur export CSV :", error);
        this.$toast?.error('Erreur lors de l\'export des données.');
      }
    }
  }
};
</script>

<style scoped>
.avatar-sm {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar-lg {
  width: 60px;
  height: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar-title {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.bg-primary-light {
  background-color: rgba(37, 99, 235, 0.1);
}

.bg-success-light {
  background-color: rgba(16, 185, 129, 0.1);
}

.bg-warning-light {
  background-color: rgba(245, 158, 11, 0.1);
}

.bg-danger-light {
  background-color: rgba(220, 38, 38, 0.1);
}

.bg-info-light {
  background-color: rgba(6, 182, 212, 0.1);
}

.bg-secondary-light {
  background-color: rgba(107, 114, 128, 0.1);
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.card {
  border-radius: 0.5rem;
}

.list-group-item {
  border-radius: 0.25rem !important;
  margin-bottom: 0.25rem;
}

.table-hover tbody tr:hover {
  background-color: rgba(37, 99, 235, 0.05);
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
}

.btn-group .btn {
  border-radius: 0.25rem !important;
}

.form-select, .form-control {
  border-radius: 0.25rem;
}

.input-group-text {
  border-radius: 0.25rem 0 0 0.25rem !important;
}

.input-group input {
  border-radius: 0 0.25rem 0.25rem 0 !important;
}

.pagination .page-item .page-link {
  border-radius: 0.25rem;
  margin: 0 0.15rem;
}

.pagination .page-item.active .page-link {
  background-color: #2563eb;
  border-color: #2563eb;
}

.fa-route {
  color: #6c757d;
}
</style>