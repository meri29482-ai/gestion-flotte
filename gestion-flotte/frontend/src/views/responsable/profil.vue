<template>
  <div class="container py-5">
    <div class="profile-card shadow-lg">
      <!-- EN-TÊTE -->
      <div class="d-flex flex-column flex-md-row align-items-center gap-4 mb-4 border-bottom pb-3">
        <img
          v-if="profil.photo"
          :src="`http://localhost:3000${profil.photo}`"
          alt="Photo de profil"
          class="photo-profil"
        />
        <div class="text-center text-md-start">
          <h2 class="fw-bold text-orange mb-1">{{ profil.nom }} {{ profil.prenom }}</h2>
          <p class="text-muted mb-1">
            <i class="bi bi-person-badge-fill me-2 text-secondary"></i>Matricule : {{ profil.matricule }}
          </p>
          <p>
            <i class="bi bi-circle-fill me-1" :class="profil.etat === 'ACTIF' ? 'text-success' : 'text-secondary'"></i>
            <span :class="['badge', profil.etat === 'ACTIF' ? 'bg-success' : 'bg-secondary']">
              {{ profil.etat === 'ACTIF' ? 'Actif' : 'Inactif' }}
            </span>
          </p>
        </div>
      </div>

      <!-- INFOS OU FORMULAIRE -->
      <div class="row gy-4" v-if="!enEdition">
        <div class="col-md-6" v-for="item in infos" :key="item.label">
          <div class="info-block d-flex align-items-start gap-3">
            <i :class="item.icon + ' fs-4 text-orange'"></i>
            <div>
              <small class="text-muted">{{ item.label }}</small>
              <p class="fw-semibold mb-0">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row gy-4" v-else>
        <div class="col-md-6">
          <label>Téléphone</label>
          <input v-model="profil.telephone" type="text" class="form-control" />
        </div>
        <div class="col-md-6">
          <label>Email</label>
          <input v-model="profil.email" type="email" class="form-control" />
        </div>
      
        <div class="col-md-6">
          <label>Fonction</label>
          <input v-model="profil.fonction" type="text" class="form-control" />
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="text-end mt-4">
        <template v-if="action === 'ecriture' && !enEdition">
          <button class="btn btn-outline-warning" @click="enEdition = true">
            <i class="bi bi-pencil-square me-1"></i> Modifier le profil
          </button>
        </template>

        <template v-if="action === 'ecriture' && enEdition">
          <button class="btn btn-success me-2" @click="saveProfil">
            <i class="bi bi-check-circle me-1"></i> Enregistrer
          </button>
          <button class="btn btn-secondary" @click="cancelEdit">
            <i class="bi bi-x-circle me-1"></i> Annuler
          </button>
        </template>

        <template v-if="action === 'lecture'">
          <button class="btn btn-outline-secondary" @click="demanderAcces">
            <i class="bi bi-lock me-1"></i> Demander l'accès
          </button>
        </template>
      </div>

      <!-- ERREUR -->
      <div v-if="error" class="alert alert-danger mt-4 text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfilUtilisateur",
  data() {
    return {
      profil: {
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
    
        matricule: "",
        fonction: "",
        photo: null,
        role: "",
        etat: "",
      },
      action: "lecture",
      enEdition: false,
      error: null,
    };
  },
  computed: {
    infos() {
      return [
        { label: "Téléphone", icon: "bi bi-telephone-fill", value: this.profil.telephone },
        { label: "Email", icon: "bi bi-envelope-fill", value: this.profil.email },
        { label: "Fonction", icon: "bi bi-person-vcard-fill", value: this.profil.fonction },
        { label: "Rôle", icon: "bi bi-person-check-fill", value: this.profil.role },
      ];
    },
  },
  methods: {
    async fetchProfil() {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          this.error = "⚠️ Utilisateur non identifié.";
          return;
        }

        const user = JSON.parse(userData);
        const res = await axios.get(`http://localhost:3000/api/utilisateurs/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const utilisateur = res.data;
        this.profil = {
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          telephone: utilisateur.numero_telephone || "Non renseigné",
          email: utilisateur.email || "Non renseigné",
         
          fonction: utilisateur.fonction || "Non définie",
          matricule: utilisateur.matricule,
          photo: utilisateur.photo ? `/uploads/${utilisateur.photo}` : null,
          role: utilisateur.role,
          etat: utilisateur.etat,
        };

        this.action = utilisateur.action || "lecture";
      } catch (err) {
        console.error("❌ Erreur lors du chargement du profil :", err);
        this.error = "❌ Erreur lors du chargement du profil.";
      }
    },

    cancelEdit() {
      this.enEdition = false;
      this.fetchProfil(); // recharge les données initiales
    },

    async saveProfil() {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        if (!token || !userId) {
          this.error = "Utilisateur non identifié.";
          return;
        }

        const payload = {
          numero_telephone: this.profil.telephone,
          email: this.profil.email,
         
          fonction: this.profil.fonction,
        };

        await axios.put(`http://localhost:3000/api/utilisateurs/${userId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.enEdition = false;
        alert("✅ Profil mis à jour avec succès !");
        this.fetchProfil();
      } catch (err) {
        console.error("❌ Erreur mise à jour :", err);
        this.error = "Erreur lors de la mise à jour du profil.";
      }
    },

    async demanderAcces() {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          this.error = "❌ Utilisateur non authentifié.";
          return;
        }

        const user = JSON.parse(userData);
        const ADMIN_ID = 21;

        const payload = {
          type: "INFO",
          titre: "Demande d'accès à la modification",
          message: `${user.nom} ${user.prenom} demande l'accès pour modifier son profil.`,
          utilisateur_id: user.id,
          recepteur_id: ADMIN_ID,
        };

        const response = await axios.post("http://localhost:3000/api/notifications", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 201) {
          alert("✅ Notification envoyée à l'administrateur.");
        } else {
          this.error = "⚠️ Réponse inattendue du serveur.";
        }
      } catch (err) {
        console.error("❌ Erreur lors de la création de notification :", err.response?.data || err.message);
        this.error = err.response?.data?.message || "Erreur lors de la demande d'accès.";
      }
    },
  },
  mounted() {
    this.fetchProfil();
  },
};
</script>

<style scoped>
.profile-card {
  background-color: #fff;
  max-width: 1200px;
  margin: auto;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', sans-serif;
}
.photo-profil {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ff7a00;
}
.text-orange {
  color: #ff7a00;
}
.badge {
  font-size: 0.9rem;
  padding: 0.35em 0.8em;
  border-radius: 1rem;
  color: #fff;
}
.bg-success {
  background-color: #28a745;
}
.bg-secondary {
  background-color: #6c757d;
}
.info-block {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.info-block:hover {
  background: #f1f1f1;
}
.btn {
  min-width: 160px;
}
</style>
