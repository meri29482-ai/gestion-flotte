<template>
  <div class="container py-4">
    <!-- Header avec recherche - Version améliorée -->
    <div class="page-header mb-5 p-4 rounded-3 shadow-sm bg-white">
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
      <!-- Titre -->
    <div>
      <h1 class="page-title mb-1">
        <i class="bi bi-person-badge-fill me-2 text-primary"></i>
        Gestion des Chauffeurs
      </h1>
      <p class="page-subtitle text-muted">
        Liste complète des chauffeurs disponibles
      </p>
    </div>

    <!-- Recherche -->
    <div class="col-md-4 d-flex align-items-center">
      <div class="search-box position-relative w-100">
        <i class="bi bi-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control search-input rounded-pill ps-5"
          placeholder="Rechercher un chauffeur..."
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="btn btn-clear position-absolute top-50 end-0 translate-middle-y me-2"
          type="button"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Filtres rapides - Style moderne -->
  <!-- Filtres Chauffeur - Style moderne -->
<div class="filters-container mt-4">
  <div class="d-flex flex-column align-items-center gap-2">
    <!-- Label centré -->
    <span class="filter-label fw-semibold text-center text-muted mb-1">
      Filtres Chauffeur par état :
    </span>

    <!-- Boutons flex wrap -->
    <div class="filter-chips d-flex flex-wrap gap-2 justify-content-center">
      <button
        v-for="etat in etats"
        :key="etat"
        @click="toggleEtat(etat)"
        class="filter-chip btn btn-outline-secondary rounded-pill px-3 py-1"
        :class="{ 'active btn-primary text-white': filtreEtat === etat }"
      >
        <span
          class="status-indicator me-2 rounded-circle"
          :class="'bg-' + couleurEtat(etat)"
          style="width:12px; height:12px; display:inline-block;"
        ></span>
        <span>{{ etat }}</span>
      </button>
    </div>
  </div>
</div>

</div>



    <!-- Grille des cartes - Version améliorée -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="erreurChargement" class="error-container">
      <i class="bi bi-exclamation-triangle text-danger"></i>
      <p>Erreur de chargement des données</p>
      <button class="btn btn-sm btn-outline-primary" @click="fetchChauffeurs">Réessayer</button>
    </div>

    <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
      <div class="col" v-for="chauffeur in chauffeursFiltres" :key="chauffeur.id">
        <div class="card h-100 chauffeur-card">
          <!-- Photo et statut - Version améliorée avec cercle -->
          <div class="card-img-top position-relative d-flex flex-column align-items-center pt-4">
            <div class="avatar-circle-container">
              <div class="avatar-circle-wrapper">
                <img v-if="chauffeur.utilisateur?.photo" 
                     :src="'http://localhost:3000/uploads/' + chauffeur.utilisateur.photo" 
                     class="driver-avatar-circle">
                <div v-else class="avatar-circle-placeholder">
                  <i class="bi bi-person-circle"></i>
                </div>
              </div>
            </div>
            <span class="status-badge" :class="'bg-' + couleurEtat(chauffeur.etat)">
              {{ chauffeur.etat }}
            </span>
          </div>

          <!-- Infos principales -->
          <div class="card-body text-center">
            <h5 class="driver-name">
              {{ chauffeur.utilisateur?.prenom }} {{ chauffeur.utilisateur?.nom }}
            </h5>
            <p class="driver-id">ID: {{ chauffeur.utilisateur?.matricule }}</p>
            
            <!-- Documents mini -->
            <div class="documents-badges justify-content-center">
              <div v-for="doc in documentsPrincipaux" :key="doc.type" 
                   class="document-badge" 
                   :class="getDocBadgeClass(chauffeur, doc.type)">
                <i :class="doc.icon"></i>
                <span v-if="getDoc(chauffeur, doc.type)" class="expiry-date">
                  {{ formatDateShort(getDoc(chauffeur, doc.type).date_expiration) }}
                </span>
                <span v-else class="no-doc">—</span>
              </div>
            </div>
          </div>

          <!-- Footer avec bouton détail -->
          <div class="card-footer bg-transparent border-top-0">
            <button class="btn btn-details" @click="goToDetails(chauffeur.id)">
              <i class="bi bi-eye-fill"></i> Voir fiche complète
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Etat vide - Style amélioré -->
    <div v-if="!loading && chauffeursFiltres.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <i class="bi bi-people"></i>
      </div>
      <h5>Aucun chauffeur trouvé</h5>
      <p class="text-muted">Essayez de modifier vos critères de recherche</p>
      <button class="btn btn-outline-primary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Réinitialiser les filtres
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResponsableChauffeurs',
  data() {
    return {
      chauffeurs: [],
      loading: true,
      searchQuery: '',
      filtreEtat: null,
      erreurChargement: false,
      etats: ['Dispo', 'en mission', 'hors service'],
      documentsPrincipaux: [
        { type: 'permis_conduire', icon: 'bi bi-card-text', label: 'Permis' },
        { type: 'certificat_medical', icon: 'bi bi-heart-pulse', label: 'Médical' },
        { type: 'certificat_capacite', icon: 'bi bi-award', label: 'Capacité' }
      ],
    };
  },
  computed: {
    chauffeursFiltres() {
      return this.chauffeurs.filter(c => {
        const matchRecherche = !this.searchQuery ||
          [c.utilisateur?.nom, c.utilisateur?.prenom, c.utilisateur?.matricule]
            .join(' ')
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        const matchEtat = !this.filtreEtat || c.etat === this.filtreEtat;

        return matchRecherche && matchEtat;
      });
    }
  },
  methods: {
    async fetchChauffeurs() {
      try {
        this.loading = true;
        const { data } = await axios.get('http://localhost:3000/api/chauffeurs');
        this.chauffeurs = data;
      } catch (error) {
        console.error('Erreur de chargement des chauffeurs :', error);
        this.erreurChargement = true;
      } finally {
        this.loading = false;
      }
    },
    couleurEtat(etat) {
      const map = {
        'Dispo': 'success',
        'en mission': 'warning',
        'hors service': 'danger'
      };
      return map[etat] || 'secondary';
    },
    getDoc(chauffeur, type) {
      return chauffeur.documents?.find(d => d.type_document === type);
    },
    getDocBadgeClass(chauffeur, type) {
      const doc = this.getDoc(chauffeur, type);
      if (!doc) return 'bg-light text-dark';
      return this.isExpired(doc.date_expiration) ? 'bg-danger' : 'bg-success';
    },
    isExpired(date) {
      return date && new Date(date) < new Date();
    },
    formatDateShort(date) {
      return date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—';
    },
    toggleEtat(etat) {
      this.filtreEtat = this.filtreEtat === etat ? null : etat;
    },
     goToDetails(chauffeurId) {
      this.$router.push({
        path: `/responsable/chauffeurs/${chauffeurId}`,
      });
    },

    goToAjout() {
      this.$router.push('/chauffeurs/nouveau');
    },

    resetFilters() {
      this.searchQuery = '';
      this.filtreEtat = null;
    }
  },

  mounted() {
    this.fetchChauffeurs();
  }
};
</script>

<style scoped>
/* Variables CSS */
:root {
  --primary: #3a86ff;
  --primary-light: #e6f0ff;
  --secondary: #6c757d;
  --success: #28a745;
  --warning: #fd7e14;
  --danger: #dc3545;
  --light: #f8f9fa;
  --dark: #343a40;
  --border-radius: 12px;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

.page-header {
  background-color: #fff;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
}

.search-input {
  padding-left: 2.5rem;
  transition: box-shadow 0.2s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #0d6efd;
}

.btn-clear {
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 1rem;
  cursor: pointer;
}

.filter-label {
  font-size: 0.95rem;
  color: #495057;
}

.filter-btn {
  min-width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.filter-btn .status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.filter-btn:hover {
  transform: translateY(-1px);
}

.status-indicator.bg-DISPO { background-color: #198754; }
.status-indicator.bg-EN_MISSION { background-color: #0d6efd; }
.status-indicator.bg-MAINTENANCE { background-color: #ffc107; }
.status-indicator.bg-HORS_SERVICE { background-color: #dc3545; }

/* Header amélioré */
.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-container {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary);
}

.search-input {
  padding-left: 40px;
  border-radius: var(--border-radius);
  border: 1px solid #e0e0e0;
}

.btn-add {
  border-radius: var(--border-radius);
  padding: 8px 16px;
  font-weight: 500;
}

/* Filtres modernes */
.filters-container {
  background: white;
  padding: 12px;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  color: var(--secondary);
  font-size: 0.85rem;
  transition: var(--transition);
}

.filter-btn.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn:hover {
  background: #f5f5f5;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* Cartes améliorées avec photo en cercle */
.chauffeur-card {
  border: none;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  background: rgba(243, 243, 243, 0.699);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chauffeur-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

/* Conteneur pour l'avatar circulaire */
.avatar-circle-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-circle-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.driver-avatar-circle {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-circle-placeholder {
  font-size: 3.5rem;
  color: #adb5bd;
}

.status-badge {
  position: absolute;
  bottom: 10px;
  right: calc(50% - 60px);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(0, 0, 0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 0 16px 16px;
  width: 100%;
}

.driver-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--dark);
}

.driver-id {
  font-size: 0.8rem;
  color: var(--secondary);
  margin-bottom: 12px;
}

.documents-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.document-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  background: #f8f9fa;
  color: var(--dark);
}

.document-badge i {
  font-size: 0.9rem;
}

.bg-success {
  background-color: #28a768 !important;
  color: white !important;
}

.bg-danger {
  background: rgba(207, 0, 0, 0.726) !important;
  color: white !important;
}

.card-footer {
  width: 100%;
  padding: 16px;
  margin-top: auto;
}

.btn-details {
  width: 100%;
  border-radius: var(--border-radius);
  background: white;
  border: 1px solid var(--primary);
  color: var(--primary);
  font-size: 0.85rem;
  transition: var(--transition);
  padding: 8px;
}

.btn-details:hover {
  background: var(--primary-light);
}

/* Etat vide amélioré */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-top: 20px;
}

.empty-state-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.5rem;
  color: var(--secondary);
}

/* États de chargement */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 40px;
}

.error-container i {
  font-size: 2rem;
  margin-bottom: 16px;
  color: var(--danger);
}

/* Responsive */
@media (max-width: 768px) {
  .avatar-circle-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .btn-add {
    width: 100%;
  }
}
</style>
