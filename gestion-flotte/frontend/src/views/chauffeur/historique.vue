<template>
  <div class="historique-container">
    <!-- Header avec boutons -->
    <div class="historique-header">
      <div class="d-flex align-items-center">
        <i class="bi bi-clock-history fs-3 text-primary me-3"></i>
        <h1 class="mb-0">Historique des Missions</h1>
      </div>
      <div class="header-actions">
        <button @click="fetchMissions" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-arrow-repeat me-1"></i>Rafraîchir
        </button>
        <button @click="exportToExcel" class="btn btn-sm btn-outline-success">
          <i class="bi bi-file-earmark-excel me-1"></i>Exporter
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-card mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Période</label>
          <select v-model="filters.period" class="form-select">
            <option value="all">Toutes périodes</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Du</label>
          <input type="date" v-model="filters.startDate" class="form-control">
        </div>
        <div class="col-md-3">
          <label class="form-label">Au</label>
          <input type="date" v-model="filters.endDate" class="form-control">
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button @click="resetFilters" class="btn btn-outline-secondary me-2">
            <i class="bi bi-x-circle"></i>
          </button>
          <button @click="applyFilters" class="btn btn-primary flex-grow-1">
            <i class="bi bi-funnel me-1"></i>Filtrer
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="stats-grid mb-4">
      <div class="stat-card">
        <div class="stat-icon bg-light-primary">
          <i class="bi bi-check-circle text-primary"></i>
        </div>
        <div class="stat-content">
          <h6>Missions terminées</h6>
          <h3>{{ stats.totalMissions }}</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-light-success">
          <i class="bi bi-arrow-right-circle text-success"></i>
        </div>
        <div class="stat-content">
          <h6>Km parcourus</h6>
          <h3>{{ stats.totalKm }} km</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-light-warning">
          <i class="bi bi-clock-history text-warning"></i>
        </div>
        <div class="stat-content">
          <h6>Durée moyenne</h6>
          <h3>{{ stats.avgDuration }}h</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-light-info">
          <i class="bi bi-geo-alt text-info"></i>
        </div>
        <div class="stat-content">
          <h6>Destination fréquente</h6>
          <h3>{{ stats.topDestination || '-' }}</h3>
        </div>
      </div>
    </div>

    <!-- Tableau des missions -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <div v-if="filteredMissions.length === 0" class="empty-state">
          <i class="bi bi-inbox fs-1 text-muted"></i>
          <h5>Aucune mission terminée trouvée</h5>
          <p class="text-muted">Vos missions terminées apparaîtront ici</p>
          <button @click="fetchMissions" class="btn btn-primary">
            <i class="bi bi-arrow-repeat me-1"></i>Rafraîchir
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="sortable" @click="sortBy('demande.date_heure_debut')">
                  <span>Date Début</span>
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th class="sortable" @click="sortBy('demande.date_heure_fin')">
                  <span>Date Fin</span>
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Destination</th>
                <th>Véhicule</th>
                <th class="sortable" @click="sortBy('diffKm')">
                  <span>Kilométrage</span>
                  <i class="bi bi-arrow-down-up ms-1"></i>
                </th>
                <th>Durée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mission in paginatedMissions" :key="mission.id">
                <td>
                  <div class="fw-semibold">{{ formatDate(mission.demande.date_heure_debut) }}</div>
                  <small class="text-muted">{{ formatTime(mission.demande.date_heure_debut) }}</small>
                </td>
                <td>
                  <div class="fw-semibold">{{ formatDate(mission.demande.date_heure_fin) }}</div>
                  <small class="text-muted">{{ formatTime(mission.demande.date_heure_fin) }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt-fill text-primary me-2"></i>
                    {{ mission.demande.destination }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="me-2 bg-light rounded p-1">
                      <i class="bi bi-car-front text-primary"></i>
                    </div>
                    <div>
                      <div class="fw-semibold">{{ mission.vehicule.marque }} {{ mission.vehicule.modele }}</div>
                      <small class="text-muted">{{ mission.vehicule.immatriculation }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  {{ mission.diffKm !== null ? mission.diffKm + ' km' : 'N/A' }}
                </td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ calculateDuration(mission.demande.date_heure_debut, mission.demande.date_heure_fin) }}
                  </span>
                </td>
                <td>
                  <button @click="showDetails(mission)" class="btn btn-sm btn-outline-primary me-1" title="Détails">
                    <i class="bi bi-eye-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredMissions.length > 0" class="card-footer bg-white border-top-0">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            Affichage de {{ (pagination.currentPage - 1) * pagination.perPage + 1 }} à 
            {{ Math.min(pagination.currentPage * pagination.perPage, filteredMissions.length) }} sur 
            {{ filteredMissions.length }} missions
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="prevPage">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in pages" :key="page" class="page-item" :class="{ active: page === pagination.currentPage }">
                <button class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage * pagination.perPage >= filteredMissions.length }">
                <button class="page-link" @click="nextPage">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Détails -->
    <div v-if="selectedMission" class="modal fade show d-block" tabindex="-1" @click.self="selectedMission = null">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-info-circle-fill me-2"></i>
              Détails de la mission
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="selectedMission = null"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm">
                  <div class="card-header bg-white border-bottom-0">
                    <h6 class="mb-0 fw-semibold">
                      <i class="bi bi-geo-alt me-2"></i>Mission
                    </h6>
                  </div>
                  <div class="card-body">
                    <ul class="list-unstyled mb-0">
                      <li class="mb-2">
                        <i class="bi bi-calendar-event text-primary me-2"></i>
                        <strong>Date début :</strong> {{ formatDateTime(selectedMission.demande.date_heure_debut) }}
                      </li>
                      <li class="mb-2">
                        <i class="bi bi-calendar-check text-primary me-2"></i>
                        <strong>Date fin :</strong> {{ formatDateTime(selectedMission.demande.date_heure_fin) }}
                      </li>
                      <li class="mb-2">
                        <i class="bi bi-clock-history text-primary me-2"></i>
                        <strong>Durée :</strong> {{ calculateDuration(selectedMission.demande.date_heure_debut, selectedMission.demande.date_heure_fin) }}
                      </li>
                      <li class="mb-2">
                        <i class="bi bi-geo-alt-fill text-primary me-2"></i>
                        <strong>Destination :</strong> {{ selectedMission.demande.destination }}
                      </li>
                      <li>
                        <i class="bi bi-speedometer2 text-primary me-2"></i>
                        <strong>Kilométrage parcouru :</strong> {{ selectedMission.diffKm !== null ? selectedMission.diffKm + ' km' : 'N/A' }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm">
                  <div class="card-header bg-white border-bottom-0">
                    <h6 class="mb-0 fw-semibold">
                      <i class="bi bi-car-front me-2"></i>Véhicule
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="d-flex align-items-start mb-3">
                      <div class="me-3">
                        <div class="avatar bg-light-primary text-primary">
                          <i class="bi bi-car-front-fill fs-4"></i>
                        </div>
                      </div>
                      <div>
                        <h6 class="mb-1">{{ selectedMission.vehicule.marque }} {{ selectedMission.vehicule.modele }}</h6>
                        <p class="text-muted small mb-1">{{ selectedMission.vehicule.immatriculation }}</p>
                        <p class="mb-0 small">
                          <i class="bi bi-speedometer2 me-1 text-primary"></i>
                          {{ selectedMission.vehicule.kilometrage }} km
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top-0">
            <button type="button" class="btn btn-outline-secondary" @click="selectedMission = null">
              <i class="bi bi-x-lg me-1"></i>Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from 'xlsx';

export default {
  name: "HistoriqueMissions",
  data() {
    return {
      missions: [],
      loading: false,
      selectedMission: null,
      filters: {
        period: 'all',
        startDate: null,
        endDate: null,
        searchQuery: ''
      },
      sortConfig: {
        key: 'demande.date_heure_debut',
        direction: 'desc'
      },
      pagination: {
        currentPage: 1,
        perPage: 10
      },
      stats: {
        totalMissions: 0,
        totalKm: 0,
        avgDuration: 0,
        topDestination: ''
      }
    };
  },
  computed: {
    missionsTerminees() {
      return this.missions.filter(m => m.etat === "terminer");
    },
    filteredMissions() {
      let filtered = this.missionsTerminees;

      // Filtre par période
      if (this.filters.period !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (this.filters.period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        filtered = filtered.filter(mission => {
          const missionDate = new Date(mission.demande.date_heure_fin);
          return missionDate >= startDate;
        });
      }

      // Filtre par dates personnalisées
      if (this.filters.startDate && this.filters.endDate) {
        const start = new Date(this.filters.startDate);
        const end = new Date(this.filters.endDate);
        end.setHours(23, 59, 59, 999);

        filtered = filtered.filter(mission => {
          const missionDate = new Date(mission.demande.date_heure_fin);
          return missionDate >= start && missionDate <= end;
        });
      }

      // Tri
      filtered.sort((a, b) => {
        const aValue = this.getNestedValue(a, this.sortConfig.key);
        const bValue = this.getNestedValue(b, this.sortConfig.key);

        if (aValue < bValue) return this.sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    },
    paginatedMissions() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage;
      const end = start + this.pagination.perPage;
      return this.filteredMissions.slice(start, end);
    },
    pages() {
      const totalPages = Math.ceil(this.filteredMissions.length / this.pagination.perPage);
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        const half = Math.floor(maxVisiblePages / 2);
        let start = this.pagination.currentPage - half;
        let end = this.pagination.currentPage + half;
        if (start < 1) { start = 1; end = maxVisiblePages; }
        if (end > totalPages) { end = totalPages; start = totalPages - maxVisiblePages + 1; }
        for (let i = start; i <= end; i++) pages.push(i);
      }
      
      return pages;
    }
  },
  watch: {
    filteredMissions: {
      immediate: true,
      handler(newVal) {
        this.updateStats(newVal);
        this.pagination.currentPage = 1;
      }
    }
  },
  methods: {
    getNestedValue(obj, path) {
      return path.split('.').reduce((o, p) => o?.[p], obj);
    },
    updateStats(missions) {
      this.stats.totalMissions = missions.length;
      this.stats.totalKm = missions.reduce((sum, mission) => sum + (parseInt(mission.diffKm) || 0), 0);
      
      if (missions.length > 0) {
        const totalHours = missions.reduce((sum, mission) => {
          const start = new Date(mission.demande.date_heure_debut);
          const end = new Date(mission.demande.date_heure_fin);
          return sum + (end - start) / (1000 * 60 * 60);
        }, 0);
        this.stats.avgDuration = (totalHours / missions.length).toFixed(1);
        
        const destinations = missions.reduce((acc, mission) => {
          const dest = mission.demande.destination;
          acc[dest] = (acc[dest] || 0) + 1;
          return acc;
        }, {});
        this.stats.topDestination = Object.entries(destinations).sort((a,b) => b[1]-a[1])[0][0];
      } else {
        this.stats.avgDuration = 0;
        this.stats.topDestination = '';
      }
    },
    async fetchMissions() {
      try {
        this.loading = true;
        const token = localStorage.getItem("token");
        const utilisateur = JSON.parse(localStorage.getItem("user"));

        if (!token || !utilisateur?.id) {
          console.warn("Utilisateur non connecté ou id manquant.");
          return;
        }

        // 1️⃣ Récupérer l'id du chauffeur à partir de l'id utilisateur
        const chauffeurRes = await axios.get(`http://localhost:3000/api/chauffeurs/utilisateur/${utilisateur.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const chauffeurId = chauffeurRes.data?.id;

        if (!chauffeurId) {
          console.warn("Aucun chauffeur associé à cet utilisateur.");
          return;
        }

        // 2️⃣ Récupérer les missions pour le chauffeur
        const response = await axios.get(
          `http://localhost:3000/api/missions/chauffeur/${chauffeurId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.missions = response.data;
      } catch (error) {
        console.error("Erreur de récupération des missions :", error);
        this.$toast.error("Erreur lors du chargement de l'historique");
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString("fr-FR", { day:'2-digit', month:'2-digit', year:'numeric' });
    },
    formatTime(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleTimeString("fr-FR", { hour:'2-digit', minute:'2-digit' });
    },
    formatDateTime(dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString("fr-FR", { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    },
    calculateDuration(startStr, endStr) {
      if (!startStr || !endStr) return 'N/A';
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diffMs = end - start;
      const hours = Math.floor(diffMs / (1000*60*60));
      const minutes = Math.floor((diffMs % (1000*60*60)) / (1000*60));
      return hours > 0 ? `${hours}h${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
    },
    sortBy(key) {
      if (this.sortConfig.key === key) this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      else { this.sortConfig.key = key; this.sortConfig.direction = 'asc'; }
    },
    applyFilters() { this.pagination.currentPage = 1; },
    resetFilters() { this.filters = { period:'all', startDate:null, endDate:null, searchQuery:'' }; },
    showDetails(mission) { this.selectedMission = mission; },
    exportToExcel() {
      if (this.filteredMissions.length === 0) { this.$toast.warning("Aucune donnée à exporter"); return; }

      try {
        const data = this.filteredMissions.map(mission => ({
          'Date Début': this.formatDateTime(mission.demande.date_heure_debut),
          'Date Fin': this.formatDateTime(mission.demande.date_heure_fin),
          'Destination': mission.demande.destination,
          'Véhicule': `${mission.vehicule.marque} ${mission.vehicule.modele}`,
          'Immatriculation': mission.vehicule.immatriculation,
          'Kilométrage Parcouru': mission.diffKm ?? 'N/A',
          'Durée': this.calculateDuration(mission.demande.date_heure_debut, mission.demande.date_heure_fin)
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Historique Missions");
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `historique_missions_${date}.xlsx`);
        this.$toast.success("Export Excel réussi");
      } catch (error) {
        console.error("Erreur lors de l'export Excel:", error);
        this.$toast.error("Erreur lors de l'export");
      }
    },
    prevPage() { if (this.pagination.currentPage > 1) this.pagination.currentPage--; },
    nextPage() { if (this.pagination.currentPage < Math.ceil(this.filteredMissions.length / this.pagination.perPage)) this.pagination.currentPage++; },
    goToPage(page) { this.pagination.currentPage = page; }
  },
  mounted() { this.fetchMissions(); }
};
</script>

<style scoped>
.historique-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 56px);
}

.historique-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filters-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.03);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-content h6 {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0;
}

.table {
  --bs-table-bg: transparent;
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom-width: 1px;
}

.table td {
  padding-top: 1rem;
  padding-bottom: 1rem;
  vertical-align: middle;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.empty-state h5 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.loading-overlay {
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
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.bg-light-primary {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-light-success {
  background-color: rgba(25, 135, 84, 0.1);
}

.bg-light-warning {
  background-color: rgba(255, 193, 7, 0.1);
}

.bg-light-info {
  background-color: rgba(13, 202, 240, 0.1);
}

.text-primary {
  color: #0d6efd;
}

.text-success {
  color: #198754;
}

.text-warning {
  color: #ffc107;
}

.text-info {
  color: #0dcaf0;
}

.modal {
  backdrop-filter: blur(5px);
}

@media (max-width: 768px) {
  .historique-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .historique-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>