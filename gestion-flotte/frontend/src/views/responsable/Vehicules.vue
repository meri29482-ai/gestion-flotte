<template>
  <div class="container py-4">
    <!-- Header principal -->
<div class="page-header mb-5">
  <div
  class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center  "
>
    <!-- Titre -->
    <div>
      <h1 class="page-title mb-1">
        <i class="bi bi-car-front-fill me-2 text-primary"></i>
        Gestion du parc véhicules
      </h1>
      <p class="page-subtitle text-muted">
        Liste complète des véhicules disponibles
      </p>
    </div>

    <!-- Recherche -->
    <div class="col-md-4 d-flex align-items-center">
      <div class="search-box position-relative w-100">
        <i class="bi bi-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control search-input"
          placeholder="Rechercher un véhicule..."
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="btn btn-clear"
          type="button"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <!-- Bouton -->
    <div class="col-md-3 d-flex align-items-center">
      <button class="btn btn-add w-100" @click="openAddModal">
        <i class="bi bi-plus-lg me-2"></i>
        Nouveau véhicule
      </button>
    </div>
  </div>
  <div class="filters-container mt-4 ">
     <div class="d-flex flex-column align-items-center gap-2 ">
    <span class="filter-label fw-semibold text-center">Filtres véhicule par état :</span>
    <div class="filter-chips d-flex flex-wrap gap-2">
      <button
        v-for="etat in etatsFiltres"
        :key="etat.value"
        @click="toggleEtatFilter(etat.value)"
        class="filter-chip"
        :class="{ active: etatFilter.includes(etat.value) }"
      >
        <span class="status-indicator" :class="'status-' + etat.value"></span>
        <span>{{ etat.label }}</span>
      </button>
    </div>
  </div>
</div>
</div>



    <!-- Loader -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des véhicules...</p>
    </div>

    <!-- Liste véhicules -->
    <template v-else>
      <div class="vehicles-grid">
        <div
          v-for="vehicule in filteredVehicules"
          :key="vehicule.id"
          class="vehicle-card-wrapper"
          @click="goToDetails(vehicule.id)"
        >
          <div class="vehicle-card">
            <div class="vehicle-image-container">
              <img
                :src="vehicule.photo_url ? `http://localhost:3000/uploads/vehicules/${vehicule.photo_url}` : placeholderImage"
                class="vehicle-image"
                alt="Photo du véhicule"
              />
              <div class="vehicle-overlay">
                <span
                  class="vehicle-status"
                  :class="'status-' + vehicule.etat"
                >
                  {{ getStatusText(vehicule.etat) }}
                </span>
              </div>
            </div>

            <div class="vehicle-content">
              <div class="vehicle-header">
                <h3 class="vehicle-title">
                  {{ vehicule.marque }} {{ vehicule.modele }}
                </h3>
                <span class="vehicle-year">{{ vehicule.annee }}</span>
              </div>

              <div class="vehicle-details">
                <div class="detail-item">
                  <i class="bi bi-tag-fill"></i>
                  <span>{{ vehicule.immatriculation }}</span>
                </div>
                <div class="detail-item">
                  <i class="bi bi-speedometer2"></i>
                  <span>{{ formatNumber(vehicule.kilometrage) }} km</span>
                </div>
                <div class="detail-item">
                  <i class="bi bi-car-front"></i>
                  <span>{{ vehicule.type || "Non spécifié" }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-if="filteredVehicules.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-car-front"></i>
          </div>
          <h3>Aucun véhicule trouvé</h3>

          <template v-if="hasActiveFilters">
            <p>Aucun résultat pour vos critères de recherche</p>
            <button class="btn btn-outline" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser
            </button>
          </template>

          <template v-else>
            <p>Votre parc de véhicules est vide</p>
            <button class="btn btn-primary" @click="openAddModal">
              <i class="bi bi-plus-lg me-1"></i>Ajouter
            </button>
          </template>
        </div>
      </div>
    </template>

    <!-- Modal Ajout -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>Ajouter un nouveau véhicule
            </h2>
            <button
              type="button"
              class="btn-close"
              @click="showAddModal = false"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitVehicule">
              <div class="form-grid">
                <div class="form-group">
                  <label for="immatriculation" class="form-label"
                    >Immatriculation</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="immatriculation"
                    v-model="newVehicule.immatriculation"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="marque" class="form-label">Marque</label>
                  <input
                    type="text"
                    class="form-control"
                    id="marque"
                    v-model="newVehicule.marque"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="modele" class="form-label">Modèle</label>
                  <input
                    type="text"
                    class="form-control"
                    id="modele"
                    v-model="newVehicule.modele"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="type" class="form-label">Type</label>
                  <input
                    type="text"
                    class="form-control"
                    id="type"
                    v-model="newVehicule.type"
                  />
                </div>
                <div class="form-group">
                  <label for="annee" class="form-label">Année</label>
                  <input
                    type="number"
                    class="form-control"
                    id="annee"
                    v-model="newVehicule.annee"
                  />
                </div>
                <div class="form-group">
                  <label for="kilometrage" class="form-label"
                    >Kilométrage</label
                  >
                  <input
                    type="number"
                    class="form-control"
                    id="kilometrage"
                    v-model="newVehicule.kilometrage"
                  />
                </div>
                <div class="form-group">
                  <label for="date_achat" class="form-label"
                    >Date d'achat</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="date_achat"
                    v-model="newVehicule.date_achat"
                  />
                </div>
                <div class="form-group">
                  <label for="etat" class="form-label">État</label>
                  <select
                    class="form-select"
                    id="etat"
                    v-model="newVehicule.etat"
                    required
                  >
                    <option value="DISPO">Disponible</option>
                    <option value="EN_MISSION">En mission</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="HORS_SERVICE">Hors service</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label for="photo" class="form-label">Photo du véhicule</label>
                  <input
                    type="file"
                    class="form-control"
                    id="photo"
                    @change="handleFileUpload('photo', $event)"
                  />
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Documents</label>
                  <div class="documents-grid">
                    <div class="document-upload">
                      <label for="assurance" class="document-label"
                        >Assurance</label
                      >
                      <input
                        type="file"
                        class="form-control"
                        id="assurance"
                        @change="handleFileUpload('assurance', $event)"
                      />
                    </div>
                    <div class="document-upload">
                      <label for="carte_grise" class="document-label"
                        >Carte grise</label
                      >
                      <input
                        type="file"
                        class="form-control"
                        id="carte_grise"
                        @change="handleFileUpload('carte_grise', $event)"
                      />
                    </div>
                    <div class="document-upload">
                      <label for="controle_technique" class="document-label"
                        >Contrôle technique</label
                      >
                      <input
                        type="file"
                        class="form-control"
                        id="controle_technique"
                        @change="handleFileUpload('controle_technique', $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="showAddModal = false"
                >
                  <i class="bi bi-x-lg me-1"></i>Annuler
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner"></span>
                  <i v-else class="bi bi-check-lg me-1"></i>
                  {{ isSubmitting ? "Enregistrement..." : "Enregistrer" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'VehiculeList',
  data() {
    return {
      vehicules: [],
      loading: true,
      searchQuery: '',
      etatFilter: [],
      selectedVehicule: null,
      showAddModal: false,
      isSubmitting: false,
      placeholderImage: 'https://via.placeholder.com/300x200?text=Photo+Véhicule',
      newVehicule: {
        immatriculation: '',
        marque: '',
        modele: '',
        type: '',
        annee: '',
        kilometrage: '',
        date_achat: '',
        etat: 'DISPO',
        photo: null,
        assurance: null,
        carte_grise: null,
        controle_technique: null
      },
      etatsFiltres: [
        { value: 'DISPO', label: 'Disponible' },
        { value: 'EN_MISSION', label: 'En mission' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'HORS_SERVICE', label: 'Hors service' }
      ]
    };
  },
  computed: {
    filteredVehicules() {
      return this.vehicules.filter(vehicule => {
        // Filtre par recherche
        const matchesSearch = this.searchQuery ? 
          [vehicule.marque, vehicule.modele, vehicule.immatriculation].some(
            field => field && field.toLowerCase().includes(this.searchQuery.toLowerCase())
          ) : true;
        
        // Filtre par état
        const matchesEtat = this.etatFilter.length > 0 ? 
          this.etatFilter.includes(vehicule.etat) : true;
        
        return matchesSearch && matchesEtat;
      });
    },
    hasActiveFilters() {
      return this.searchQuery || this.etatFilter.length > 0;
    }
  },
  methods: {
    async fetchVehicules() {
      try {
        this.loading = true;
        const { data } = await axios.get('http://localhost:3000/api/vehicules');
        this.vehicules = data;
      } catch (error) {
        console.error('Erreur de chargement:', error);
      } finally {
        this.loading = false;
      }
    },
    getStatusClass(status) {
      switch(status) {
        case 'DISPO': return 'success';
        case 'EN_MISSION': return 'warning';
        case 'MAINTENANCE': return 'info';
        case 'HORS_SERVICE': return 'danger';
        default: return 'secondary';
      }
    },
    getStatusText(status) {
      const map = {
        'DISPO': 'Disponible',
        'EN_MISSION': 'En mission',
        'MAINTENANCE': 'Maintenance',
        'HORS_SERVICE': 'Hors service'
      };
      return map[status] || status;
    },
    formatNumber(num) {
      return num ? num.toLocaleString('fr-FR') : '0';
    },
    toggleEtatFilter(etat) {
      if (this.etatFilter.includes(etat)) {
        this.etatFilter = this.etatFilter.filter(e => e !== etat);
      } else {
        this.etatFilter = [...this.etatFilter, etat];
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.etatFilter = [];
    },
    goToDetails(vehiculeId) {
      this.$router.push({
        path: `/responsable/vehicules/${vehiculeId}`,
        query: { from: 'list' }
      });
    },
    editVehicule(vehicule) {
      this.$router.push(`/vehicules/edit/${vehicule.id}`);
    },
    openAddModal() {
      this.showAddModal = true;
    },
    handleFileUpload(field, event) {
      this.newVehicule[field] = event.target.files[0];
    },
    async submitVehicule() {
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        
        // Ajouter les champs du véhicule
        Object.keys(this.newVehicule).forEach(key => {
          if (this.newVehicule[key] !== null && this.newVehicule[key] !== undefined) {
            formData.append(key, this.newVehicule[key]);
          }
        });

        await axios.post('http://localhost:3000/api/vehicules', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.showAddModal = false;
        this.resetForm();
        this.fetchVehicules();
        
        this.$toast.success('Véhicule créé avec succès', {
          position: 'top-right',
          duration: 3000
        });
      } catch (error) {
        console.error('Erreur création véhicule:', error);
        this.$toast.error('Erreur lors de la création du véhicule', {
          position: 'top-right',
          duration: 3000
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.newVehicule = {
        immatriculation: '',
        marque: '',
        modele: '',
        type: '',
        annee: '',
        kilometrage: '',
        date_achat: '',
        etat: 'DISPO',
        photo: null,
        assurance: null,
        carte_grise: null,
        controle_technique: null
      };
    }
  },
  mounted() {
    this.fetchVehicules();
  }
};
</script>

<style scoped>
/* 🌈 Palette modernisée */
:root {
  --primary: #3b82f6;       /* Bleu moderne */
  --primary-dark: #1d4ed8;
  --primary-light: #dbeafe;
  --secondary: #6b7280;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #06b6d4;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --radius: 14px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-md: 0 6px 10px rgba(0,0,0,0.1);
  --shadow-lg: 0 12px 24px rgba(0,0,0,0.15);
  --transition: all 0.25s ease;
}

/* 🟦 Container principal */
.container {
  max-width: 1300px;
  margin: auto;
  background: var(--gray-50);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.6s ease-in-out;
}
@keyframes fadeIn {
  from {opacity: 0; transform: translateY(10px);}
  to {opacity: 1; transform: translateY(0);}
}

/* 🏷️ Header */
.page-header {
  border-bottom: 2px solid var(--gray-200);
  padding-bottom: 1.2rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-subtitle {
  font-size: 1rem;
  color: var(--gray-500);
}
.btn-add {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: rgb(0, 0, 0);
  font-weight: 600;
  border-radius: var(--radius);
  padding: 0.75rem 1.5rem;
  transition: var(--transition);
}
.btn-add:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

/* 🔍 Filtres et recherche */
.filters-section {
  margin-top: 1.8rem;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}
.search-box {
  position: relative;
  width: 100%;
  transition: all 0.3s ease;
}

.search-box .search-input {
  padding: 10px 14px 10px 40px; /* espace pour l’icône */
  border: 1px solid #dee2e6;
  border-radius: 25px;
  font-size: 0.95rem;
  background-color: #f9f9fb;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-box .search-input:focus {
  outline: none;
  border-color: #0d6efd; /* bleu bootstrap */
  background-color: #fff;
  box-shadow: 0 0 8px rgba(13, 110, 253, 0.2);
}

.search-box .search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.search-box .search-input:focus + .search-icon {
  color: #0d6efd;
}

.btn-clear {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #6c757d;
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-clear:hover {
  color: #dc3545;
}

/* ➕ Bouton ajout véhicule */
.btn-add {
  border-radius: 30px;
  font-weight: 500;
  background: linear-gradient(135deg, #0d6efd, #0a58ca);
  border: none;
  padding: 0.6rem 1.2rem;
  box-shadow: 0 3px 6px rgba(13, 110, 253, 0.25);
  transition: all 0.3s ease;
  color: white;
}

.btn-add:hover {
  background: linear-gradient(135deg, #0b5ed7, #084298);
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(13, 110, 253, 0.35);
}

/* === FILTRES === */
.filter-label {
  font-size: 0.95rem;
  color: #495057;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 6px 14px;
  border-radius: 50px;
  border: 1px solid #d6d6d6;
  background: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
}

.filter-chip:hover {
  background: #f8f9fa;
  border-color: #bbb;
}

.filter-chip.active {
  background: linear-gradient(135deg, #0d6efd, #0a58ca);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 6px rgba(13, 110, 253, 0.3);
}

/* Indicateurs de statut */
.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-disponible {
  background-color: #28a745; /* Vert */
}
.status-en_mission {
  background-color: #ffc107; /* Jaune */
}
.status-en_panne {
  background-color: #686868; /* Jaune */
}
.status-maintenance {
  background-color: #dc3545; /* Rouge */
}
.status-reserve {
  background-color: #6c757d; /* Gris */
}

/* 🚘 Grille véhicules */
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.vehicle-card-wrapper {
  cursor: pointer;
}
.vehicle-card {
  background: rgba(248, 248, 248, 0.637);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}
.vehicle-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.vehicle-image-container {
  height: 180px;
  position: relative;
  overflow: hidden;
}
.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}
.vehicle-card:hover .vehicle-image {
  transform: scale(1.06);
}
.vehicle-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.35));
  display: flex;
  align-items: flex-start;
  padding: 1rem;
}
.vehicle-status {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}
.status-DISPO { background: rgb(112, 197, 134); }
.status-EN_MISSION { background: rgb(226, 186, 9); }
.status-MAINTENANCE { background: rgb(50, 118, 219); }
.status-HORS_SERVICE { background: rgb(209, 35, 35); }
.status-EN_PANNE { background: rgb(255, 81, 0); }

.vehicle-content {
  padding: 1.2rem;
  flex: 1;
}
.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vehicle-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray-800);
}
.vehicle-year {
  font-size: 0.85rem;
  background: var(--gray-100);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  color: var(--gray-600);
}
.vehicle-details {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--gray-600);
  font-size: 0.9rem;
}

/* 📭 État vide */
.empty-state {
  grid-column: 1 / -1;
  background: var(--gray-100);
  border-radius: var(--radius);
  padding: 3rem;
  text-align: center;
  border: 2px dashed var(--gray-300);
}
.empty-icon {
  font-size: 3rem;
  color: var(--gray-400);
  margin-bottom: 1rem;
}
.empty-state h3 {
  font-size: 1.4rem;
  color: var(--gray-700);
}
.empty-state p {
  color: var(--gray-500);
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: var(--radius);
  padding: 0.6rem 1.2rem;
  transition: var(--transition);
}
.btn-outline:hover {
  background: var(--primary);
  color: rgb(143, 201, 172);
}

/* 🖼️ Modal */
.modal-backdrop {
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
}
.modal-container {
  max-width: 750px;
  width: 95%;
}
.modal-content {
  background: rgb(255, 255, 255);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: slideUp 0.4s ease;
}
@keyframes slideUp {
  from {transform: translateY(20px); opacity: 0;}
  to {transform: translateY(0); opacity: 1;}
}
.modal-header {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: rgb(192, 192, 192);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-weight: 700;
  margin: 0;
}
.btn-close {
  background: none;
  border: none;
  color: rgb(117, 122, 122);
  font-size: 1.2rem;
  cursor: pointer;
  transition: var(--transition);
}
.btn-close:hover {
  transform: rotate(90deg);
  color: var(--gray-200);
}
.modal-body {
  padding: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem 1.2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--gray-700);
}
.form-control, .form-select {
  border-radius: var(--radius);
  border: 1px solid var(--gray-300);
  padding: 0.6rem 0.8rem;
  transition: var(--transition);
}
.form-control:focus, .form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.documents-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.document-upload {
  flex: 1;
  min-width: 200px;
}
.modal-footer {
  padding: 1rem 1.5rem;
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
