<template>
  <div class="notifications-wrapper">
    <div class="notifications-container">
      <!-- Header avec actions -->
      <div class="notifications-header">
        <div class="header-content">
          <div class="header-title">
            <div class="notification-icon-wrapper">
              <i class="bi bi-bell-fill"></i>
              <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
            </div>
            <h2>Notifications</h2>
          </div>
          
          <div class="header-controls">
            <button 
              class="btn-refresh"
              @click="fetchNotifications"
              title="Actualiser"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button 
              class="btn-mark-all"
              @click="markAllAsRead"
              :disabled="unreadCount === 0"
              title="Tout marquer comme lu"
            >
              <i class="bi bi-check-all"></i>
            </button>
            <div class="filter-dropdown">
              <button 
                class="btn-filter"
                @click="toggleFilterDropdown"
              >
                <i class="bi bi-funnel"></i>
                <span>Filtrer</span>
              </button>
              <div v-if="showFilterDropdown" class="dropdown-menu">
                <div class="dropdown-item" @click="filterByType('all')">
                  <i class="bi bi-list-ul"></i> Toutes
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" @click="filterByType('INFO')">
                  <i class="bi bi-info-circle"></i> Informations
                </div>
                <div class="dropdown-item" @click="filterByType('ALERTE')">
                  <i class="bi bi-exclamation-triangle"></i> Alertes
                </div>
                <div class="dropdown-item" @click="filterByType('MISSION')">
                  <i class="bi bi-briefcase"></i> Missions
                </div>
                <div class="dropdown-item" @click="filterByType('DOCUMENT')">
                  <i class="bi bi-file-earmark-text"></i> Documents
                </div>
                <div class="dropdown-item" @click="filterByType('HSE')">
                  <i class="bi bi-shield-check"></i> HSE
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="filter-tag" v-if="currentFilter !== 'all'">
          Filtre : {{ getFilterLabel(currentFilter) }}
          <i class="bi bi-x" @click="filterByType('all')"></i>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des notifications...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-bell-slash"></i>
        </div>
        <h3>Aucune notification</h3>
        <p v-if="currentFilter === 'all'">Vous n'avez aucune notification pour le moment</p>
        <p v-else>Aucune notification de ce type</p>
        <button class="btn-reload" @click="fetchNotifications">
          <i class="bi bi-arrow-repeat"></i> Recharger
        </button>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notif in filteredNotifications"
          :key="notif.id"
          class="notification-item"
          :class="{ 'unread': !notif.lu }"
          @click="selectNotification(notif)"
        >
          <div class="notification-badge" :class="badgeClass(notif.type)">
            <i :class="typeIcon(notif.type)"></i>
          </div>
          
          <div class="notification-details">
            <div class="notification-header">
              <h3 class="notification-title">{{ notif.titre }}</h3>
              <span class="notification-time">{{ formatTimeAgo(notif.date_envoi) }}</span>
            </div>
            <p class="notification-message">{{ notif.message }}</p>
          </div>
          
          <div v-if="!notif.lu" class="notification-status"></div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredNotifications.length > 0" class="notifications-footer">
        <button 
          class="btn-pagination"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="page-indicator">Page {{ currentPage }}</span>
        <button 
          class="btn-pagination"
          :disabled="filteredNotifications.length < perPage"
          @click="nextPage"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('fr');

export default {
  name: "NotificationsView",
  data() {
    return {
      notifications: [],
      selectedNotification: null,
      currentFilter: 'all',
      currentPage: 1,
      perPage: 10,
      isLoading: false,
      showFilterDropdown: false
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.lu).length;
    },
    filteredNotifications() {
      let filtered = this.notifications;
      
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter(n => n.type === this.currentFilter);
      }
      
      const start = (this.currentPage - 1) * this.perPage;
      return filtered.slice(start, start + this.perPage);
    }
  },
  methods: {
    async fetchNotifications() {
      this.isLoading = true;
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/notifications/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.notifications = data.sort((a, b) => new Date(b.date_envoi) - new Date(a.date_envoi));
      } catch (error) {
        console.error("Erreur de chargement des notifications:", error);
        this.$toast.error("Erreur lors du chargement des notifications");
      } finally {
        this.isLoading = false;
      }
    },

    async marquerCommeLu(notificationId) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:3000/api/notifications/lu/${notificationId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await this.fetchNotifications();
        this.$toast.success("Notification marquée comme lue");
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        this.$toast.error("Erreur lors de la mise à jour");
      }
    },

    async markAllAsRead() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) throw new Error("Utilisateur non défini");

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token non trouvé");

    await axios.put(
      `http://localhost:3000/api/notifications/${user.id}/lu`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await this.fetchNotifications();
    this.$toast.success("Toutes les notifications ont été marquées comme lues");
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);

    // Gestion plus sûre de l'erreur
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Erreur lors de la mise à jour";
    this.$toast.error(message);
  }
},


    formatTimeAgo(date) {
      return dayjs(date).fromNow();
    },
    
    getFilterLabel(type) {
      const labels = {
        'INFO': 'Informations',
        'ALERTE': 'Alertes',
        'MISSION': 'Missions',
        'DOCUMENT': 'Documents',
        'HSE': 'HSE'
      };
      return labels[type] || type;
    },
    
    truncateMessage(message) {
      return message.length > 120 ? message.substring(0, 120) + '...' : message;
    },
    
    badgeClass(type) {
      return {
        'INFO': 'info',
        'ALERTE': 'danger',
        'MISSION': 'primary',
        'DOCUMENT': 'warning',
        'HSE': 'success'
      }[type] || 'secondary';
    },
    
    typeIcon(type) {
      return {
        'INFO': 'bi bi-info-circle',
        'ALERTE': 'bi bi-exclamation-triangle',
        'MISSION': 'bi bi-briefcase',
        'DOCUMENT': 'bi bi-file-earmark-text',
        'HSE': 'bi bi-shield-check'
      }[type] || 'bi bi-bell';
    },
    
    filterByType(type) {
      this.currentFilter = type;
      this.currentPage = 1;
      this.showFilterDropdown = false;
    },
    
    toggleFilterDropdown() {
      this.showFilterDropdown = !this.showFilterDropdown;
    },
    
    selectNotification(notif) {
      this.selectedNotification = notif.id;
      if (!notif.lu) {
        this.marquerCommeLu(notif.id);
      }
    },
    
    nextPage() {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    prevPage() {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  mounted() {
    this.fetchNotifications();
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        this.showFilterDropdown = false;
      }
    });
  },
};
</script>

<style scoped>
.notifications-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.notifications-container {
  width: 100%;
  max-width: 1200px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.notifications-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon-wrapper i {
  font-size: 1.5rem;
  color: #4a6cf7;
}

.unread-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 600;
}

.header-controls {
  display: flex;
  gap: 0.75rem;
}

.btn-refresh, .btn-mark-all, .btn-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover, .btn-mark-all:hover, .btn-filter:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

.btn-refresh:active, .btn-mark-all:active, .btn-filter:active {
  transform: translateY(0);
}

.btn-mark-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-filter {
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
}

.filter-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 10;
  overflow: hidden;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.25rem 0;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #edf2f7;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #4a5568;
}

.filter-tag i {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.filter-tag i:hover {
  opacity: 1;
}

.loading-state {
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4a6cf7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #a0aec0;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.empty-state p {
  margin: 0;
  color: #718096;
  max-width: 400px;
}

.btn-reload {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn-reload:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

.notifications-list {
  padding: 0.5rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 8px;
  margin: 0.5rem;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.notification-item.unread {
  background: #f8fbfe;
}

.notification-badge {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.notification-badge.info {
  background: #4a6cf7;
}

.notification-badge.danger {
  background: #ff4757;
}

.notification-badge.primary {
  background: #6c5ce7;
}

.notification-badge.warning {
  background: #ffa502;
}

.notification-badge.success {
  background: #2ed573;
}

.notification-badge.secondary {
  background: #a4b0be;
}

.notification-details {
  flex-grow: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.notification-time {
  font-size: 0.8rem;
  color: #718096;
  white-space: nowrap;
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.5;
}

.notification-status {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4a6cf7;
}

.notifications-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-pagination {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover {
  background: #f8fafc;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.9rem;
  color: #4a5568;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.notification-item {
  animation: fadeIn 0.3s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-wrapper {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-controls {
    width: 100%;
    justify-content: flex-end;
  }
  
  .notification-item {
    padding: 1rem;
  }
}
</style>