<template>
  <div class="dashboard-demandeur">
    <!-- Header avec bouton d'action -->
    <div class="header-section">
      <div class="header-title">
        <h1><i class="bi bi-speedometer2"></i> Tableau de bord - Demandeur</h1>
        <p class="welcome-message">Bienvenue, {{ userName }}. Voici l'état de vos demandes.</p>
      </div>
      <button @click="goToNouvelleDemande" class="new-request-btn">
        <i class="bi bi-plus-circle"></i> Nouvelle Demande
      </button>
    </div>

    <!-- Cartes de résumé -->
    <div class="summary-cards">
      <div class="summary-card total">
        <div class="card-icon">
          <i class="bi bi-files"></i>
        </div>
        <div class="card-content">
          <h3>Total Demandes</h3>
          <p>{{ demandes.length }}</p>
        </div>
      </div>
      
      <div class="summary-card in-progress">
        <div class="card-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <div class="card-content">
          <h3>En Cours</h3>
          <p>{{ statuts['EN COURS'] || 0 }}</p>
        </div>
      </div>
      
      <div class="summary-card planned">
        <div class="card-icon">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="card-content">
          <h3>Planifiées</h3>
          <p>{{ statuts['PLANIFIER'] || 0 }}</p>
        </div>
      </div>
      
      <div class="summary-card completed">
        <div class="card-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="card-content">
          <h3>Terminées</h3>
          <p>{{ statuts['TERMINER'] || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Tableau des demandes récentes -->
    <div class="recent-requests-section">
      <div class="section-header">
        <h2><i class="bi bi-clock-history"></i> Demandes Récentes</h2>
        <div class="view-all" @click="viewAllRequests">Voir tout <i class="bi bi-arrow-right"></i></div>
      </div>
      
      <div class="table-container">
        <table class="demandes-table">
          <thead>
            <tr>
              <th class="text-center">N° Ordre</th>
              <th>Destination</th>
              <th>Type</th>
              <th>Dates Mission</th>
              <th>Véhicule</th>
              <th>Chauffeur</th>
              <th class="text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="demande in recentDemandes" :key="demande.id">
              <td class="text-center order-cell">{{ demande.numeroOrdre }}</td>
              <td class="destination-cell">{{ demande.destination }}</td>
              <td class="type-cell">
                <span :class="['type-badge', demande.typeTrajet.toLowerCase()]">
                  {{ demande.typeTrajet === 'ALLER_SIMPLE' ? 'Aller Simple' : 'Aller-Retour' }}
                </span>
              </td>
              <td class="date-cell">
                <div class="date-info">
                  <div class="date-row">
                    <i class="bi bi-calendar-date"></i>
                    <span>{{ formatDate(demande.date_debut) }}</span>
                  </div>
                  <div v-if="demande.typeTrajet === 'ALLER_RETOUR'" class="date-row">
                    <i class="bi bi-calendar-date"></i>
                    <span>{{ formatDate(demande.date_fin) }}</span>
                  </div>
                </div>
              </td>
              <td class="vehicle-cell">
                <div v-if="demande.vehicule" class="vehicle-info">
                  <i class="bi bi-truck"></i>
                  <div>
                    <div class="vehicle-plate">{{ demande.vehicule.immatriculation }}</div>
                    <div class="vehicle-model">{{ demande.vehicule.marque }} {{ demande.vehicule.modele }}</div>
                  </div>
                </div>
                <span v-else class="empty-field">—</span>
              </td>
              <td class="driver-cell">
                <div v-if="demande.chauffeur" class="driver-info">
                  <i class="bi bi-person-vcard"></i>
                  <div>
                    <div class="driver-name">{{ demande.chauffeur.nom }} {{ demande.chauffeur.prenom }}</div>
                    <div class="driver-phone">{{ demande.chauffeur.telephone || '—' }}</div>
                  </div>
                </div>
                <span v-else class="empty-field">—</span>
              </td>
              <td class="text-center status-cell">
                <span :class="['status-badge', formatStatutClass(demande.statut)]">
                  {{ formatStatutText(demande.statut) }}
                </span>
              </td>
              
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="error-message">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "DemandeurDashboard",
  data() {
    return {
      demandes: [],
      recentDemandes: [],
      statuts: {},
      userName: "",
      error: null,
      loading: false
    };
  },
  methods: {
    goToNouvelleDemande() {
      this.$router.push("/demandeur/nouvelle-demande");
    },

    viewAllRequests() {
      // Implémentez la navigation vers la vue complète des demandes
      this.$router.push("/demandeur/mes-demandes");
    },

    viewDetails(demandeId) {
      // Implémentez la navigation vers les détails de la demande
      this.$router.push(`/demandeur/demandes/${demandeId}`);
    },

    async annulerDemande(demandeId) {
      if (!confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) return;

      try {
        this.loading = true;
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:3000/api/demandes/${demandeId}/annuler`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Rafraîchir les données après annulation
        await this.refresh();
      } catch (error) {
        console.error("Erreur lors de l'annulation:", error);
        this.error = "Erreur lors de l'annulation de la demande";
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatStatutClass(etat) {
      switch (etat) {
        case 'EN COURS': return 'in-progress';
        case 'PLANIFIER': return 'planned';
        case 'TERMINER': return 'completed';
        case 'REJETER': return 'rejected';
        case 'ANNULER': return 'cancelled';
        default: return 'default';
      }
    },

    formatStatutText(etat) {
      switch (etat) {
        case 'EN COURS': return 'En cours';
        case 'PLANIFIER': return 'Planifiée';
        case 'TERMINER': return 'Terminée';
        case 'REJETER': return 'Rejetée';
        case 'ANNULER': return 'Annulée';
        default: return etat;
      }
    },

    async refresh() {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        this.error = "Vous devez être connecté pour accéder à cette page";
        return;
      }

      try {
        this.loading = true;
        const response = await axios.get("http://localhost:3000/api/demandes/mes-demandes", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Formater les données
        this.demandes = response.data.map(d => ({
          id: d.id,
          numeroOrdre: d.n_ordre,
          destination: d.destination,
          date_debut: d.date_heure_debut,
          date_fin: d.date_heure_fin,
          statut: d.etat,
          typeTrajet: d.type_trajet,
          vehicule: d.mission?.vehicule || d.missions?.[0]?.vehicule,
          chauffeur: d.mission?.chauffeur?.utilisateur || d.missions?.[0]?.chauffeur?.utilisateur
        }));

        // Garder seulement les 5 demandes les plus récentes
        this.recentDemandes = [...this.demandes]
          .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))
          .slice(0, 5);

        // Calculer les statistiques par statut
        this.statuts = this.demandes.reduce((acc, d) => {
          acc[d.statut] = (acc[d.statut] || 0) + 1;
          return acc;
        }, {});

        // Récupérer le nom de l'utilisateur
        const user = JSON.parse(userData);
        this.userName = `${user.prenom} ${user.nom}`;

        this.error = null;
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        this.error = "Erreur lors du chargement des demandes";
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.refresh();
  }
};
</script>

<style scoped>
/* Variables de couleur */
:root {
  --sonatrach-orange: #F39200;
  --sonatrach-dark: #2C3E50;
  --sonatrach-light: #F8F9FA;
  --success: #28A745;
  --warning: #FFC107;
  --danger: #DC3545;
  --info: #17A2B8;
  --gray: #6C757D;
}

.dashboard-demandeur {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--sonatrach-dark);
  background-color: #fff;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-title h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--sonatrach-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title h1 i {
  color: var(--sonatrach-orange);
}

.welcome-message {
  color: var(--gray);
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

.new-request-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--sonatrach-orange);
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(243, 146, 0, 0.3);
}

.new-request-btn:hover {
  background-color: #e08600;
  transform: translateY(-2px);
}

.new-request-btn i {
  font-size: 1.1rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.total .card-icon {
  background-color: rgba(108, 117, 125, 0.1);
  color: var(--gray);
}

.in-progress .card-icon {
  background-color: rgba(33, 150, 243, 0.1);
  color: var(--info);
}

.planned .card-icon {
  background-color: rgba(255, 167, 38, 0.1);
  color: var(--sonatrach-orange);
}

.completed .card-icon {
  background-color: rgba(40, 167, 69, 0.1);
  color: var(--success);
}

.card-content h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--gray);
  font-weight: 500;
}

.card-content p {
  margin: 0.25rem 0 0 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--sonatrach-dark);
}

/* Recent Requests Section */
.recent-requests-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h2 i {
  color: var(--sonatrach-orange);
}

.view-all {
  color: var(--sonatrach-orange);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
}

.view-all:hover {
  color: #e08600;
  text-decoration: underline;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: white;
}

.demandes-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}

.demandes-table th {
  background-color: var(--sonatrach-dark);
  color: rgb(0, 0, 0);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem;
  text-align: left;
  position: sticky;
  top: 0;
}

.demandes-table th.text-center {
  text-align: center;
}

.demandes-table td {
  padding: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  vertical-align: middle;
}

.demandes-table tr:first-child td {
  border-top: none;
}

.demandes-table tr:hover td {
  background-color: rgba(243, 146, 0, 0.03);
}

/* Cell Styles */
.order-cell {
  font-weight: 700;
  color: var(--sonatrach-orange);
}

.destination-cell {
  font-weight: 600;
  min-width: 150px;
}

.type-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #f0f0f0;
  color: #555;
}

.type-badge.aller_simple {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type-badge.aller_retour {
  background-color: #e8f5e9;
  color: #388e3c;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-row i {
  color: var(--sonatrach-orange);
  font-size: 0.9rem;
}

.vehicle-info, .driver-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vehicle-info i, .driver-info i {
  font-size: 1.25rem;
  color: var(--sonatrach-orange);
}

.vehicle-plate, .driver-name {
  font-weight: 600;
}

.vehicle-model, .driver-phone {
  font-size: 0.75rem;
  color: var(--gray);
}

.empty-field {
  color: #999;
  font-style: italic;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.in-progress {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left: 3px solid #1976d2;
}

.status-badge.planned {
  background-color: #fff3e0;
  color: #e65100;
  border-left: 3px solid var(--sonatrach-orange);
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 3px solid #2e7d32;
}

.status-badge.rejected {
  background-color: #ffebee;
  color: #c62828;
  border-left: 3px solid #c62828;
}

.status-badge.cancelled {
  background-color: #f5f5f5;
  color: #424242;
  border-left: 3px solid #424242;
}

/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.details-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.details-btn:hover {
  background-color: #bbdefb;
}

.cancel-btn {
  background-color: #ffebee;
  color: #c62828;
  margin-right: 0.5rem;
}

.cancel-btn:hover {
  background-color: #ffcdd2;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 6px;
  margin-top: 1.5rem;
}

.error-message i {
  font-size: 1.25rem;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: var(--sonatrach-orange);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .new-request-btn {
    width: 100%;
    justify-content: center;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  .dashboard-demandeur {
    padding: 1.5rem 1rem;
  }
  
  .header-title h1 {
    font-size: 1.5rem;
  }
  
  .demandes-table td {
    padding: 0.75rem;
  }
  
  .action-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
  }
}
</style>