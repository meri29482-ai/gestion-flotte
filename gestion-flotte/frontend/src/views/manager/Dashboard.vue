<template>
  <div class="dashboard-demandeur">
  <div class="header-bar">
    <h1>🎯 Tableau de bord - Demandeur</h1>
    <div class="actions">
      <button @click="goToNouvelleDemande">➕ Nouvelle Demande</button>
    </div>
  </div>

    <div class="summary">
      <div class="card">
        <h3>Total demandes</h3>
        <p>{{ demandes.length }}</p>
      </div>
      <div class="card orange">
        <h3>En cours</h3>
        <p>{{ demandes.filter(d => d.statut === 'En cours').length }}</p>
      </div>
      <div class="card green">
        <h3>Terminées</h3>
        <p>{{ demandes.filter(d => d.statut === 'Terminée').length }}</p>
      </div>
    </div>

    <h2>📋 Dernières demandes</h2>
    <table class="demandes-table">
      <thead>
        <tr>
          <th>Numéro</th>
          <th>Destination</th>
          <th>Début</th>
          <th>Fin</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="demande in demandes" :key="demande.id">
          <td>{{ demande.numeroOrdre }}</td>
          <td>{{ demande.destination }}</td>
          <td>{{ demande.date_debut }}</td>
          <td>{{ demande.date_fin }}</td>
          <td>
            <span :class="'badge ' + demande.statut.toLowerCase().replace('é', 'e')">
              {{ demande.statut }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "DemandeurDashboard",
  data() {
    return {
      demandes: [],
      error: null
    };
  },
  methods: {
    goToNouvelleDemande() {
      this.$router.push("/demandeur/nouvelle-demande");
    },

    formatStatut(etat) {
      switch (etat) {
        case 'EN COURS': return 'En cours';
        case 'PLANIFIER': return 'Planifiée';
        case 'TERMINER': return 'Terminée';
        case 'REJETER': return 'Rejetée';
        default: return 'En attente';
      }
    },

    async refresh() {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        this.error = "⚠️ Utilisateur non identifié. Veuillez vous reconnecter.";
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/demandes/mes-demandes", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.demandes = response.data.map(d => ({
          id: d.id,
          numeroOrdre: d.n_ordre,
          destination: d.destination,
          date_debut: d.date_heure_debut?.split("T")[0],
          date_fin: d.date_heure_fin?.split("T")[0],
          statut: this.formatStatut(d.etat)
        }));

        this.error = null;

      } catch (error) {
        console.error("Erreur lors du chargement des demandes :", error);
        this.error = "❌ Impossible de charger les demandes.";
      }
    }
  },
  mounted() {
    this.refresh(); // Charger les données dès le montage du composant
  }
};
</script>

<style scoped>
.dashboard-demandeur {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  color: #2c3e50;
  background-color: #f8f9fa;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.header-bar h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

h1 {
  color: #333;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.actions button {
  padding: 0.6rem 1.4rem;
  background-color: #2d3436;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.actions button:hover {
  background-color: #000;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.card {
  flex: 1;
  min-width: 200px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card.orange {
  border-left: 5px solid #ffa726;
}

.card.green {
  border-left: 5px solid #4caf50;
}

.card h3 {
  margin: 0;
  font-size: 1rem;
  color: #888;
}

.card p {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.3rem;
  color: #2c3e50;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.demandes-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.demandes-table th,
.demandes-table td {
  padding: 0.9rem 1rem;
  text-align: left;
}

.demandes-table thead {
  background-color: #f1f1f1;
  color: #333;
}

.demandes-table tbody tr {
  border-top: 1px solid #eee;
  transition: background-color 0.2s;
}

.demandes-table tbody tr:hover {
  background-color: #f9f9f9;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  color: #fff;
}

.badge.en {
  background-color: #2196f3;
}
.badge.planifiee {
  background-color: #ff9800;
}
.badge.terminee {
  background-color: #4caf50;
}
.badge.rejetee {
  background-color: #f44336;
}
.badge.en.attente {
  background-color: #9e9e9e;
}

@media (max-width: 768px) {
  .summary {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .actions button {
    width: 100%;
  }

  .demandes-table {
    font-size: 0.9rem;
  }

  .card {
    padding: 1rem;
  }
}

</style>
