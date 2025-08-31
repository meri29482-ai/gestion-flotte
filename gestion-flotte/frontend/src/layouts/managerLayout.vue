<template>
  <div id="demandeur-layout" class="d-flex flex-column vh-100">
    <!-- Header -->
    <header class="header d-flex align-items-center justify-content-between px-4 shadow-sm">
      <div class="logo d-flex align-items-center">
        <img src="@/assets/logo.png" alt="Logo Sonatrach" class="logo-img" />
        <h1 class="ms-2 text-sonatrach">Gestion Parc </h1>
      </div>

      <nav class="d-flex align-items-center gap-4 position-relative">
        <!-- Profil -->
        <div class="profil d-flex align-items-center me-2" style="cursor: pointer" @click="$router.push('/chefDepartement/profil')">
          <img :src="photoUrl" alt="Profil" class="photo-profil rounded-circle me-2" />
          <span class="fw-semibold d-none d-md-inline">{{ user.prenom }} {{ user.nom }}</span>
        </div>

        <!-- Notifications -->
        <div class="notification position-relative" @click="toggleNotifications">
          <i class="bi bi-bell-fill fs-5 text-dark" style="cursor: pointer;"></i>
          <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {{ unreadCount }}
          </span>
          <div v-if="showNotifications" class="notification-dropdown shadow-sm">
            <div v-if="notifications.length === 0" class="text-muted px-3 py-2">Aucune notification</div>
            <ul class="list-group list-group-flush">
              <li
                v-for="notif in notifications"
                :key="notif.id"
                class="list-group-item small"
                @click="handleNotificationClick(notif)"
                style="cursor: pointer;"
              >
                <strong>
                  <i v-if="notif.titre.toLowerCase().includes('accepter')" class="bi bi-check-circle-fill text-success me-1"></i>
                  {{ notif.titre }}
                </strong><br />
                {{ notif.message }}
                <br />
                <small class="text-muted">{{ formatDate(notif.date_envoi) }}</small>
              </li>
            </ul>
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
            <router-link to="/chefDepartement/dashboard" class="nav-link" exact-active-class="active">
              <i class="bi bi-speedometer2 me-2"></i> Tableau de bord
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/chefDepartement/profil" class="nav-link" exact-active-class="active">
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
  name: "DemandeurLayout",
  data() {
    return {
      user: {},
      photoUrl: '',
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
        : 'https://via.placeholder.com/35x35?text=👤';

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
      if (this.showNotifications && this.unreadCount > 0) {
        this.markAllAsRead();
      }
    },
    async fetchNotifications() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/api/notifications/${this.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.notifications = res.data;
        this.unreadCount = this.notifications.filter(n => !n.lu).length;
      } catch (error) {
        console.error("❌ Erreur notifications :", error);
      }
    },
    async markAllAsRead() {
      try {
        await axios.put(`http://localhost:3000/api/notifications/${this.user.id}/lu`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.notifications.forEach(n => n.lu = true);
        this.unreadCount = 0;
      } catch (error) {
        console.error("❌ Erreur marquage notifications :", error);
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR");
    },
    handleNotificationClick(notif) {
      const titre = notif.titre.toLowerCase();
      if (titre.includes("accepter")) {
        this.$router.push("/demandeur/profil");
      } else {
        console.log("Notification cliquée :", notif);
        // Autres actions possibles ici
      }
    }
  }
};
</script>


<style scoped>
#demandeur-layout {
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
  outline: none;
  border-left-color: #f7941e;
}

.nav-link.active {
  background-color: #f7941e;
  color: white;
  border-left-color: #d37304;
}

.content {
  flex-grow: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
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

.photo-profil {
  width: 35px;
  height: 35px;
  object-fit: cover;
}

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

/* Notifications Dropdown */
.notification-dropdown {
  position: absolute;
  right: 0;
  top: 110%;
  width: 260px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  z-index: 200;
  max-height: 200px;
  overflow-y: auto;
}

/* Responsive */
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
    min-width: auto;
  }
  .text-sonatrach,
  .logo img {
    display: none;
  }
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 110%;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  z-index: 200;
  max-height: 300px;
  overflow-y: auto;
}

</style>
