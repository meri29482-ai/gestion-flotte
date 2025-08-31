<template>
  <div class="admin-container">
    <!-- En-tête avec titre et bouton d'ajout -->
    <div class="admin-header">
      <div class="header-title">
        <i class="bi bi-people-fill"></i>
        <h2>Gestion des Utilisateurs</h2>
      </div>
      <button class="btn btn-primary" @click="ouvrirModalAjout">
        <i class="bi bi-plus-lg"></i> Ajouter un utilisateur
      </button>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="admin-toolbar">
      <div class="search-container">
        <i class="bi bi-search"></i>
        <input
          v-model="recherche"
          class="form-control"
          placeholder="Rechercher par nom, prénom, email..."
        />
      </div>
      <div class="filter-container">
        <select v-model="filtreRole" class="form-select">
          <option value="">Tous les rôles</option>
          <option v-for="role in roles" :value="role" :key="role">{{ role }}</option>
        </select>
        <select v-model="filtreEtat" class="form-select">
          <option value="">Tous les états</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
        </select>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="table-responsive">
      <table class="admin-table" v-if="utilisateursFiltres.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Photo</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in utilisateursFiltres" :key="user.id">
            <td>{{ user.id }}</td>
            <td class="user-avatar">
              <div class="avatar-container">
                <img
                  v-if="user.photo"
                  :src="`http://localhost:3000/uploads/${user.photo}`"
                  alt="Photo de profil"
                  class="user-photo"
                />
                <div v-else class="avatar-initials">
                  {{ getInitials(user.nom, user.prenom) }}
                </div>
              </div>
            </td>
            <td>{{ user.nom }}</td>
            <td>{{ user.prenom }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="`role-${user.role.toLowerCase()}`">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="badge" :class="user.etat === 'ACTIF' ? 'bg-success' : 'bg-danger'">
                {{ user.etat === 'ACTIF' ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn-icon" @click="ouvrirModal(user)" title="Modifier">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button
                class="btn btn-icon"
                :class="user.etat === 'ACTIF' ? 'btn-danger' : 'btn-success'"
                @click="changerEtat(user)"
                :title="user.etat === 'ACTIF' ? 'Désactiver' : 'Activer'"
              >
                <i :class="user.etat === 'ACTIF' ? 'bi bi-person-x' : 'bi bi-person-check'"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="no-results">
        <i class="bi bi-exclamation-circle"></i>
        <p>Aucun utilisateur trouvé</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="totalPages > 1">
      <button
        class="btn btn-pagination"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <i class="bi bi-chevron-left"></i>
      </button>
      <span>Page {{ currentPage }} sur {{ totalPages }}</span>
      <button
        class="btn btn-pagination"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- Modal d'édition/ajout -->
    <div v-if="editUser" class="modal-overlay" @click.self="fermerModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modeAjout ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur' }}</h3>
          <button class="btn-close" @click="fermerModal"></button>
        </div>
        <div class="modal-body">
          <div class="avatar-upload" v-if="editUser.photo || photoFile">
            <img
              v-if="editUser.photo && !photoFile"
              :src="`http://localhost:3000/uploads/${editUser.photo}`"
              alt="Photo de profil"
              class="modal-avatar"
            />
            <img
              v-else-if="photoFile"
              :src="photoPreview"
              alt="Nouvelle photo"
              class="modal-avatar"
            />
            <button class="btn btn-sm btn-danger" @click="supprimerPhoto">
              <i class="bi bi-trash"></i> Supprimer
            </button>
          </div>

          <div class="form-group">
            <label>Matricule</label>
            <input v-model="editUser.matricule" class="form-control" />
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Nom</label>
                <input v-model="editUser.nom" class="form-control" required />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>Prénom</label>
                <input v-model="editUser.prenom" class="form-control" required />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="editUser.email" type="email" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <input
              v-model="editUser.mot_de_passe"
              type="password"
              class="form-control"
              :placeholder="modeAjout ? 'Mot de passe' : 'Laisser vide pour ne pas changer'"
              :required="modeAjout"
            />
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Rôle</label>
                <select v-model="editUser.role" class="form-control" required>
                  <option v-for="role in roles" :value="role" :key="role">{{ role }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>État</label>
                <select v-model="editUser.etat" class="form-control" required>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Photo de profil</label>
            <input
              type="file"
              class="form-control"
              accept="image/*"
              @change="handlePhotoUpload"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="fermerModal">Annuler</button>
          <button class="btn btn-primary" @click="modeAjout ? ajouterUser() : saveUser(editUser.id)">
            <i class="bi bi-save"></i> {{ modeAjout ? 'Ajouter' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminUtilisateurs",
  data() {
    return {
      utilisateurs: [],
      editUser: null,
      modeAjout: false,
      recherche: "",
      filtreRole: "",
      filtreEtat: "",
      roles: ["ADMIN","RESPONSABLE_PARC","CHAUFFEUR","RESPONSABLE_HSE","DEMANDEUR","MANAGER"],
      currentPage: 1,
      itemsPerPage: 10,
      photoFile: null,
      photoPreview: null,
    };
  },
  computed: {
    utilisateursFiltres() {
      let filtered = this.utilisateurs;
      const q = this.recherche.toLowerCase();
      
      if (q) {
        filtered = filtered.filter(
          (u) =>
            u.nom.toLowerCase().includes(q) ||
            u.prenom.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.matricule.toLowerCase().includes(q)
        );
      }
      
      if (this.filtreRole) {
        filtered = filtered.filter((u) => u.role === this.filtreRole);
      }
      
      if (this.filtreEtat) {
        filtered = filtered.filter((u) => u.etat === this.filtreEtat);
      }
      
      // Pagination
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return filtered.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.utilisateurs.length / this.itemsPerPage);
    },
  },
  mounted() {
    this.chargerUtilisateurs();
  },
  methods: {
    getInitials(nom, prenom) {
      return `${nom?.charAt(0) || ""}${prenom?.charAt(0) || ""}`.toUpperCase();
    },
    async chargerUtilisateurs() {
      try {
        const res = await axios.get("http://localhost:3000/api/utilisateurs");
        this.utilisateurs = res.data;
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
        this.$toast.error("Erreur lors du chargement des utilisateurs");
      }
    },
    ouvrirModal(user) {
      this.modeAjout = false;
      this.editUser = { ...user, mot_de_passe: "" };
      this.photoFile = null;
      this.photoPreview = null;
    },
    ouvrirModalAjout() {
      this.modeAjout = true;
      this.editUser = {
        matricule: "",
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        role: "CHAUFFEUR",
        etat: "ACTIF",
        photo: null,
      };
      this.photoFile = null;
      this.photoPreview = null;
    },
    fermerModal() {
      this.editUser = null;
      this.photoFile = null;
      this.photoPreview = null;
    },
    handlePhotoUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.photoFile = file;
        this.photoPreview = URL.createObjectURL(file);
      }
    },
    supprimerPhoto() {
      this.editUser.photo = null;
      this.photoFile = null;
      this.photoPreview = null;
    },
    async ajouterUser() {
      try {
        const formData = new FormData();
        for (const key in this.editUser) {
          if (this.editUser[key] !== null) {
            formData.append(key, this.editUser[key]);
          }
        }
        if (this.photoFile) formData.append("photo", this.photoFile);

        await axios.post("http://localhost:3000/api/utilisateurs", formData);
        this.$toast.success("Utilisateur ajouté avec succès");
        this.fermerModal();
        this.chargerUtilisateurs();
      } catch (err) {
        console.error("Erreur lors de l'ajout :", err);
        this.$toast.error("Erreur lors de l'ajout de l'utilisateur");
      }
    },
  async saveUser(id) {
  try {
    const formData = new FormData();
    for (const key in this.editUser) {
      if (this.editUser[key] !== null && this.editUser[key] !== undefined) {
        formData.append(key, this.editUser[key]);
      }
    }
    if (this.photoFile) formData.append("photo", this.photoFile);

    await axios.put(`http://localhost:3000/api/utilisateurs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("✅ Utilisateur modifié avec succès");
    this.fermerModal();
    this.chargerUtilisateurs();
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde :", error);
  }
},
    async changerEtat(user) {
      const nouvelEtat = user.etat === "ACTIF" ? "INACTIF" : "ACTIF";
      const confirmation = confirm(
        `Voulez-vous vraiment ${nouvelEtat === "ACTIF" ? "activer" : "désactiver"} cet utilisateur ?`
      );
      
      if (!confirmation) return;

      try {
        await axios.put(`http://localhost:3000/api/utilisateurs/${user.id}`, {
          ...user,
          mot_de_passe: undefined,
          etat: nouvelEtat,
        });
        user.etat = nouvelEtat;
        this.$toast.success(
          `Utilisateur ${nouvelEtat === "ACTIF" ? "activé" : "désactivé"} avec succès`
        );
      } catch (err) {
        const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Erreur lors du changement d'état";
    console.error("Erreur lors du changement d'état :", err);
    this.$toast.error(message);
      }
    },
  },
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
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Structure principale */
.admin-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title i {
  font-size: 1.8rem;
  color: var(--primary-color);
}

.header-title h2 {
  margin: 0;
  color: var(--dark-color);
  font-weight: 600;
}

/* Barre d'outils */
.admin-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-container i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-color);
}

.search-container input {
  padding-left: 2.5rem;
  border-radius: var(--border-radius);
  border: 1px solid #ced4da;
}

.filter-container {
  display: flex;
  gap: 1rem;
}

.filter-container select {
  min-width: 150px;
  border-radius: var(--border-radius);
}

/* Tableau */
.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.admin-table th {
  background-color: var(--primary-color);
  color: rgb(55, 80, 100);
  padding: 1rem;
  text-align: left;
  font-weight: 500;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover {
  background-color: rgba(52, 152, 219, 0.05);
}

/* Avatar */
.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--light-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-weight: bold;
  color: var(--primary-color);
}

/* Badges */
.badge {
  padding: 0.35rem 0.65rem;
  border-radius: 50px;
  font-size: 0.75rem;
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


/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition);
}

.btn-icon:hover {
  transform: scale(1.1);
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
}

.no-results p {
  margin: 0;
  font-size: 1.2rem;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-pagination {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #dee2e6;
  transition: var(--transition);
}

.btn-pagination:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--dark-color);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  opacity: 0.5;
  transition: var(--transition);
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.modal-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--light-color);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--dark-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

/* Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .admin-toolbar {
    flex-direction: column;
  }
  
  .filter-container {
    width: 100%;
  }
  
  .filter-container select {
    width: 100%;
  }
  
  .admin-table {
    display: block;
    color: #6888a9;
    overflow-x: auto;
  }
}
</style>