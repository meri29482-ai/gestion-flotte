<template>
  <div id="admin-layout" class="d-flex flex-column vh-100">
    <!-- Header -->
    <header class="header d-flex align-items-center justify-content-between px-4 shadow-sm">
      <div class="logo d-flex align-items-center">
        <img src="@/assets/logo.png" alt="Logo Sonatrach" class="logo-img" />
        <h1 class="ms-2 text-sonatrach">Gestion Parc - Admin</h1>
      </div>
      <nav class="d-flex align-items-center">
        <!-- 🔔 Notifications -->
        <div class="notification-wrapper position-relative me-3" @click="ouvrirNotifications">
          <i class="bi bi-bell notification-icon" aria-label="Notifications"></i>
          <span v-if="nbNonLues > 0" class="notification-badge">{{ nbNonLues }}</span>

          <!-- Liste déroulante des notifications -->
          <div v-if="afficherListe" class="notifications-dropdown shadow">
            <div v-if="notifications.length === 0" class="text-muted text-center py-2">Aucune notification</div>
            <div v-for="notif in notifications.slice(0, 5)" :key="notif.id" class="notification-item">
              <strong>{{ notif.titre }}</strong>
              <p class="mb-0 small">{{ notif.message }}</p>
              <span class="small text-muted">{{ formatDate(notif.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 🔓 Déconnexion -->
        <button @click="logout" class="btn btn-outline-danger btn-sm logout-btn" aria-label="Déconnexion">
          Déconnexion
        </button>
      </nav>
    </header>

    <!-- Layout principal -->
    <div class="flex-grow-1 d-flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="sidebar bg-light border-end">
        <ul class="nav flex-column py-3">
          <li class="nav-item">
            <router-link to="/admin/dashboard" class="nav-link" exact-active-class="active">
              <i class="bi bi-speedometer2 me-2"></i> Tableau de bord
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/utilisateurs" class="nav-link" exact-active-class="active">
              <i class="bi bi-people me-2"></i> Utilisateurs
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/roles-permissions" class="nav-link" exact-active-class="active">
              <i class="bi bi-shield-lock me-2"></i> Rôles & Permissions
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/notifications" class="nav-link" exact-active-class="active">
              <i class="bi bi-bell me-2"></i> Notifications
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/profil" class="nav-link" exact-active-class="active">
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
  name: "AdminLayout",
  data() {
    return {
      notifications: [],
      afficherListe: false,
      nbNonLues: 0,
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    async chargerNotifications() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!user || !token) return;

        const res =await axios.get(`http://localhost:3000/api/notifications/${user.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});


        this.notifications = res.data;
        this.nbNonLues = this.notifications.filter((n) => !n.lu).length;
      } catch (error) {
        console.error("❌ Erreur chargement notifications :", error);
      }
    },
    ouvrirNotifications() {
      this.afficherListe = !this.afficherListe;
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR");
    },
  },
  mounted() {
    this.chargerNotifications();
    setInterval(this.chargerNotifications, 15000); // Actualiser toutes les 15 sec
  },
};
</script>

<style scoped>
/* Général */
#admin-layout {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  color: #333;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
}
.logo-img {
  height: 40px;
}
.text-sonatrach {
  color: #f7941e;
  font-weight: 700;
}

/* Sidebar */
.sidebar {
  width: 220px;
}
.nav-link {
  color: #555;
  padding: 12px 20px;
  display: flex;
  align-items: center;
}
.nav-link.active {
  background-color: #f7941e;
  color: white;
  border-left: 4px solid #d37304;
}

/* Contenu */
.content {
  flex-grow: 1;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 🔔 Notification */
.notification-wrapper {
  position: relative;
  font-size: 1.5rem;
  cursor: pointer;
}
.notification-icon:hover {
  color: #f7941e;
}
.notification-badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 50%;
  font-weight: bold;
}
.notifications-dropdown {
  position: absolute;
  top: 35px;
  right: 0;
  width: 280px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 2000;
  max-height: 300px;
  overflow-y: auto;
}
.notification-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}
.notification-item:last-child {
  border-bottom: none;
}
.notification-item:hover {
  background-color: #f5f5f5;
}

/* Déconnexion */
.logout-btn {
  font-weight: 600;
}
.logout-btn:hover {
  background-color: #d9534f;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  .nav-link {
    justify-content: center;
    font-size: 0;
  }
  .nav-link i {
    font-size: 1.5rem;
  }
}
</style>
