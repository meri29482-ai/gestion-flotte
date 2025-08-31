<template>
  <div class="normes-container">
    <!-- Header avec titre et compteur -->
    <div class="normes-header">
      <div class="title-section">
        <div class="title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor"/>
            <path d="M14 2V8H20" fill="currentColor"/>
            <path d="M16 13H8V11H16V13ZM16 17H8V15H16V17ZM13 9H8V7H13V9Z" fill="white"/>
          </svg>
        </div>
        <h1>Normes HSE</h1>
        <span class="normes-count">{{ filteredNormes.length }} sur {{ normes.length }} normes</span>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="filters-card">
      <div class="search-box">
        <span class="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
          </svg>
        </span>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Rechercher une norme..."
        />
      </div>

      <div class="filters-row">
        <div class="filter-group">
          <label>Type</label>
          <select v-model="filterType" class="filter-select">
            <option value="">Tous les types</option>
            <option>Sécurité</option>
            <option>Santé</option>
            <option>Environnement</option>
            <option>Temps de conduite</option>
            <option>Autre</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Statut</label>
          <select v-model="filterStatut" class="filter-select">
            <option value="">Tous les statuts</option>
            <option>Actif</option>
            <option>Obsolète</option>
          </select>
        </div>

        <button class="reset-filters" @click="resetFilters">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
          </svg>
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Liste des normes -->
    <div class="normes-grid">
      <div
        class="norme-card"
        v-for="norme in filteredNormes"
        :key="norme.id"
        :class="{'norme-inactive': norme.statut === 'Obsolète'}"
      >
        <div class="norme-header">
          <h3 class="norme-title">{{ norme.titre }}</h3>
          <span
            class="status-badge"
            :class="{
              'status-active': norme.statut === 'Actif',
              'status-inactive': norme.statut === 'Obsolète'
            }"
          >
            {{ norme.statut }}
          </span>
        </div>

        <div class="norme-type">
          <span class="type-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
              <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM13 16H11V11H13V16ZM13 9H11V7H13V9Z" fill="currentColor"/>
            </svg>
          </span>
          {{ norme.type }} • v{{ norme.version }}
        </div>

        <p class="norme-description">
          {{ norme.description || "Aucune description disponible." }}
        </p>

        <div class="norme-dates">
          <div class="date-item">
            <span class="date-label">Créée le</span>
            <span class="date-value">{{ formatDate(norme.date_creation) }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">Fichier daté du</span>
            <span class="date-value">{{ formatDate(norme.date_fichier) }}</span>
          </div>
        </div>

        <div class="norme-actions">
          <a
            v-if="norme.fichier"
            :href="`http://localhost:3000/uploads/documents/${norme.fichier}`"
            target="_blank"
            class="action-btn primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="white"/>
            </svg>
            Télécharger
          </a>
          <a
            v-if="norme.lien_externe"
            :href="norme.lien_externe"
            target="_blank"
            class="action-btn secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Lien externe
          </a>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="filteredNormes.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#E5E7EB"/>
          <path d="M14 2V8H20" fill="#D1D5DB"/>
          <path d="M16 13H8V11H16V13ZM16 17H8V15H16V17ZM13 9H8V7H13V9Z" fill="#9CA3AF"/>
        </svg>
      </div>
      <h3>Aucune norme trouvée</h3>
      <p>Aucune norme ne correspond à vos critères de recherche</p>
      <button class="reset-button" @click="resetFilters">
        Réinitialiser les filtres
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ListeNormes",
  data() {
    return {
      normes: [],
      search: "",
      filterType: "",
      filterStatut: "",
    };
  },
  computed: {
    filteredNormes() {
      return this.normes.filter((n) => {
        const matchSearch =
          n.titre.toLowerCase().includes(this.search.toLowerCase()) ||
          (n.description || "")
            .toLowerCase()
            .includes(this.search.toLowerCase());

        const matchType = this.filterType
          ? n.type === this.filterType
          : true;

        const matchStatut = this.filterStatut
          ? n.statut === this.filterStatut
          : true;

        return matchSearch && matchType && matchStatut;
      });
    },
  },
  methods: {
    async fetchNormes() {
      try {
        const res = await axios.get("http://localhost:3000/api/normes-hse");
        this.normes = res.data;
      } catch (error) {
        console.error("Erreur lors du chargement des normes HSE :", error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("fr-FR", options);
    },
    resetFilters() {
      this.search = "";
      this.filterType = "";
      this.filterStatut = "";
    },
  },
  mounted() {
    this.fetchNormes();
  },
};
</script>

<style scoped>
.normes-container {
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.normes-header {
  margin-bottom: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  color: white;
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.normes-count {
  margin-left: auto;
  padding: 0.375rem 0.75rem;
  background-color: #F3F4F6;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.filters-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.25rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #F9FAFB;
}

.search-input:focus {
  outline: none;
  border-color: #3B82F6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reset-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  color: #6B7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-filters:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.normes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.norme-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.norme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
  border-color: #E5E7EB;
}

.norme-inactive {
  opacity: 0.7;
  background: #F9FAFB;
}

.norme-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.norme-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-active {
  background: #ECFDF5;
  color: #047857;
}

.status-inactive {
  background: #FEF2F2;
  color: #DC2626;
}

.norme-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 1rem;
}

.type-icon {
  color: #6B7280;
}

.norme-description {
  color: #4B5563;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.norme-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-label {
  font-size: 0.875rem;
  color: #6B7280;
}

.date-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.norme-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3B82F6;
  color: white;
  border: 1px solid #3B82F6;
}

.action-btn.primary:hover {
  background: #2563EB;
  border-color: #2563EB;
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #E5E7EB;
}

.action-btn.secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6B7280;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.reset-button {
  padding: 0.75rem 1.5rem;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: #2563EB;
}

/* Responsive */
@media (max-width: 768px) {
  .normes-container {
    padding: 1rem;
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .normes-count {
    margin-left: 0;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .normes-grid {
    grid-template-columns: 1fr;
  }
}
</style>