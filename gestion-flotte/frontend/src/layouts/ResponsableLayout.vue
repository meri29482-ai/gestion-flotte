<template>
  <div id="responsable-layout" class="d-flex flex-column vh-100">
    <!-- Header -->
    <header class="header d-flex align-items-center justify-content-between px-4 shadow-sm">
      <div class="logo d-flex align-items-center">
        <img src="@/assets/logo.png" alt="Logo Sonatrach" class="logo-img" />
        <h1 class="ms-2 text-sonatrach">Gestion Parc - Responsable</h1>
      </div>

      <!-- Profil, notifications et logout -->
      <nav class="d-flex align-items-center gap-4 position-relative">
        <!-- Profil -->
        <div
          class="profil d-flex align-items-center me-2"
          style="cursor: pointer"
          @click="$router.push('/responsable/profil')"
        >
          <img :src="photoUrl" alt="Profil" class="photo-profil rounded-circle me-2" />
          <span class="fw-semibold d-none d-md-inline">{{ user.prenom }} {{ user.nom }}</span>
        </div>

        <!-- Notifications -->
        <div class="notification position-relative" @click="toggleNotifications">
          <i class="bi bi-bell-fill fs-5 text-dark" style="cursor: pointer;"></i>
          <span
            v-if="unreadCount > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            {{ unreadCount }}
          </span>

          <!-- Dropdown Notifications -->
          <div v-if="showNotifications" class="notification-dropdown shadow">
            <div class="fw-bold px-3 pt-2 pb-1 text-dark border-bottom d-flex justify-content-between">
              🔔 Notifications
              <span
                v-if="unreadCount > 0"
                class="small text-primary"
                style="cursor:pointer"
                @click.stop="markAllAsRead"
              >
                Tout marquer comme lu
              </span>
            </div>

            <div v-if="notifications.length === 0" class="text-muted px-3 py-3 text-center small">
              Aucune notification
            </div>

            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="notif-item d-flex gap-2 align-items-start px-3 py-2 border-bottom hover-bg"
              @click="handleNotifClick(notif)"
              :class="{ 'bg-light': !notif.lu }"
            >
              <i class="bi bi-envelope-fill text-primary mt-1"></i>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-semibold small text-dark">{{ notif.titre || 'Notification' }}</span>
                  <span v-if="!notif.lu" class="badge bg-danger text-white ms-2">Nouveau</span>
                </div>
                <div class="small text-muted">{{ notif.message }}</div>
                <div class="text-muted small mt-1">{{ formatDate(notif.date_envoi) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Déconnexion -->
        <button @click="logout" class="btn btn-outline-danger btn-sm logout-btn">Déconnexion</button>
      </nav>
    </header>

    <!-- Corps -->
    <div class="flex-grow-1 d-flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="sidebar bg-light border-end">
        <ul class="nav flex-column py-3">
          <li class="nav-item">
            <router-link to="/responsable/Dashboard" class="nav-link" exact-active-class="active">
              <i class="bi bi-speedometer2 me-2"></i> Tableau de bord
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/RapportHSE" class="nav-link" exact-active-class="active">
              <i class="bi bi-file-earmark-text me-2"></i> Rapports HSE
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/vehicules" class="nav-link" exact-active-class="active">
              <i class="bi bi-truck me-2"></i> Véhicules
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/chauffeurs" class="nav-link" exact-active-class="active">
              <i class="bi bi-person-badge me-2"></i> Chauffeurs
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/DemandeMission" class="nav-link" exact-active-class="active">
              <i class="bi bi-file-earmark-text me-2"></i> Demande Missions
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/missions" class="nav-link" exact-active-class="active">
              <i class="bi bi-flag me-2"></i> Missions
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/maintenance" class="nav-link" exact-active-class="active">
              <i class="bi bi-wrench-adjustable-circle me-2"></i> Maintenance
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/checklists" class="nav-link" exact-active-class="active">
              <i class="bi bi-list-check me-2"></i> Checklists
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/incidents" class="nav-link" exact-active-class="active">
              <i class="bi bi-bug-fill me-2"></i> Incidents
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/alertes" class="nav-link text-danger" exact-active-class="active">
              <i class="bi bi-exclamation-triangle me-2"></i> Alertes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsable/profil" class="nav-link" exact-active-class="active">
              <i class="bi bi-person-circle me-2"></i> Mon Profil
            </router-link>
          </li>
        </ul>
      </aside>

      <!-- Contenu principal -->
      <main class="content p-4 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ResponsableLayout",
  data() {
    return {
      user: {},
      photoUrl: "",
      notifications: [],
      showNotifications: false,
      unreadCount: 0,
    };
  },
  created() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.photoUrl = this.user.photo
        ? `http://localhost:3000/uploads/${this.user.photo}`
        : "https://via.placeholder.com/35x35?text=👤";
      this.fetchNotifications();
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        this.fetchNotifications();
      }
    },
    async fetchNotifications() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/api/notifications/${this.user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.notifications = res.data;
        this.unreadCount = this.notifications.filter((n) => !n.lu).length;
      } catch (error) {
        console.error("❌ Erreur notifications :", error);
      }
    },
    async markAllAsRead() {
      try {
        await axios.put(
          `http://localhost:3000/api/notifications/${this.user.id}/lu`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.notifications.forEach((n) => (n.lu = true));
        this.unreadCount = 0;
      } catch (error) {
        console.error("❌ Erreur marquage notifications :", error);
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR");
    },
    handleNotifClick(notif) {
      // Exemple de redirection selon contenu
      if (notif.titre && notif.titre.toLowerCase().includes("accepter")) {
        this.$router.push("/responsable/profil");
      } else {
        console.log("Notification cliquée :", notif);
      }
    },
  },
};
</script>

<style scoped>
/* Layout global */ #responsable-layout { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background: #f9f9f9; color: #333; height: 100vh; display: flex; flex-direction: column; } .header { height: 60px; background: white; border-bottom: 1px solid #ddd; box-shadow: 0 2px 4px rgb(0 0 0 / 0.05); padding: 0 1rem; z-index: 100; flex-shrink: 0; } .logo-img { height: 40px; width: auto; user-select: none; } .text-sonatrach { color: #f7941e; font-weight: 700; font-size: 1.25rem; user-select: none; } .sidebar { width: 220px; display: flex; flex-direction: column; border-right: 1px solid #ddd; background-color: #fafafa; transition: background-color 0.3s ease; overflow-y: auto; /* ✅ Active le scroll */ max-height: 100vh; } .photo-profil { width: 35px; height: 35px; object-fit: cover; } .logout-btn { cursor: pointer; font-weight: 600; } .nav-link.active { background-color: #f7941e; color: white; border-left: 4px solid #d37304; } .nav-link { color: #555; padding: 12px 20px; font-weight: 600; display: flex; align-items: center; transition: background-color 0.25s ease, color 0.25s ease; border-left: 4px solid transparent; cursor: pointer; user-select: none; } .nav-link i { font-size: 1.3rem; min-width: 1.5rem; text-align: center; } .nav-link:hover, .nav-link:focus-visible { background-color: #fff3e0; color: #f7941e; outline: none; border-left-color: #f7941e; } .nav-link.active { background-color: #f7941e; color: white; border-left-color: #d37304; } .content { flex-grow: 1; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgb(0 0 0 / 0.1); } /* Scrollbar personnalisée pour le contenu */ .content::-webkit-scrollbar { width: 8px; } .content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 8px; } .content::-webkit-scrollbar-thumb { background: #f7941e; border-radius: 8px; } .content::-webkit-scrollbar-thumb:hover { background: #d37304; } /* Bouton déconnexion */ .logout-btn { cursor: pointer; font-weight: 600; transition: background-color 0.3s ease, color 0.3s ease; } .logout-btn:hover, .logout-btn:focus-visible { background-color: #d9534f; color: white; outline: none; } /* Responsive Sidebar (réduit la largeur sur petits écrans) */ @media (max-width: 768px) { .sidebar { width: 60px; } .nav-link { padding: 12px 10px; justify-content: center; font-size: 0; } .nav-link i { font-size: 1.5rem; min-width: auto; } .nav-link.active { border-left-color: transparent; background-color: #f7941e; color: white; } .nav-link:hover, .nav-link:focus-visible { background-color: #fff3e0; color: #f7941e; } .text-sonatrach, .logo img { display: none; } } /* Icons bootstrap */ i { font-size: 1.2rem; }
/* Dropdown notifications */
.notification-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  z-index: 9999;
}

.notif-item {
  cursor: pointer;
  transition: background 0.2s;
}
.notif-item:hover {
  background: #f9f9f9;
}
</style>
