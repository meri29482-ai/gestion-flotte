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

      <!-- INFOS -->
      <div class="row gy-4" v-if="!error">
        <div class="col-md-6" v-for="item in infos" :key="item.label">
          <div class="info-block d-flex align-items-start gap-3">
            <i :class="item.icon + ' fs-4 text-orange'"></i>
            <div>
              <small class="text-muted">{{ item.label }}</small>
              <p class="fw-semibold mb-0" v-if="!editing">{{ item.value }}</p>
              <input v-else v-model="profil[item.field]" class="form-control form-control-sm">
            </div>
          </div>
        </div>
      </div>

      <!-- DOCUMENTS OBLIGATOIRES -->
      <h5 class="mt-5 text-orange">
        <i class="bi bi-folder2-open me-2"></i>Documents obligatoires
      </h5>
      <div class="row g-3">
  <div class="col-md-4 d-flex" v-for="doc in documentsObligatoires" :key="doc.type">
    <div class="info-block card flex-grow-1" :class="{'document-expired': doc.isExpired, 'document-warning': doc.isAboutToExpire}">
      <div class="card-body d-flex flex-column h-100">
        <div class="d-flex align-items-start gap-3">
          <i :class="doc.icon + ' fs-4 text-orange'"></i>
          <div class="flex-grow-1">
            <h6 class="card-title text-muted mb-2">{{ doc.label }}</h6>
            
            <!-- Contenu document -->
            <div class="document-content">
              <p class="mb-2" v-if="doc.url && !editingDocuments">
                <a :href="`http://localhost:3000${doc.url}`" target="_blank" class="btn btn-sm btn-outline ">
                  <i class="bi bi-download"></i> Télécharger
                </a>
              </p>
              <p class="text-danger mb-2" v-else-if="!editingDocuments">
                <i class="bi bi-exclamation-circle"></i> Non fourni
              </p>
              
              <!-- Mode édition -->
              <div v-else class="document-edit">
                <input type="file" class="form-control form-control-sm mb-2" @change="handleFileUpload($event, doc.type)">
                <div class="mb-2">
                  <label class="small text-muted">Date d'expiration</label>
                  <input type="date" class="form-control form-control-sm" v-model="doc.date_expiration">
                </div>
                <small v-if="uploadStatus[doc.type]" :class="`text-${uploadStatus[doc.type].success ? 'success' : 'danger'}`">
                  {{ uploadStatus[doc.type].message }}
                </small>
              </div>
            </div>
            
            <!-- Section expiration -->
            <div v-if="doc.date_expiration && !editingDocuments" class="document-expiration mt-auto">
              <hr class="my-2">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Expire le: {{ formatDate(doc.date_expiration) }}</small>
                <span class="badge" :class="{
                  'bg-success': doc.statut === 'valide',
                  'bg-danger': doc.statut === 'expiré',
                  'bg-warning': doc.statut === 'à vérifier'
                }">
                  {{ doc.statut }}
                </span>
              </div>
              <div v-if="doc.isExpired" class="alert alert-danger py-1 px-2 mt-2 mb-0 small">
                <i class="bi bi-exclamation-triangle-fill"></i> Ce document a expiré !
              </div>
              <div v-else-if="doc.isAboutToExpire" class="alert alert-warning py-1 px-2 mt-2 mb-0 small">
                <i class="bi bi-exclamation-triangle-fill"></i> Expire bientôt ({{ doc.daysUntilExpiration }} jours)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      <!-- ACTIONS -->
      <div class="text-end mt-4">
        <template v-if="action === 'lecture'">
          <button class="btn btn-outline-secondary" @click="demanderAcces">
            <i class="bi bi-lock me-1"></i> Demander l'accès
          </button>
        </template>
        <template v-else>
          <button v-if="!editing" class="btn btn-orange me-2" @click="startEditing">
            <i class="bi bi-pencil me-1"></i> Modifier le profil
          </button>
          <button v-if="!editingDocuments" class="btn btn-orange" @click="startEditingDocuments">
            <i class="bi bi-upload me-1"></i> Mettre à jour les documents
          </button>
          <div v-else class="d-flex gap-2 justify-content-end">
            <button class="btn btn-success" @click="saveDocuments">
              <i class="bi bi-check me-1"></i> Enregistrer
            </button>
            <button class="btn btn-danger" @click="cancelEditingDocuments">
              <i class="bi bi-x me-1"></i> Annuler
            </button>
          </div>
          <div v-if="editing" class="d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-success" @click="saveProfile">
              <i class="bi bi-check me-1"></i> Enregistrer
            </button>
            <button class="btn btn-danger" @click="cancelEditing">
              <i class="bi bi-x me-1"></i> Annuler
            </button>
          </div>
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
  name: "ProfilChauffeur",
  data() {
    return {
      profil: {
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        matricule: "",
        fonction: "",
        adresse: "",
        photo: null,
        role: "",
        etat: "",
        societe: "",
        numero_permis: "",
      },
      documentsObligatoires: [],
      action: "lecture",
      error: null,
      editing: false,
      editingDocuments: false,
      originalProfile: {},
      filesToUpload: {},
      uploadStatus: {},
      hasExpiredDocuments: false,
      hasAboutToExpireDocuments: false
    };
  },
  computed: {
    infos() {
      return [
        { label: "Téléphone", icon: "bi bi-telephone-fill", value: this.profil.telephone, field: "telephone" },
        { label: "Email", icon: "bi bi-envelope-fill", value: this.profil.email, field: "email" },
        { label: "Fonction", icon: "bi bi-person-vcard-fill", value: this.profil.fonction, field: "fonction" },
        { label: "Adresse", icon: "bi bi-geo-alt-fill", value: this.profil.adresse, field: "adresse" },
        { label: "Société", icon: "bi bi-building", value: this.profil.societe, field: "societe" },
        { label: "Numéro de permis", icon: "bi bi-credit-card", value: this.profil.numero_permis, field: "numero_permis" },
      ];
    },
  },
  methods: {
    

    // Modifiez la méthode fetchProfil pour inclure les IDs des documents
    async fetchProfil() {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          this.error = "⚠️ Utilisateur non identifié.";
          return;
        }

        const user = JSON.parse(userData);
        const res = await axios.get(`http://localhost:3000/api/chauffeurs/utilisateur/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chauffeur = res.data;
        const utilisateur = chauffeur.utilisateur;

        this.profil = {
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          telephone: utilisateur.numero_telephone || "Non renseigné",
          email: utilisateur.email || "Non renseigné",
          fonction: utilisateur.fonction || "Non définie",
          adresse: chauffeur.adresse || "Non renseignée",
          societe: chauffeur.societe || "",
          numero_permis: chauffeur.numero_permis || "",
          matricule: utilisateur.matricule,
          photo: utilisateur.photo ? `/uploads/${utilisateur.photo}` : null,
          etat: utilisateur.etat,
        };

        this.originalProfile = {...this.profil};

        // Ajoutez l'ID du document dans les données récupérées
        this.documentsObligatoires = this.checkDocumentStatus([
          {
            id: chauffeur.documents.find(doc => doc.type_document === "permis_conduire")?.id,
            type: "permis_conduire",
            label: "Permis de conduire",
            icon: "bi bi-card-text",
            url: chauffeur.documents.find(doc => doc.type_document === "permis_conduire")?.fichier_url || null,
            date_expiration: chauffeur.documents.find(doc => doc.type_document === "permis_conduire")?.date_expiration || null,
            statut: chauffeur.documents.find(doc => doc.type_document === "permis_conduire")?.statut || 'valide'
          },
          {
            id: chauffeur.documents.find(doc => doc.type_document === "certificat_medical")?.id,
            type: "certificat_medical",
            label: "Certificat médical",
            icon: "bi bi-file-medical",
            url: chauffeur.documents.find(doc => doc.type_document === "certificat_medical")?.fichier_url || null,
            date_expiration: chauffeur.documents.find(doc => doc.type_document === "certificat_medical")?.date_expiration || null,
            statut: chauffeur.documents.find(doc => doc.type_document === "certificat_medical")?.statut || 'valide'
          },
          {
            id: chauffeur.documents.find(doc => doc.type_document === "certificat_capacite")?.id,
            type: "certificat_capacite",
            label: "Certificat de capacité",
            icon: "bi bi-award",
            url: chauffeur.documents.find(doc => doc.type_document === "certificat_capacite")?.fichier_url || null,
            date_expiration: chauffeur.documents.find(doc => doc.type_document === "certificat_capacite")?.date_expiration || null,
            statut: chauffeur.documents.find(doc => doc.type_document === "certificat_capacite")?.statut || 'valide'
          }
        ]);

        this.action = utilisateur.action || "lecture";
        this.checkDocumentAlerts();
      } catch (err) {
        console.error("❌ Erreur récupération chauffeur :", err);
        this.error = "❌ Erreur de récupération des données du chauffeur.";
      }
    },
    async demanderAcces() {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        const payload = {
          type: "INFO",
          titre: "Demande d'accès",
          message: `${user.nom} ${user.prenom} demande la modification de son profil.`,
          utilisateur_id: user.id,
          recepteur_id: 21,
        };

        await axios.post("http://localhost:3000/api/notifications", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("✅ Notification envoyée !");
      } catch (err) {
        this.error = "Erreur lors de la demande d'accès.";
      }
    },
    startEditing() {
      this.editing = true;
      this.originalProfile = {...this.profil};
    },
    cancelEditing() {
      this.editing = false;
      this.profil = {...this.originalProfile};
    },
    async saveProfile() {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        
        await axios.put(`http://localhost:3000/api/utilisateurs/${user.id}`, {
          nom: this.profil.nom,
          prenom: this.profil.prenom,
          numero_telephone: this.profil.telephone,
          email: this.profil.email,
          fonction: this.profil.fonction
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await axios.put(`http://localhost:3000/api/chauffeurs/utilisateur/${user.id}`, {
          adresse: this.profil.adresse,
          societe: this.profil.societe,
          numero_permis: this.profil.numero_permis
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.editing = false;
        await this.fetchProfil();
        alert("✅ Profil mis à jour avec succès !");
      } catch (err) {
        console.error("Erreur lors de la mise à jour du profil:", err);
        this.error = "❌ Erreur lors de la mise à jour du profil";
      }
    },
    startEditingDocuments() {
      this.editingDocuments = true;
      this.filesToUpload = {};
      this.uploadStatus = {};
    },
    cancelEditingDocuments() {
      this.editingDocuments = false;
      this.filesToUpload = {};
      this.uploadStatus = {};
    },
    handleFileUpload(event, docType) {
      this.filesToUpload[docType] = event.target.files[0];
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    checkDocumentStatus(documents) {
      const now = new Date();
      const warningThreshold = 30; // Nombre de jours avant expiration pour alerter

      return documents.map(doc => {
        if (!doc.date_expiration) return doc;
        
        const expDate = new Date(doc.date_expiration);
        const timeDiff = expDate.getTime() - now.getTime();
        const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
          ...doc,
          isExpired: daysUntilExpiration < 0,
          isAboutToExpire: daysUntilExpiration > 0 && daysUntilExpiration <= warningThreshold,
          daysUntilExpiration,
          statut: daysUntilExpiration < 0 ? 'expiré' : 
                 (daysUntilExpiration <= warningThreshold ? 'à vérifier' : 'valide')
        };
      });
    },
    checkDocumentAlerts() {
      this.hasExpiredDocuments = this.documentsObligatoires.some(doc => doc.isExpired);
      this.hasAboutToExpireDocuments = this.documentsObligatoires.some(doc => doc.isAboutToExpire);

      if (this.hasExpiredDocuments) {
        alert("⚠️ Attention, vous avez des documents expirés !");
      } else if (this.hasAboutToExpireDocuments) {
        alert("ℹ️ Vous avez des documents qui expirent bientôt !");
      }
    },
    async saveDocuments() {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        
        for (const docType in this.filesToUpload) {
          if (this.filesToUpload[docType]) {
            const formData = new FormData();
            formData.append('fichier', this.filesToUpload[docType]);
            formData.append('type_document', docType);
            
            const doc = this.documentsObligatoires.find(d => d.type === docType);
            if (doc && doc.date_expiration) {
              formData.append('date_expiration', doc.date_expiration);
            }

            try {
              // Vérifier si le document existe déjà
              const existingDoc = this.documentsObligatoires.find(d => 
                d.type === docType && d.url
              );

              if (existingDoc) {
                // Mettre à jour le document existant
                const docId = existingDoc.id; // Vous devrez peut-être récupérer l'ID différemment
                await axios.put(
                  `http://localhost:3000/api/documents/${docId}`,
                  formData,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data'
                    }
                  }
                );
              } else {
                // Créer un nouveau document
                formData.append('chauffeur_id', user.id);
                await axios.post(
                  `http://localhost:3000/api/documents`,
                  formData,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data'
                    }
                  }
                );
              }
              
              this.uploadStatus[docType] = {
                success: true,
                message: "Document uploadé avec succès"
              };
            } catch (err) {
              console.error(`Erreur lors de l'upload du document ${docType}:`, err);
              let message = "Erreur lors de l'upload";
              if (err.response) {
                if (err.response.data && err.response.data.message) {
                  message = err.response.data.message;
                }
              }
              this.uploadStatus[docType] = {
                success: false,
                message: message
              };
            }
          }
        }
        
        setTimeout(async () => {
          this.editingDocuments = false;
          await this.fetchProfil();
        }, 1500);
      } catch (err) {
        console.error("Erreur générale lors de l'enregistrement des documents:", err);
        this.error = "❌ Erreur lors de l'enregistrement des documents";
      }
    }
  },
  mounted() {
    this.fetchProfil();
  },
};
</script>

<style scoped>
.profile-card {
  background-color: #fff;
  max-width: 1000px;
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
.btn-orange {
  background-color: #ff7a00;
  color: white;
}
.btn-orange:hover {
  background-color: #e06d00;
  color: white;
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
.bg-warning {
  background-color: #ffc107;
}
.bg-danger {
  background-color: #dc3545;
}
.info-block {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 1rem;
}
.info-block:hover {
  background: #f1f1f1;
}
.document-expired {
  border-left: 4px solid #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}
.document-warning {
  border-left: 4px solid #ffc107;
  background-color: rgba(255, 193, 7, 0.05);
}
.btn {
  min-width: 160px;
}
.btn-outline {
  border-color: #dd6b20; /* orange */
  color: #dd6b20;        /* texte orange */
  background-color: transparent;
}

.btn-outline:hover {
  background-color: #dd6b20; /* fond orange au survol */
  color: white;              /* texte blanc au survol */
}
</style>