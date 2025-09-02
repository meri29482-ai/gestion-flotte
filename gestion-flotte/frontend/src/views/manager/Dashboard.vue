<template>
  <div class="chef-dashboard">
    <div class="dashboard-header">
      <div>
        <h1><i class="fas fa-chart-pie"></i> Tableau de bord - Chef de Département</h1>
        <p>Vue d'ensemble de votre activité et de vos ressources</p>
      </div>
      <div class="user-info">
        <div class="user-avatar">{{ userInitials }}</div>
        <div>{{ user.prenom }} {{ user.nom }}</div>
      </div>
    </div>
    <button @click="goToNouvelleDemande" class="new-request-btn">
        <i class="bi bi-plus-circle"></i> Demande Véhicule
      </button>

    <aside class="menu">
      <router-link to="/chefDepartement/signalements" class="signalement-link">
        Avoir signalements <span class="arrow">➤</span>
      </router-link>
    </aside>

    <!-- Cartes de résumé -->
    <section class="summary">
      <!-- Carte Utilisateurs -->
      <div class="card">
        <div class="card-header">
          <h3>UTILISATEURS</h3>
          <div class="card-icon"><i class="fas fa-users"></i></div>
        </div>
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-label"><div class="stat-icon"><i class="fas fa-list"></i></div><span>Total</span></div>
            <div class="stat-value">{{ users.length }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><div class="stat-icon"><i class="fas fa-user-shield"></i></div><span>Administrateurs</span></div>
            <div class="stat-value">{{ admins.length }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><div class="stat-icon"><i class="fas fa-user-tie"></i></div><span>Responsables Parc</span></div>
            <div class="stat-value">{{ responsables.length }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><div class="stat-icon"><i class="fas fa-user-graduate"></i></div><span>Chefs Département</span></div>
            <div class="stat-value">{{ chefs.length }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><div class="stat-icon"><i class="fas fa-user"></i></div><span>Chauffeurs</span></div>
            <div class="stat-value">{{ chauffeurs.length }}</div>
          </div>
        </div>
      </div>

      <!-- Carte Véhicules -->
      <div class="card">
        <div class="card-header">
          <h3>VÉHICULES</h3>
          <div class="card-icon"><i class="fas fa-car"></i></div>
        </div>
        <div class="stats-container">
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-list"></i></div><span>Total</span></div><div class="stat-value">{{ vehicles.length }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><span>Disponible</span></div><div class="stat-value">{{ countVehicleStatus("DISPO") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-route"></i></div><span>En mission</span></div><div class="stat-value">{{ countVehicleStatus("EN_MISSION") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-times-circle"></i></div><span>Hors Service</span></div><div class="stat-value">{{ countVehicleStatus("HORS_SERVICE") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-tools"></i></div><span>En Maintenance</span></div><div class="stat-value">{{ countVehicleStatus("MAINTENANCE") }}</div></div>
        </div>
      </div>

      <!-- Carte Chauffeurs -->
      <div class="card">
        <div class="card-header">
          <h3>CHAUFFEURS</h3>
          <div class="card-icon"><i class="fas fa-id-card-alt"></i></div>
        </div>
        <div class="stats-container">
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-list"></i></div><span>Total</span></div><div class="stat-value">{{ chauffeurs.length }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><span>Actifs</span></div><div class="stat-value">{{ countChauffeurStatus("dispo") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-route"></i></div><span>En mission</span></div><div class="stat-value">{{ countChauffeurStatus("en mission") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-times-circle"></i></div><span>Hors Service</span></div><div class="stat-value">{{ countChauffeurStatus("hors service") }}</div></div>
        </div>
      </div>

      <!-- Carte Missions -->
      <div class="card">
        <div class="card-header">
          <h3>MISSIONS</h3>
          <div class="card-icon"><i class="fas fa-tasks"></i></div>
        </div>
        <div class="stats-container">
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-list"></i></div><span>Total</span></div><div class="stat-value">{{ missions.length }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-spinner"></i></div><span>En cours</span></div><div class="stat-value">{{ countMissionStatus("en cours") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-clock"></i></div><span>En attente</span></div><div class="stat-value">{{ countMissionStatus("en attente") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-ban"></i></div><span>Bloquées</span></div><div class="stat-value">{{ countMissionStatus("bloquer") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-times"></i></div><span>Annulées</span></div><div class="stat-value">{{ countMissionStatus("annuler") }}</div></div>
        </div>
      </div>

      <!-- Carte Demandes avec sélection année -->
      <div class="card">
        <div class="card-header">
          <h3>DEMANDES ({{ anneeSelectionnee }})</h3>
          <div class="card-icon"><i class="fas fa-clipboard-list"></i></div>
        </div>
        <div class="card-body">
          <label for="annee">Choisir année :</label>
          <select v-model="anneeSelectionnee" id="annee" style="margin-bottom:10px;">
            <option v-for="an in anneesDisponibles" :key="an" :value="an">{{ an }}</option>
          </select>
        </div>
        <div class="stats-container">
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-list"></i></div><span>Total</span></div><div class="stat-value">{{ demandesFiltrees.length }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-spinner"></i></div><span>En cours</span></div><div class="stat-value">{{ countDemandeStatus("EN COURS") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-calendar-check"></i></div><span>Planifiées</span></div><div class="stat-value">{{ countDemandeStatus("PLANIFIER") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><span>Terminées</span></div><div class="stat-value">{{ countDemandeStatus("TERMINER") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-times-circle"></i></div><span>Rejetées</span></div><div class="stat-value">{{ countDemandeStatus("REJETER") }}</div></div>
          <div class="stat-item"><div class="stat-label"><div class="stat-icon"><i class="fas fa-times"></i></div><span>Annulées</span></div><div class="stat-value">{{ countDemandeStatus("ANNULER") }}</div></div>
        </div>
      </div>

    </section>

    <!-- Graphique coût par véhicule -->
    <section class="charts" style="margin-top: 30px;">
      <VehicleCostChart v-if="vehicleCostData.length" :data="vehicleCostData" />
      <p v-else>Aucune donnée de coût disponible</p>
    </section>
  </div>
</template>


<script>
import axios from "axios";
import VehicleCostChart from "./VehicleCostChart.vue";

export default {
  name: "ChefDashboard",
  components: { VehicleCostChart },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user") || "{}"),

      users: [],
      admins: [],
      responsables: [],
      chefs: [],
      chauffeurs: [],

      vehicles: [],
      missions: [],
      demandes: [],
      vehicleCostData: [],

      // Année sélectionnée pour filtrer les demandes
      anneeSelectionnee: 2025,
    };
  },
  computed: {
    userInitials() {
      if (this.user.prenom && this.user.nom) {
        return this.user.prenom.charAt(0) + this.user.nom.charAt(0);
      }
      return "US";
    },

   


    // Liste des années disponibles dans les demandes
    anneesDisponibles() {
      const annees = this.demandes.map(d => new Date(d.date_heure_debut).getFullYear());
      return [...new Set(annees)].sort();
    },

    // Demandes filtrées selon l'année sélectionnée
    demandesFiltrees() {
      return this.demandes.filter(d => new Date(d.date_heure_debut).getFullYear() === this.anneeSelectionnee);
    },
  },
  async created() {
    await this.fetchData();
    await this.fetchVehicleCost();
  },
  methods: {
    async fetchVehicleCost() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/interventions/cout-par-vehicule", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.vehicleCostData = res.data;
      } catch (error) {
        console.error("❌ Erreur fetchVehicleCost :", error);
      }
    },

     goToNouvelleDemande() {
      this.$router.push("/chefDepartement/nouvelle-demande");
    },

    async fetchData() {
      try {
        const token = localStorage.getItem("token");

        const [adminsRes, responsablesRes, chefsRes, chauffeursRes] = await Promise.all([
          axios.get("http://localhost:3000/api/utilisateurs/role/admin", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/utilisateurs/role/responsable_parc", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/utilisateurs/role/chef_departement", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/chauffeurs", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        this.admins = adminsRes.data;
        this.responsables = responsablesRes.data;
        this.chefs = chefsRes.data;
        this.chauffeurs = chauffeursRes.data;
        this.users = [...this.admins, ...this.responsables, ...this.chefs, ...this.chauffeurs];

        const vehiclesRes = await axios.get("http://localhost:3000/api/vehicules", { headers: { Authorization: `Bearer ${token}` } });
        this.vehicles = vehiclesRes.data;

        const missionsRes = await axios.get("http://localhost:3000/api/missions", { headers: { Authorization: `Bearer ${token}` } });
        this.missions = missionsRes.data;

        const demandesRes = await axios.get("http://localhost:3000/api/demandes", { headers: { Authorization: `Bearer ${token}` } });
        this.demandes = demandesRes.data;
      } catch (error) {
        console.error("❌ Erreur récupération données :", error);
      }
    },

    // Comptages pour véhicules, chauffeurs, missions et demandes
    countVehicleStatus(etat) {
      return this.vehicles.filter(v => v.etat.toUpperCase() === etat.toUpperCase()).length;
    },
    countChauffeurStatus(etat) {
      return this.chauffeurs.filter(c => c.etat.toLowerCase() === etat.toLowerCase()).length;
    },
    countMissionStatus(stat) {
      return this.missions.filter(m => m.etat.toLowerCase() === stat.toLowerCase()).length;
    },
    countDemandeStatus(stat) {
      // On compte uniquement sur les demandes filtrées par année
      return this.demandesFiltrees.filter(d => d.etat.toUpperCase() === stat.toUpperCase()).length;
    },
  },
};
</script>

<style>
   :root {
  --sonatrack-primary: #FF7B00;
  --sonatrack-dark: #2C2C2C;
  --sonatrack-gray-light: #E0E0E0;
  --sonatrack-white: #FFFFFF;
}

.chef-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
}

.dashboard-header {
  background: linear-gradient(135deg, var(--sonatrack-primary), #E06D00);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 10px;
  border-radius: 50px;
}
.arrow-link {
  margin-left: 15px;
  font-size: 22px;
  color: #007bff;
  cursor: pointer;
}
.arrow-link:hover {
  color: #0056b3;
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

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--sonatrack-primary);
  font-weight: bold;
}
/* Flèche */
.arrow-link {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: bold;
  text-decoration: none;
  color: #007bff;
  margin: 10px 0 30px;
  transition: transform 0.2s ease;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}

.card {
  background-color: var(--sonatrack-white);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border-top: 4px solid var(--sonatrack-primary);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--sonatrack-gray-light);
  padding: 6px 0;
}

.stat-item:last-child {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .summary {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
/* pas de "scoped" */
.menu {
  display: flex;
  justify-content: flex-end; /* place le contenu à droite */
  padding: 10px;
}

.signalement-link {
  color: #0c0c0cff;          /* orange */
  font-weight: bold;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  background: #a5a3a0ff;     /* fond clair */
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.signalement-link:hover {
  background: #ffe600ff;
  color: white;
}

.arrow {
  font-size: 1.2em;
}


    </style>