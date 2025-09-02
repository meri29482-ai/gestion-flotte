<template>
  <div class="dashboard-demandeur">
    <div class="header-bar">
      <h1>📊 Tableau de bord - Admin</h1>
      <button @click="goToNouvelleDemande" class="new-request-btn">
        <i class="bi bi-plus-circle"></i> Demande Véhicule
      </button>
    </div>


    <div class="summary">
      <div class="card"><h3>Total utilisateurs</h3><p>{{ total }}</p></div>
      <div class="card orange"><h3>Admins</h3><p>{{ admins }}</p></div>
      <div class="card green"><h3>Chauffeurs</h3><p>{{ chauffeurs }}</p></div>
      <div class="card"><h3>Demandeurs</h3><p>{{ demandeurs }}</p></div>
      <div class="card orange"><h3>Resp. Parc</h3><p>{{ responsablesParc }}</p></div>
      <div class="card green"><h3>Resp. HSE</h3><p>{{ responsablesHSE }}</p></div>
      <div class="card"><h3>Chefs Départ.</h3><p>{{ chefsDepartement }}</p></div>
    </div>

    <h2>📋 Derniers utilisateurs</h2>
    <table class="demandes-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>État</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in utilisateurs.slice(0, 5)" :key="user.id">
          <td>{{ user.nom }}</td>
          <td>{{ user.prenom }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <span :class="'badge ' + user.etat.toLowerCase()">
              {{ user.etat }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminDashboard",
  data() {
    return {
      utilisateurs: [],
      total: 0,
      admins: 0,
      chauffeurs: 0,
      demandeurs: 0,
      responsablesParc: 0,
      responsablesHSE: 0,
      chefsDepartement: 0,
    };
  },
  methods: {
  goToNouvelleDemande() {
    this.$router.push("/admin/nouvelle-demande"); // ✅ c’est correct ici
  }
},
  async mounted() {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:3000/api/utilisateurs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.utilisateurs = res.data;
      this.total = res.data.length;

      this.admins = res.data.filter(u => u.role === "ADMIN").length;
      this.chauffeurs = res.data.filter(u => u.role === "CHAUFFEUR").length;
      this.demandeurs = res.data.filter(u => u.role === "DEMANDEUR").length;
      this.responsablesParc = res.data.filter(u => u.role === "RESPONSABLE_PARC").length;
      this.responsablesHSE = res.data.filter(u => u.role === "RESPONSABLE_HSE").length;
      this.chefsDepartement = res.data.filter(u => u.role === "CHEF_DEPARTEMENT").length;

    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');

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
.badge.actif {
  background-color: #4caf50;
}
.badge.inactif {
  background-color: #f44336;
}
</style>
