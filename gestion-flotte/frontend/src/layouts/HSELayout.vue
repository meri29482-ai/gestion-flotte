<template>
  <div id="hse-layout" class="d-flex flex-column vh-100">
    <!-- Header -->
    <header class="header d-flex align-items-center justify-content-between px-4 shadow-sm">
      <div class="logo d-flex align-items-center">
        <img src="@/assets/logo.png" alt="Logo Sonatrach" class="logo-img" />
        <h1 class="ms-2 text-sonatrach">Gestion Parc - Responsable HSE</h1>
      </div>

      <!-- Profil + Notifications + Logout -->
      <nav class="d-flex align-items-center gap-4 position-relative">
        <!-- Profil -->
        <div class="profil d-flex align-items-center me-2">
          <img :src="photoUrl" alt="Profil" class="photo-profil rounded-circle me-2" />
          <span class="fw-semibold d-none d-md-inline">{{ user.prenom }} {{ user.nom }}</span>
        </div>

        <!-- Notifications -->
        <div class="notification position-relative" @click="toggleNotifications">
          <i class="bi bi-bell-fill fs-5 text-dark" style="cursor: pointer;"></i>
          <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {{ unreadCount }}
          </span>

          <!-- Dropdown Notifications -->
          <div v-if="showNotifications" class="notification-dropdown shadow">
            <div class="fw-bold px-3 pt-2 pb-1 text-dark border-bottom">🔔 Notifications</div>

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
        <button @click="logout" class="btn btn-outline-danger btn-sm logout-btn" aria-label="Déconnexion">
          Déconnexion
        </button>
      </nav>
    </header>

    <!-- Corps -->
    <div class="flex-grow-1 d-flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="sidebar bg-light border-end">
        <ul class="nav flex-column py-3">
          <li class="nav-item">
            <router-link to="/responsableHSE/dashboard" class="nav-link" exact-active-class="active">
              <i class="bi bi-speedometer2 me-2"></i> Tableau de bord
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsableHSE/rapport" class="nav-link" exact-active-class="active">
              <i class="bi bi-file-earmark-text me-2"></i> Rapports HSE
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsableHSE/suivi-missions" class="nav-link" exact-active-class="active">
              <i class="bi bi-clipboard-check me-2"></i> Suivi des missions
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsableHSE/incidents" class="nav-link" exact-active-class="active">
              <i class="bi bi-exclamation-triangle me-2"></i> Incidents
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsableHSE/checklists" class="nav-link" exact-active-class="active">
              <i class="bi bi-journal-check me-2"></i> Checklists Sécurité
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/responsableHSE/notifications" class="nav-link" exact-active-class="active">
              <i class="bi bi-bell me-2"></i> Notifications
            </router-link>
          </li>
          <li class="nav-item mt-auto">
            <router-link to="/responsableHSE/profil" class="nav-link" exact-active-class="active">
              <i class="bi bi-person me-2"></i> Mon Profil
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
export default {
  name: "HSELayout",
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
    const token = localStorage.getItem("token");

    if (userStr && token) {
      this.user = JSON.parse(userStr);
      this.photoUrl = this.user.photo
        ? `http://localhost:3000/uploads/${this.user.photo}`
        : "https://via.placeholder.com/35x35?text=👤";

      this.fetchNotifications();
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    },
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    handleNotifClick(notif) {
      const token = localStorage.getItem("token");

      fetch(`http://localhost:3000/api/notifications/${notif.id}/lu`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(() => {
        notif.lu = true;
        this.unreadCount = this.notifications.filter((n) => !n.lu).length;

        if (notif.type === "RAPPORT") {
          this.$router.push(`/responsableHSE/rapport`);
        } else if (notif.type === "INCIDENT") {
          this.$router.push(`/responsableHSE/incidents`);
        }

        this.showNotifications = false;
      });
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        this.fetchNotifications();
      }
    },
    fetchNotifications() {
      const token = localStorage.getItem("token");
      if (!this.user.id || !token) return;

      fetch(`http://localhost:3000/api/notifications/${this.user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          this.notifications = data;
          this.unreadCount = data.filter((notif) => !notif.lu).length;
        })
        .catch((err) => {
          console.error("❌ Erreur récupération notifications :", err);
        });
    },
  },
};
</script>

<style scoped>
#hse-layout {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f9f9f9;
  color: #333;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== HEADER ===== */
.header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
  padding: 0 1rem;
  z-index: 100;
  flex-shrink: 0;
}

.logo-img {
  height: 40px;
  width: auto;
  user-select: none;
}

.text-sonatrach {
  color: #f7941e;
  font-weight: 700;
  font-size: 1.25rem;
  user-select: none;
}

.photo-profil {
  width: 35px;
  height: 35px;
  object-fit: cover;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 220px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ddd;
  background-color: #fafafa;
  transition: background-color 0.3s ease;
}

.nav-link {
  color: #555;
  padding: 12px 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  transition: background-color 0.25s ease, color 0.25s ease;
  border-left: 4px solid transparent;
  cursor: pointer;
  user-select: none;
}

.nav-link i {
  font-size: 1.3rem;
  min-width: 1.5rem;
  text-align: center;
}

.nav-link:hover,
.nav-link:focus-visible {
  background-color: #fff3e0;
  color: #f7941e;
  border-left-color: #f7941e;
}

.nav-link.active {
  background-color: #f7941e;
  color: white;
  border-left-color: #d37304;
}

/* ===== CONTENT ===== */
.content {
  flex-grow: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
  overflow-y: auto;
  padding: 1.5rem;
}

.content::-webkit-scrollbar {
  width: 8px;
}
.content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}
.content::-webkit-scrollbar-thumb {
  background: #f7941e;
  border-radius: 8px;
}
.content::-webkit-scrollbar-thumb:hover {
  background: #d37304;
}

/* ===== LOGOUT BUTTON ===== */
.logout-btn {
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.logout-btn:hover,
.logout-btn:focus-visible {
  background-color: #d9534f;
  color: white;
  outline: none;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  .nav-link {
    padding: 12px 10px;
    justify-content: center;
    font-size: 0;
  }
  .nav-link i {
    font-size: 1.5rem;
  }
  .text-sonatrach,
  .logo img {
    display: none;
  }
}

/* ===== NOTIFICATIONS ===== */
.notification-dropdown {
  position: absolute;
  top: 35px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 320px;
  max-height: 380px;
  overflow-y: auto;
  z-index: 999;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.notif-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.notif-item:hover,
.hover-bg:hover {
  background-color: #f7f7f7;
}
</style>
