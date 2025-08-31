<template>
  <div class="demandes-container">
    <div class="header-section">
      <div class="title-wrapper">
        <h1 class="page-title">
          <i class="bi bi-file-earmark-text"></i>
          Mes Demandes de Transport
        </h1>
        <p v-if="userId" class="user-id">
          <i class="bi bi-person-badge"></i>
          Matricule : {{ userId }}
        </p>
      </div>

      <div class="search-container">
        <div class="search-input">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Rechercher par destination ou N° Ordre..."
            v-model="search"
            class="search-field"
          />
        </div>
      </div>
    </div>

    <div v-if="filteredDemandes.length > 0" class="table-wrapper">
      <table class="demandes-table">
        <thead>
          <tr>
            <th class="text-center">Type</th>
            <th class="text-center">N° Ordre</th>
            <th class="text-center">Destination</th>
            <th class="text-center">Chauffeur</th>
            <th class="text-center">Véhicule</th>
            <th class="text-center">Dates Mission</th>
            <th class="text-center">État</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="demande in filteredDemandes" :key="demande.id" class="table-row">
            <!-- Type -->
            <td class="text-center type-cell">
              <i v-if="demande.type_trajet === 'ALLER_SIMPLE'" class="bi bi-arrow-right type-icon"></i>
              <i v-else class="bi bi-arrow-left-right type-icon"></i>
              <span class="type-text">{{ demande.type_trajet === 'ALLER_SIMPLE' ? 'Aller Simple' : 'Aller-Retour' }}</span>
            </td>

            <!-- N° Ordre -->
            <td class="text-center order-cell">{{ demande.n_ordre }}</td>

            <!-- Destination -->
            <td class="text-center destination-cell">{{ demande.destination || '—' }}</td>

            <!-- Chauffeur -->
            <td class="text-center driver-cell">
              <div v-if="demande.mission?.chauffeur?.utilisateur" class="driver-info">
                <i class="bi bi-person-vcard driver-icon"></i>
                <div class="driver-details">
                  <span class="driver-name">{{ demande.mission.chauffeur.utilisateur.nom }} {{ demande.mission.chauffeur.utilisateur.prenom }}</span>
                  <span v-if="demande.mission.chauffeur.utilisateur.numero_telephone">{{ demande.mission.chauffeur.utilisateur.numero_telephone }}</span>
                  <span v-else class="text-muted">—</span>
                </div>
              </div>
              <span v-else class="empty-field">—</span>
            </td>

            <!-- Véhicule -->
            <td class="text-center vehicle-cell">
              <div v-if="demande.mission?.vehicule" class="vehicle-info">
                <i class="bi bi-truck vehicle-icon"></i>
                <div class="vehicle-details">
                  <span class="vehicle-plate">{{ demande.mission.vehicule.immatriculation }}</span>
                  <span class="vehicle-model">{{ demande.mission.vehicule.marque }} {{ demande.mission.vehicule.modele }}</span>
                </div>
              </div>
              <span v-else class="empty-field">—</span>
            </td>

            <!-- Dates -->
            <td class="text-center date-cell">
              <div class="date-info">
                <div class="date-row">
                  <i class="bi bi-calendar-date date-icon"></i>
                  <span class="date-label">Aller:</span>
                  <span class="date-value">{{ formatDateTime(demande.date_heure_debut) }}</span>
                </div>
                <div v-if="demande.type_trajet === 'ALLER_RETOUR'" class="date-row">
                  <i class="bi bi-calendar-date date-icon"></i>
                  <span class="date-label">Retour:</span>
                  <span class="date-value">{{ formatDateTime(demande.date_heure_fin) }}</span>
                </div>
              </div>
            </td>

            <!-- État -->
            <td class="text-center status-cell">
              <span :class="['status-badge', formatStatutClass(demande.etat)]">{{ formatStatutText(demande.etat) }}</span>
            </td>

            <!-- Actions -->
            <td class="text-center actions-cell">
              <button
                v-if="['EN COURS', 'PLANIFIER'].includes(demande.etat)"
                @click="annulerDemande(demande.id)"
                class="cancel-button"
              >
                <i class="bi bi-x-circle"></i> Annuler
              </button>
              <span v-else class="empty-action">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <p class="empty-text">Aucune demande trouvée</p>
    </div>

    <div v-if="error" class="error-message">
      <i class="bi bi-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MesDemandes",
  data() {
    return {
      search: "",
      demandes: [],
      error: "",
      userId: null
    };
  },
  computed: {
    filteredDemandes() {
      const keyword = this.search.toLowerCase();
      return this.demandes.filter(d =>
        d.destination?.toLowerCase().includes(keyword) ||
        d.n_ordre?.toString().includes(keyword)
      );
    }
  },
  methods: {
    // Récupère les demandes
    async fetchDemandes() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.error = "Vous devez être connecté.";
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/demandes/mes-demandes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.demandes = response.data;
        this.userId = response.data?.[0]?.utilisateur?.id || null;
        console.log("Mes demandes:", this.demandes);
      } catch (error) {
        console.error(error);
        this.error = "Erreur lors de la récupération des demandes.";
      }
    },

    // Annule une demande
    async annulerDemande(id) {
      if (!confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) return;
      try {
        const token = localStorage.getItem("token");

        await axios.put(`http://localhost:3000/api/demandes/${id}`, { etat: "ANNULER" }, { headers: { Authorization: `Bearer ${token}` } });

        this.demandes = this.demandes.map(d => d.id === id ? { ...d, etat: "ANNULER" } : d);

        await axios.post("http://localhost:3000/api/notifications", {
          type: "INFO",
          titre: "Demande annulée",
          message: `La demande N°${id} a été annulée avec succès.`,
          utilisateur_id: this.currentUser?.id || null,
          recepteur_id: 22,
          date_envoi: new Date()
        }, { headers: { Authorization: `Bearer ${token}` } });

      } catch (error) {
        console.error(error);
        this.error = "Erreur lors de l'annulation de la demande.";
      }
    },

    // Formate les dates
    formatDateTime(dateStr) {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    },

    // Classe CSS pour l'état
    formatStatutClass(etat) {
      switch (etat) {
        case 'EN COURS': return 'status-in-progress';
        case 'PLANIFIER': return 'status-planned';
        case 'TERMINER': return 'status-completed';
        case 'REJETER': return 'status-rejected';
        case 'ANNULER': return 'status-cancelled';
        default: return 'status-default';
      }
    },

    // Texte lisible pour l'état
    formatStatutText(etat) {
      switch (etat) {
        case 'EN COURS': return 'En cours';
        case 'PLANIFIER': return 'Planifiée';
        case 'TERMINER': return 'Terminée';
        case 'REJETER': return 'Rejetée';
        case 'ANNULER': return 'Annulée';
        default: return etat;
      }
    }
  },
  mounted() {
    this.fetchDemandes();
  }
};
</script>

<style scoped>
/* Base Styles with Sonatrach Orange Colors */
.demandes-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f5f5f5;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #F39200; /* Sonatrach orange accent */
}

.title-wrapper {
  flex: 1;
  min-width: 300px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #F39200; /* Sonatrach orange */
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title .bi {
  font-size: 1.5rem;
  color: #F39200;
}

.user-id {
  font-size: 0.875rem;
  color: #555;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f1f1;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #F39200;
}

.user-id .bi {
  font-size: 1rem;
  color: #F39200;
}

/* Search Container */
.search-container {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  color: #777;
  z-index: 10;
}

.search-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #555;
  background-color: white;
  transition: all 0.2s ease;
  border-left: 3px solid #F39200;
}

.search-field:focus {
  outline: none;
  border-color: #F39200;
  box-shadow: 0 0 0 3px rgba(243, 146, 0, 0.1);
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
  background-color: white;
  border: 1px solid #e0e0e0;
}

.demandes-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.demandes-table th {
  background-color: #F39200; /* Sonatrach orange */
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem;
  text-align: center;
  border: none;
  position: sticky;
  top: 0;
}

.demandes-table td {
  padding: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.875rem;
  vertical-align: middle;
}

.demandes-table tr:first-child td {
  border-top: none;
}

.demandes-table tr:hover td {
  background-color: rgba(243, 146, 0, 0.05);
}

/* Table Cell Styles */
.order-cell .order-number {
  font-weight: 700;
  color: #F39200;
  font-size: 1rem;
}

.type-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.type-cell .type-icon {
  font-size: 1.5rem;
  color: #F39200;
}

.type-cell .type-text {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

.destination-cell .destination-text {
  font-weight: 600;
  color: #333;
}

.driver-cell .driver-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.driver-cell .driver-icon {
  font-size: 1.25rem;
  color: #F39200;
}

.driver-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.driver-name {
  font-weight: 600;
  color: #333;
}

.driver-badge {
  font-size: 0.65rem;
  background-color: #fef3e6;
  color: #F39200;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  margin-top: 0.25rem;
  font-weight: 600;
}

.vehicle-cell .vehicle-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vehicle-cell .vehicle-icon {
  font-size: 1.25rem;
  color: #F39200;
}

.vehicle-cell .vehicle-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.vehicle-cell .vehicle-plate {
  font-weight: 600;
  color: #333;
}

.vehicle-cell .vehicle-model {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

.date-cell .date-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-icon {
  font-size: 1rem;
  color: #F39200;
}

.date-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
}

.date-value {
  font-weight: 500;
  color: #333;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-in-progress {
  background-color: #fff3cd;
  color: #856404;
  border-left: 3px solid #ffc107;
}

.status-planned {
  background-color: #fef3e6;
  color: #7c4a03;
  border-left: 3px solid #F39200;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
  border-left: 3px solid #28a745;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 3px solid #dc3545;
}

.status-cancelled {
  background-color: #e2e3e5;
  color: #383d41;
  border-left: 3px solid #6c757d;
}

.status-default {
  background-color: #e2e8f0;
  color: #475569;
  border-left: 3px solid #adb5bd;
}

/* Action Buttons */
.cancel-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.cancel-button:hover {
  background-color: #f8d7da;
}

.cancel-button .bi {
  font-size: 0.875rem;
}

/* Empty States */
.empty-field, .empty-action {
  color: #999;
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
  border-left: 4px solid #F39200;
}

.empty-icon {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-text {
  color: #666;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  margin-top: 1.5rem;
  border-left: 3px solid #dc3545;
}

.error-icon {
  font-size: 1rem;
  color: #721c24;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
  }
  
  .search-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .demandes-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .demandes-table th, 
  .demandes-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8125rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }
  
  .cancel-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
  }
}

@media (max-width: 640px) {
  .demandes-table {
    display: block;
    width: 100%;
  }
  
  .demandes-table thead {
    display: none;
  }
  
  .demandes-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  
  .demandes-table tr::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #F39200;
    border-radius: 4px 0 0 4px;
  }
  
  .demandes-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px solid #eee;
  }
  
  .demandes-table td:last-child {
    border-bottom: none;
  }
  
  .demandes-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #F39200;
    margin-right: 1rem;
    flex: 1;
    font-size: 0.75rem;
  }
  
  .demandes-table td > * {
    flex: 2;
    text-align: right;
  }
  
  /* Hide rowspan cells in mobile */
  .demandes-table td[rowspan] {
    display: none;
  }
  
  /* Show first cell with order number */
  .demandes-table tr > td:first-child {
    display: flex;
    font-weight: 700;
    font-size: 1rem;
    color: #F39200;
    border-bottom: 2px solid #F39200;
    margin-bottom: 0.5rem;
    padding-bottom: 0.75rem;
  }
  
  .demandes-table tr > td:first-child::before {
    content: 'Demande N°';
  }
  
  /* Adjust icons in mobile */
  .driver-cell .driver-info,
  .vehicle-cell .vehicle-info {
    gap: 0.5rem;
  }
  
  .driver-cell .driver-icon,
  .vehicle-cell .vehicle-icon {
    font-size: 1rem;
  }
  
  /* Status badge in mobile */
  .status-badge {
    margin-left: auto;
  }
}
</style>