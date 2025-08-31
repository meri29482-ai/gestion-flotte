<template>
  <div class="roles-management-container">
    <!-- En-tête avec titre et indicateur -->
    <div class="management-header">
      <div class="header-content">
        <i class="bi bi-shield-lock"></i>
        <h1>Gestion des rôles & permissions</h1>
      </div>
      <div class="users-count">
        <span class="badge bg-primary">{{ utilisateursFiltres.length }}</span>
        <span>Utilisateurs</span>
      </div>
    </div>

    <!-- Contrôles de filtrage -->
    <div class="controls-section">
      <div class="search-filter">
        <i class="bi bi-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="form-control"
        />
      </div>
      
      <div class="role-filter">
        <label class="filter-label">
          <i class="bi bi-funnel"></i>
          Filtrer par rôle :
        </label>
        <select 
          v-model="roleSelectionne" 
          class="form-select"
          @change="filtrerUtilisateurs"
        >
          <option value="">Tous les rôles</option>
          <option 
            v-for="role in rolesDisponibles" 
            :key="role" 
            :value="role"
          >
            {{ formatRole(role) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Liste des utilisateurs -->
    <div v-if="utilisateursFiltres.length > 0" class="users-grid">
      <div 
        v-for="user in utilisateursFiltres" 
        :key="user.id" 
        class="user-card"
        :class="{'admin-card': user.role === 'ADMIN'}"
      >
        <div class="user-avatar">
          <img
            v-if="user.photo"
            :src="`http://localhost:3000/uploads/${user.photo}`"
            alt="Photo de profil"
            class="profile-image"
          />
          <div v-else class="avatar-placeholder">
            {{ getInitials(user.nom, user.prenom) }}
          </div>
          <span class="user-status" :class="user.action === 'ecriture' ? 'active' : 'inactive'"></span>
        </div>

        <div class="user-info">
          <h3>{{ user.prenom }} {{ user.nom }}</h3>
          <p class="user-email">
            <i class="bi bi-envelope"></i>
            {{ user.email }}
          </p>
          <div class="user-role">
            <span class="role-badge" :class="`role-${user.role.toLowerCase()}`">
              {{ formatRole(user.role) }}
            </span>
          </div>
        </div>

        <div class="permission-control">
          <label class="permission-label">
            <i class="bi bi-key"></i>
            Niveau d'accès :
          </label>
          <select 
            v-model="user.action" 
            class="form-select permission-select"
            @change="changerActionUtilisateur(user)"
          >
            <option value="lecture">Lecture seule</option>
            <option value="ecriture">Accès complet</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Message si aucun résultat -->
    <div v-else class="no-results">
      <i class="bi bi-people"></i>
      <p>Aucun utilisateur trouvé</p>
      <button 
        class="btn btn-outline-primary" 
        @click="resetFilters"
        v-if="roleSelectionne || searchQuery"
      >
        Réinitialiser les filtres
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { toast } from 'vue3-toastify';

export default {
  name: "RolesPermissions",
  data() {
    return {
      utilisateurs: [],
      utilisateursFiltres: [],
      rolesDisponibles: [],
      roleSelectionne: "",
      searchQuery: ""
    };
  },
  methods: {
    async chargerTousLesUtilisateurs() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:3000/api/utilisateurs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.utilisateurs = res.data.map(u => ({
          ...u,
          action: u.action || "lecture",
        }));

        this.utilisateursFiltres = this.utilisateurs;
        this.rolesDisponibles = [...new Set(this.utilisateurs.map(u => u.role))];
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
        toast.error("Erreur lors du chargement des utilisateurs");
      }
    },

    filtrerUtilisateurs() {
      let filtered = this.utilisateurs;
      
      // Filtre par rôle
      if (this.roleSelectionne) {
        filtered = filtered.filter(u => u.role === this.roleSelectionne);
      }
      
      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(u => 
          u.nom.toLowerCase().includes(query) || 
          u.prenom.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      }
      
      this.utilisateursFiltres = filtered;
    },

    resetFilters() {
      this.roleSelectionne = "";
      this.searchQuery = "";
      this.utilisateursFiltres = this.utilisateurs;
    },

    async changerActionUtilisateur(user) {
      const token = localStorage.getItem("token");
      try {
        await axios.patch(
          `http://localhost:3000/api/utilisateurs/${user.id}/action`,
          { action: user.action },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success(`Permissions de ${user.prenom} mises à jour`);
      } catch (err) {
        console.error("Erreur mise à jour action :", err);
        toast.error("Erreur lors de la mise à jour des permissions");
      }
    },

    formatRole(role) {
      const rolesMap = {
        ADMIN: "Administrateur",
        RESPONSABLE_PARC: "Responsable Parc",
        CHAUFFEUR: "Chauffeur",
        DEMANDEUR: "Demandeur",
        RESPONSABLE_HSE: "Responsable HSE",
        MANAGER : "Chef departement"
      };
      return rolesMap[role] || role;
    },
    
    getInitials(nom, prenom) {
      return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
    }
  },
  watch: {
    searchQuery() {
      this.filtrerUtilisateurs();
    }
  },
  mounted() {
    this.chargerTousLesUtilisateurs();
  }
};
</script>

<style scoped>
/* Variables de couleur */
:root {
  --primary-color: #3498db;
  --primary-light: #5dade2;
  --secondary-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --dark-color: #2c3e50;
  --light-color: #ecf0f1;
  --gray-color: #95a5a6;
  --sonatrach-orange: #f4a300;
  --border-radius: 10px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Structure principale */
.roles-management-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* En-tête */
.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content i {
  font-size: 2rem;
  color: var(--sonatrach-orange);
}

.header-content h1 {
  margin: 0;
  color: var(--dark-color);
  font-weight: 600;
}

.users-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.users-count .badge {
  font-size: 0.9rem;
}

/* Contrôles de filtrage */
.controls-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-filter {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-filter i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-color);
}

.search-filter input {
  padding-left: 2.5rem;
  border-radius: var(--border-radius);
}

.role-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  white-space: nowrap;
}

.filter-label i {
  color: var(--sonatrach-orange);
}

/* Grille des utilisateurs */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  border-top: 4px solid var(--primary-color);
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.admin-card {
  border-top-color: var(--sonatrach-orange);
}

/* Avatar utilisateur */
.user-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--light-color);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 3px solid var(--light-color);
}

.user-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid white;
}

.user-status.active {
  background-color: var(--secondary-color);
}

.user-status.inactive {
  background-color: var(--gray-color);
}

/* Infos utilisateur */
.user-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.user-info h3 {
  margin: 0.5rem 0;
  color: var(--dark-color);
  font-size: 1.2rem;
}

.user-email {
  color: var(--gray-color);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.user-role {
  margin-top: 0.5rem;
}


.role-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-admin {
  background-color: #8e44ad;
  color: white;
}

.role-chauffeur {
  background-color: #16a085;
  color: white;
}

.role-demandeur {
  background-color: #00d35f;
  color: white;
}
.role-responsable_parc {
  background-color: #d30069;
  color: white;
}
.role-responsable_hse {
  background-color: #d3c500;
  color: white;
}
.role-manager {
  background-color: #d35400;
  color: white;
}

/* Contrôle des permissions */
.permission-control {
  margin-top: 1rem;
}

.permission-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.permission-label i {
  color: var(--sonatrach-orange);
}

.permission-select {
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

/* Aucun résultat */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  color: var(--gray-color);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--sonatrach-orange);
}

.no-results p {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
  }
  
  .search-filter, .role-filter {
    width: 100%;
  }
  
  .role-filter {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>