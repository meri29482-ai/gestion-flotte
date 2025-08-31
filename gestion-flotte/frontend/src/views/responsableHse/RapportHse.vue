<template>
  <div class="container-fluid px-4 py-5">

    <!-- Header amélioré -->
<div class="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
  <!-- Titre et description -->
  <div class="me-auto">
    <h1 class="page-title mb-1">Rapports HSE</h1>
    <p class="text-muted mb-0">Gestion des normes de santé, sécurité et environnement</p>
  </div>

  <!-- Barre de recherche -->
  <div class="col-md-4 flex-grow-1 mb-2">
    <div class="input-group shadow-sm rounded-3 overflow-hidden">
      <span class="input-group-text bg-white border-0"><i class="fas fa-search text-muted"></i></span>
      <input type="text" class="form-control border-0" placeholder="Rechercher une norme..." v-model="searchQuery">
    </div>
  </div>

  <!-- Bouton Ajouter -->
  <button class="btn btn-primary btn-add shadow-sm rounded-3" @click="ouvrirModal()">
    <i class="fas fa-plus-circle me-2"></i>Ajouter une norme
  </button>
</div>

    <!-- Modal formulaire -->
    <div class="modal fade" id="formModal" tabindex="-1" aria-hidden="true" ref="formModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg rounded-4">
          <div class="modal-header bg-gradient-primary text-white rounded-top-4">
            <h5 class="modal-title">{{ isEdit ? 'Modifier' : 'Ajouter' }} une norme HSE</h5>
            <button type="button" class="btn-close btn-close-white" @click="fermerModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="ajouterNorme" enctype="multipart/form-data">

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Titre <span class="text-danger">*</span></label>
                  <input v-model="form.titre" type="text" class="form-control form-control-lg" placeholder="Nom de la norme" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Type</label>
                  <select v-model="form.type" class="form-select form-select-lg">
                    <option value="Sécurité">Sécurité</option>
                    <option value="Santé">Santé</option>
                    <option value="Environnement">Environnement</option>
                    <option value="Temps de conduite">Temps de conduite</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Fichier <span class="text-danger" v-if="!isEdit">*</span></label>
                  <div class="file-input-container position-relative">
                    <input ref="fileInput" @change="handleFile" type="file" class="form-control" :required="!isEdit" />
                    <i class="fas fa-file-upload file-input-icon position-absolute top-50 end-0 translate-middle-y me-3"></i>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Date du fichier</label>
                  <input v-model="form.date_fichier" type="date" class="form-control" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Version</label>
                <input v-model="form.version" type="text" class="form-control" placeholder="1.0" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Description</label>
                <textarea v-model="form.description" class="form-control" rows="3" placeholder="Description de la norme"></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Statut</label>
                <select v-model="form.statut" class="form-select">
                  <option value="Actif">Actif</option>
                  <option value="Obsolète">Obsolète</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Lien externe (optionnel)</label>
                <input v-model="form.lien_externe" type="url" class="form-control" placeholder="https://..." />
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary px-4 rounded-3" @click="fermerModal">Annuler</button>
                <button type="submit" class="btn btn-primary px-4 rounded-3">{{ isEdit ? 'Modifier' : 'Ajouter' }}</button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres centrés avec label -->
<div class="row mb-4 justify-content-center text-center">
  <div class="col-auto">
    <label class="form-label fw-bold mb-2">Filtrer par type :</label>
    <div class="d-flex flex-wrap justify-content-center gap-2">
      <button v-for="type in types" :key="type"
              class="btn btn-sm rounded-pill fw-semibold px-3 py-2"
              :class="filterType === type ? 'btn-primary shadow-sm' : 'btn-outline-primary'"
              @click="toggleFilter(type)">
        {{ type }}
      </button>
    </div>
  </div>
</div>

    <!-- Cartes normes -->
    <div class="row" v-if="filteredNormes.length > 0">
  <div class="col-md-4 col-lg-4 mb-4" v-for="norme in filteredNormes" :key="norme.id">
    <div class="card h-100 shadow-sm card-hover border-0 rounded-4 overflow-hidden transition-hover">

      <!-- Header avec type et statut -->
      <div class="card-header d-flex justify-content-between align-items-center py-3 px-4" :class="typeHeader(norme.type)">
        <span class="badge bg-white text-dark px-3 py-2 rounded-3 fw-semibold shadow-sm">{{ norme.type }}</span>
        <span class="status-indicator" :class="statusDot(norme.statut)" :title="norme.statut"></span>
      </div>

      <!-- Corps de la carte -->
      <div class="card-body d-flex flex-column p-4">
        <h5 class="card-title fw-bold text-dark mb-3">{{ norme.titre }}</h5>
        <p class="card-text text-muted mb-3 flex-grow-1" v-if="norme.description">
          {{ truncateText(norme.description, 120) }}
        </p>

        <!-- Info fichier -->
        <div class="file-info mb-4 p-3 bg-light rounded-3 d-flex align-items-center shadow-sm">
          <i class="fas fa-file-pdf text-danger me-3 fs-4"></i>
          <div class="flex-grow-1">
            <div class="fw-semibold text-truncate" style="max-width: 180px;">{{ getFileName(norme.fichier) }}</div>
            <small class="text-muted">Version: {{ norme.version || '1.0' }}</small>
          </div>
        </div>

        <!-- Détails norme -->
        <div class="norme-details mt-auto">
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Création:</span>
            <span class="fw-medium">{{ formatDate(norme.date_creation) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Date fichier:</span>
            <span class="fw-medium">{{ formatDate(norme.date_fichier) }}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="text-muted">Statut:</span>
            <span :class="{'text-success fw-semibold': norme.statut === 'Actif', 'text-danger fw-semibold': norme.statut === 'Obsolète'}">
              {{ norme.statut }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer avec actions -->
      <div class="card-footer bg-transparent py-3 px-4 border-top-0 d-flex justify-content-between">
        <a :href="`http://localhost:3000/uploads/documents/${norme.fichier}`" target="_blank"
           class="btn btn-sm btn-primary d-flex align-items-center rounded-3 px-3 shadow-sm">
          <i class="fas fa-eye me-2"></i> Consulter
        </a>
        <button class="btn btn-sm btn-outline-warning rounded-3 px-3 shadow-sm" @click="ouvrirModalPourModification(norme)">
          <i class="fas fa-edit me-1"></i> Modifier
        </button>
      </div>

    </div>
  </div>
</div>

    <!-- Empty state -->
    <div class="text-center py-5" v-else>
      <i class="fas fa-folder-open fa-4x text-light mb-3"></i>
      <h5 class="text-secondary mb-2">Aucune norme HSE disponible</h5>
      <p class="text-muted mb-4">Commencez par ajouter votre première norme HSE</p>
      <button class="btn btn-primary btn-lg rounded-3 px-4" @click="ouvrirModal()">
        <i class="fas fa-plus-circle me-2"></i>Ajouter une norme
      </button>
    </div>

  </div>
</template>
<script>
import axios from "axios";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import { nextTick } from "vue";

export default {
  name: "NormesHseModal",
  data() {
    return {
      normes: [],
      searchQuery: '',
      filterType: null,
      types: ['Sécurité', 'Santé', 'Environnement', 'Temps de conduite', 'Autre'],
      form: {
        titre: "",
        type: "Sécurité",
        fichier: null,
        version: "1.0",
        description: "",
        date_fichier: "",
        statut: "Actif",
        lien_externe: "",
      },
      modal: null,
      isEdit: false,
      editId: null
    };
  },
  computed: {
    filteredNormes() {
      let filtered = this.normes;
      
      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(norme => 
          norme.titre.toLowerCase().includes(query) || 
          (norme.description && norme.description.toLowerCase().includes(query))
        );
      }
      
      // Filtre par type
      if (this.filterType) {
        filtered = filtered.filter(norme => norme.type === this.filterType);
      }
      
      return filtered;
    }
  },
  created() { this.getNormes(); },
  mounted() {
    nextTick(() => { this.modal = new bootstrap.Modal(this.$refs.formModal); });
  },
  methods: {
    ouvrirModal() { 
      this.isEdit = false; 
      this.resetForm(); 
      this.modal.show(); 
    },
    ouvrirModalPourModification(norme) {
      this.isEdit = true;
      this.editId = norme.id;
      this.form = { ...norme, fichier: null };
      this.modal.show();
    },
    fermerModal() {
      this.modal.hide();
      this.resetForm();
    },
    handleFile(event) { this.form.fichier = event.target.files[0]; },
    resetForm() {
      this.form = { titre: "", type: "Sécurité", fichier: null, version: "1.0", description: "", date_fichier: "", statut: "Actif", lien_externe: "" };
      if (this.$refs.fileInput) this.$refs.fileInput.value = null;
    },
    async getNormes() {
      try {
        const res = await axios.get("http://localhost:3000/api/normes-hse");
        this.normes = res.data;
      } catch (error) { console.error(error); alert("Erreur lors de la récupération des normes HSE."); }
    },
    formatDate(date) { 
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    typeHeader(type) {
      switch (type) {
        case "Sécurité": return "bg-danger-subtle";
        case "Santé": return "bg-success-subtle";
        case "Environnement": return "bg-primary-subtle";
        case "Temps de conduite": return "bg-warning-subtle";
        default: return "bg-secondary-subtle";
      }
    },
    statusDot(statut) { 
      return statut === "Actif" ? "status-active" : "status-inactive"; 
    },
    truncateText(text, maxLength) {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + '...';
    },
    getFileName(filePath) {
      if (!filePath) return "Document";
      return filePath.split('/').pop().split('_').pop();
    },
    getFileIcon(filePath) {
      if (!filePath) return "fa-file";
      const extension = filePath.split('.').pop().toLowerCase();
      if (['pdf'].includes(extension)) return "fa-file-pdf";
      if (['doc', 'docx'].includes(extension)) return "fa-file-word";
      if (['xls', 'xlsx'].includes(extension)) return "fa-file-excel";
      if (['ppt', 'pptx'].includes(extension)) return "fa-file-powerpoint";
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return "fa-file-image";
      return "fa-file";
    },
    getFileTypeClass(filePath) {
      if (!filePath) return "file-icon-default";
      const extension = filePath.split('.').pop().toLowerCase();
      if (['pdf'].includes(extension)) return "file-icon-pdf";
      if (['doc', 'docx'].includes(extension)) return "file-icon-doc";
      if (['xls', 'xlsx'].includes(extension)) return "file-icon-xls";
      if (['ppt', 'pptx'].includes(extension)) return "file-icon-ppt";
      return "file-icon-default";
    },
    toggleFilter(type) {
      this.filterType = this.filterType === type ? null : type;
    },
    clearFilters() {
      this.searchQuery = '';
      this.filterType = null;
    },
    async ajouterNorme() {
      try {
        const formData = new FormData();
        Object.keys(this.form).forEach(k => {
          if (this.form[k] !== null) formData.append(k, this.form[k]);
        });
        if (this.isEdit) {
          await axios.put(`http://localhost:3000/api/normes-hse/${this.editId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await axios.post("http://localhost:3000/api/normes-hse", formData, { headers: { "Content-Type": "multipart/form-data" } });
        }
        this.getNormes();
        this.fermerModal();
      } catch (error) { console.error(error); alert("Erreur lors de l'enregistrement de la norme."); }
    },
    async supprimerNorme(id) {
      if (confirm("Voulez-vous vraiment supprimer cette norme ?")) {
        try {
          await axios.delete(`http://localhost:3000/api/normes-hse/${id}`);
          this.normes = this.normes.filter(n => n.id !== id);
        } catch (error) { console.error(error); alert("Erreur lors de la suppression."); }
      }
    }
  }
};
</script>

<style scoped>
.page-title {
  font-weight: 700;
  color: #1f2937;
}
.input-group .form-control:focus {
  box-shadow: none;
  border-color: #0d6efd;
}
.input-group-text {
  border: none;
  background-color: #fff;
}
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.transition-hover {
  transition: all 0.3s ease-in-out;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid #ccc;
}
.status-indicator.active { background-color: #28a745; }
.status-indicator.obsolete { background-color: #dc3545; }

.file-info {
  transition: all 0.2s;
}
.file-info:hover {
  background-color: #f8f9fa;
}

.card-footer .btn {
  transition: all 0.2s;
}
.card-footer .btn:hover {
  transform: scale(1.05);
}

input.form-control:focus, select.form-select:focus, textarea.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(13,110,253,.25);
}

.bg-gradient-primary {
  background: linear-gradient(90deg, #0d6efd, #6610f2);
}

.empty-state i {
  color: #adb5bd;
}

.btn-sm {
  transition: all 0.2s ease-in-out;
}
.btn-sm:hover {
  transform: scale(1.05);
}
</style>