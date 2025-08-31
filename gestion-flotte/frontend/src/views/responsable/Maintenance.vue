<template>
  <div class="sh-page">
    <!-- Header -->
    <header class="sh-header">
      <h1 class="sh-title">Gestion des Interventions</h1>
      <button class="sh-btn sh-btn-outline" @click="fetchInterventions">
        <i class="fas fa-sync-alt"></i>
        Actualiser
      </button>
    </header>
    <!-- Bouton Planifier maintenance centré -->
    <div class="flex-grow-1 d-flex justify-content-center my-4">
      <button
     class="sh-btn sh-btn-outline"
        @click="ouvrirFormulaireMaintenance"
      >
        🛠️ Planifier maintenance
      </button>
    </div><!-- Popup Formulaire Maintenance -->

<!-- Popup Formulaire Maintenance -->
<div
  v-if="popupMaintenance"
  class="popup"
  @click.self="fermerFormulaireMaintenance"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modalTitle"
>
  <div class="card-maintenance shadow-lg p-4 rounded" style="max-width: 520px;">
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-danger">
      <h2 id="modalTitle" class="title-danger mb-0 fs-4 fw-bold">Planifier Maintenance</h2>
 <button @click="$emit('close')" class="btn btn-sm btn-outline-danger">
  <i class="bi bi-x-lg"></i>
</button>

    </header>

    <!-- Carte info mission + véhicule -->
    <section class="card-info mb-4 p-3 rounded border border-danger bg-light">
    <!-- Sélection du véhicule -->
<div class="mb-3">
  <label for="vehicule" class="form-label fw-semibold">Véhicule</label>
  <select
    id="vehicule"
    v-model="form.vehicule_id"
    class="form-select border-danger"
    required
  >
    <option disabled value="">-- Choisir un véhicule --</option>
    <option
      v-for="v in vehicules"
      :key="v.id"
      :value="v.id"
    >
      {{ v.marque }} - {{ v.immatriculation }}
    </option>
  </select>
</div>

    </section>



 <form @submit.prevent="submitForm" novalidate>
  <!-- Priorité -->
  <div class="mb-3">
    <label for="priorite" class="form-label fw-semibold">Priorité</label>
    <select
      id="priorite"
      v-model="form.priorite"
      required
      class="form-select border-danger"
    >




    
      <option disabled value="">-- Choisir priorité --</option>
      <option value="Urgent">Urgent</option>
      <option value="Normal">Normal</option>
    </select>
  </div>


  <!-- Type de demande -->
  <div class="mb-3">
    <label for="typeDemande" class="form-label fw-semibold">Type de demande</label>
    <select
      id="typeDemande"
      v-model="form.type_demande"
      required
      class="form-select border-danger"
    >
      <option disabled value="">-- Choisir type de demande --</option>
      <option value="achat">Achat</option>
      <option value="maintenance">Maintenance</option>
    </select>
  </div>
<!-- Coût -->
<div class="mb-3">
  <label for="cout" class="form-label fw-semibold">Coût (DZD)</label>
  <input
    type="number"
    id="cout"
    v-model.number="form.cout"
    min="0"
    step="0.01"
    class="form-control border-danger"
    placeholder="Entrez le coût en Dinar"
  />
</div>

  <!-- Formulaire Achat -->
  <div v-if="form.type_demande === 'achat'" class="card shadow-sm p-3 mb-4 rounded border border-danger bg-light">
    <h5 class="fw-semibold mb-3 text-danger">Détails de l'achat</h5>

    <!-- Délai -->
    <div class="mb-3">
      <label for="delaiAchat" class="form-label fw-semibold">Délai</label>
      <input
        type="date"
        id="delaiAchat"
        v-model="form.delai"
        required
        class="form-control border-danger"
      />
    </div>
<!-- Fournisseur -->
<div class="mb-3">
  <label for="fournisseur" class="form-label fw-semibold">Fournisseur</label>
  <input
    type="text"
    id="fournisseur"
    v-model="form.fournisseur"
    class="form-control border-danger"
    placeholder="Nom du fournisseur"
  />
</div>

    <!-- Description -->
    <div class="mb-3">
      <label for="descriptionAchat" class="form-label fw-semibold">Description</label>
      <textarea
        id="descriptionAchat"
        v-model="form.description"
        rows="3"
        class="form-control border-danger"
        placeholder="Décrire l'achat..."
      ></textarea>
    </div>

    <!-- Liste des pièces -->
    <div>
      <h6 class="fw-semibold mb-3">Pièces à acheter</h6>

      <div
        v-for="(piece, index) in form.pieces"
        :key="index"
        class="border rounded p-3 mb-3 bg-white"
      >
        <div class="mb-2">
          <strong>Nom :</strong> {{ piece.nom_piece }}
        </div>
        <div class="mb-2">
          <strong>Quantité :</strong> {{ piece.quantite }}
        </div>
        <div class="mb-2">
          <strong>Prix unitaire :</strong> {{ piece.prix_unitaire.toFixed(2) }} €
        </div>

        <button
          type="button"
          class="btn btn-danger btn-sm"
          @click="retirerPiece(index)"
        >
          Supprimer cette pièce
        </button>
      </div>

      <!-- Bouton Ajouter une pièce -->
      <button
        type="button"
        class="btn btn-primary btn-sm"
        @click="ouvrirPopupPiece"
      >
        + Ajouter une pièce
      </button>
    </div>
  </div>

  <!-- Formulaire Maintenance -->
  <div v-if="form.type_demande === 'maintenance'" class="card shadow-sm p-3 mb-4 rounded border border-danger bg-light">
    <h5 class="fw-semibold mb-3 text-danger">Détails de la maintenance</h5>

    <!-- Type de maintenance (Curative / Préventive) -->
    <div class="mb-3">
      <label for="typeMaintenance" class="form-label fw-semibold">Type de maintenance</label>
      <select
        id="typeMaintenance"
        v-model="form.type_maintenance"
        required
        class="form-select border-danger"
        @change="form.categorie = ''"
      >
        <option disabled value="">-- Choisir type --</option>
        <option value="Curative">Curative</option>
        <option value="Préventive">Préventive</option>
      </select>
    </div>

    <!-- Catégorie (selon type choisi) -->
    <div class="mb-3" v-if="form.type_maintenance">
      <label for="categorieMaintenance" class="form-label fw-semibold">Catégorie</label>
      <select
        id="categorieMaintenance"
        v-model="form.categorie"
        required
        class="form-select border-danger"
      >
        <option disabled value="">-- Choisir catégorie --</option>
        <option
          v-for="cat in categoriesMaintenance"
          :key="cat"
          :value="cat"
        >
          {{ cat }}
        </option>
      </select>
    </div>

    <!-- Durée -->
    <div class="mb-3">
      <label for="dureeMaintenance" class="form-label fw-semibold">Durée (heures)</label>
      <input
        type="number"
        id="dureeMaintenance"
        v-model.number="form.duree"
        min="0"
        class="form-control border-danger"
        placeholder="Entrez la durée"
        required
      />
    </div>

    <!-- Observation -->
    <div class="mb-3">
      <label for="observationMaintenance" class="form-label fw-semibold">Observation</label>
      <textarea
        id="observationMaintenance"
        v-model="form.observation"
        rows="3"
        class="form-control border-danger"
        placeholder="Ajouter une observation..."
      ></textarea>
    </div>

  </div>
  <!-- Boutons Annuler / Enregistrer / Retour -->
  <div class="d-flex justify-content-between gap-3 mt-4">
    
    <div>
      <button type="button" class="btn btn-outline-secondary fw-semibold" @click="resetForm">
        Annuler
      </button>
     <button type="button" class="btn btn-primary fw-bold" @click="submitFormAlt">
  Enregistrer 
</button>

    </div>
  </div>
</form>


  <!-- Popup Ajouter une pièce -->
  <div
    v-if="popupPiece"
    class="popup bg-dark bg-opacity-50 fixed top-0 left-0 w-full h-full flex justify-center items-center"
    @click.self="fermerPopupPiece"
    style="z-index: 1050;"
  >
    <div class="bg-white p-4 rounded shadow-lg" style="min-width: 320px;">
      <h5 class="mb-3">Ajouter une pièce</h5>

      <div class="mb-3">
        <label for="nomPiecePopup" class="form-label fw-semibold">Nom de la pièce</label>
        <input
          id="nomPiecePopup"
          type="text"
          v-model="pieceTmp.nom_piece"
          class="form-control border-danger"
          placeholder="Nom de la pièce"
          required
        />
      </div>

      <div class="mb-3">
        <label for="quantitePiecePopup" class="form-label fw-semibold">Quantité</label>
        <input
          id="quantitePiecePopup"
          type="number"
          v-model.number="pieceTmp.quantite"
          min="1"
          class="form-control border-danger"
          required
        />
      </div>

      <div class="mb-3">
        <label for="prixUnitairePiecePopup" class="form-label fw-semibold">Prix unitaire (€)</label>
        <input
          id="prixUnitairePiecePopup"
          type="number"
          v-model.number="pieceTmp.prix_unitaire"
          min="0"
          step="0.01"
          class="form-control border-danger"
          required
        />
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" @click="fermerPopupPiece" type="button">Annuler</button>
        <button class="btn btn-primary" @click="validerPiece" type="button">OK</button>
      </div>
    </div>
  </div>
  </div>
</div>






    <!-- Tableau -->
    <section class="sh-card">
      <div class="sh-card__header">
        <h2 class="sh-card__title">Liste des interventions</h2>
      </div>

      <div class="sh-table-wrapper">
        <table class="sh-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Véhicule</th>
              <th>Date Création</th>
              <th>Type</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in interventions" :key="it.id">
              <td class="mono">#{{ it.id }}</td>
              <td>
                <template v-if="it.vehicule">
                  <div class="sh-veh">
                    <div class="sh-veh__main">
                      {{ it.vehicule.marque || '-' }} {{ it.vehicule.modele || '-' }}
                    </div>
                    <div class="sh-veh__sub">
                      <span class="sh-tag">{{ it.vehicule.type || '-' }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>-</template>
              </td>
              <td>{{ formatDate(it.created_at) }}</td>
              <td>
                <span class="sh-badge sh-badge--type">{{ it.type_demande }}</span>
              </td>
              <td>
                <span
                  class="sh-badge"
                  :class="priorityClass(it.priorite)"
                >
                  {{ it.priorite }}
                </span>
              </td>
              <td>
                <span
                  class="sh-badge"
                  :class="statusClass(it.statut)"
                >
                  {{ it.statut }}
                </span>
              </td>
              <td>
                <button class="sh-btn sh-btn-primary" @click="viewDetails(it)">
                  <i class="fas fa-eye"></i> Détails
                </button>
                 <button class="sh-btn sh-btn-outline" @click="exportPDF(it)">
    <i class="fas fa-file-pdf"></i> Exporter
  </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal Détails -->
    <div v-if="selectedIntervention" class="sh-modal" @click.self="selectedIntervention = null">
      <div class="sh-modal__content">
        <!-- En-tête modal -->
        <div class="sh-modal__header">
          <div class="sh-modal__titleblock">
            <h3 class="sh-modal__title">
              Intervention #{{ selectedIntervention.id }}
            </h3>
            <span
              class="sh-badge"
              :class="statusClass(selectedIntervention.statut)"
            >
              {{ selectedIntervention.statut }}
            </span>
          </div>
          <button class="sh-modal__close" @click="selectedIntervention = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Bandeau véhicule -->
        <div v-if="selectedIntervention.vehicule" class="sh-vehcard">
          <div class="sh-vehcard__icon">🚗</div>
          <div class="sh-vehcard__body">
            <div class="sh-vehcard__title">
              {{ selectedIntervention.vehicule.marque || '-' }}
              {{ selectedIntervention.vehicule.modele || '-' }}
            </div>
            <div class="sh-vehcard__meta">
              <span class="sh-tag">
                {{ selectedIntervention.vehicule.type || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Corps modal -->
        <div class="sh-modal__body">
          <div class="sh-grid">
            <!-- Infos principales -->
            <div class="sh-infocard">
              <div class="sh-infocard__head">
                <span>📌</span>
                <h4>Informations principales</h4>
              </div>
              <div class="sh-infocard__body">
                <div class="sh-kv">
                  <span>Type</span>
                  <strong>{{ selectedIntervention.type_demande }}</strong>
                </div>
                <div class="sh-kv">
                  <span>Priorité</span>
                  <strong>{{ selectedIntervention.priorite }}</strong>
                </div>
                <div class="sh-kv">
                  <span>Coût estimé</span>
                  <strong>{{ selectedIntervention.cout || 0 }} €</strong>
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div class="sh-infocard">
              <div class="sh-infocard__head">
                <span>📅</span>
                <h4>Dates</h4>
              </div>
              <div class="sh-infocard__body">
                <div class="sh-kv">
                  <span>Créée le</span>
                  <strong>{{ formatDate(selectedIntervention.created_at) }}</strong>
                </div>
                <div class="sh-kv">
                  <span>Prévue le</span>
                  <strong>{{ formatDate(selectedIntervention.date_prevue) }}</strong>
                </div>
                <div v-if="selectedIntervention.date_en_cours" class="sh-kv">
                  <span>Débutée le</span>
                  <strong>{{ formatDate(selectedIntervention.date_en_cours) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div v-if="selectedIntervention.maintenance" class="sh-infocard">
            <div class="sh-infocard__head">
              <span>🛠️</span>
              <h4>Maintenance</h4>
            </div>
            <div class="sh-infocard__body">
              <div class="sh-kv">
                <span>Type</span>
                <strong>{{ selectedIntervention.maintenance.type_principal }}</strong>
              </div>
              <div class="sh-kv">
                <span>Catégorie</span>
                <strong>{{ selectedIntervention.maintenance.categorie }}</strong>
              </div>
              <div class="sh-kv">
                <span>Durée</span>
                <strong>{{ selectedIntervention.maintenance.duree }} h</strong>
              </div>
              <div class="sh-kv">
                <span>Observation</span>
                <strong>{{ selectedIntervention.maintenance.observation || "Aucune" }}</strong>
              </div>
            </div>
          </div>

          <!-- Achat / Fournisseur -->
          <div v-if="selectedIntervention.achat" class="sh-infocard">
            <div class="sh-infocard__head">
              <span>📦</span>
              <h4>Achat / Fournisseur</h4>
            </div>
            <div class="sh-infocard__body">
              <div class="sh-kv">
                <span>Fournisseur</span>
                <strong>{{ selectedIntervention.achat.fournisseur }}</strong>
              </div>
              <div class="sh-kv">
                <span>Délai</span>
                <strong>{{ formatDate(selectedIntervention.achat.delai) }}</strong>
              </div>
              <div class="sh-kv">
                <span>Description</span>
                <strong>{{ selectedIntervention.achat.description }}</strong>
              </div>
            </div>
          </div>

          <!-- Pièces -->
          <div v-if="selectedIntervention.achat && selectedIntervention.achat.pieces && selectedIntervention.achat.pieces.length" class="sh-infocard">
            <div class="sh-infocard__head">
              <span>🔧</span>
              <h4>Pièces détachées</h4>
            </div>
            <div class="sh-table-wrapper">
              <table class="sh-table sh-table--compact">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Qté</th>
                    <th>Prix U.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in selectedIntervention.achat.pieces" :key="p.id">
                    <td>{{ p.nom_piece }}</td>
                    <td class="mono">{{ p.quantite }}</td>
                    <td class="mono">{{ parseFloat(p.prix_unitaire).toFixed(2) }} €</td>
                    <td class="mono">{{ (p.quantite * parseFloat(p.prix_unitaire)).toFixed(2) }} €</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="right"><strong>Total pièces</strong></td>
                    <td class="mono"><strong>{{ calculateTotalParts(selectedIntervention.achat.pieces).toFixed(2) }} €</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Pied de modal -->
        <div class="sh-modal__footer">
          <button class="sh-btn" @click="selectedIntervention = null">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "InterventionsPamphlet",
  data() {
    return {
      
      vehicules: [], // ✅ liste des véhicules depuis API
       form: {
            vehicule_id: "", // ✅ id du véhicule choisi
              mission_id: null,
        priorite: "",
        type_demande: "",
        delai: "",
        description: "",
        pieces: [],
      }, pieceTmp: {
        nom_piece: "",
        quantite: 1,
        prix_unitaire: 0,
      },
         popupPiece: false,
      interventions: [],
      selectedIntervention: null,
 categoriesPreventive: [
        'Vidange',
        'Révision périodique',
        'Filtre à air',
        'Filtre à huile',
        'Contrôle technique',
        'Inspection HSE',
        'Autre'
      ],
      categoriesCurative: [
        'Freins',
        'Pneumatiques',
        'Moteur',
        'Boîte de vitesses',
        'Électrique',
        'Suspension',
        'Refroidissement',
        'Injection',
        'Échappement',
        'Transmission',
        'Embrayage',
        'Autre'
      ],
 selectedPlan: null,
    popupMaintenance: false,
      formMaintenance: {
      id_vehicule: '',
      type_principal: '',
      categorie: '',
      date_intervention: '',
      description: ''
    },
    };
  },
  computed: { 


      categoriesMaintenance() {
      if (this.form.type_maintenance === 'Curative') {
        return this.categoriesCurative;
      } else if (this.form.type_maintenance === 'Préventive') {
        return this.categoriesPreventive;
      }
      return [];
    }
  },
  methods: { 
    
      resetForm() {
      this.form = {
      priorite: '',
      type_demande: '',
      type_maintenance: '',
      categorie: '',
      duree: 0,
      observation: '',
      delai: '',
      description: '',
      pieces: [],
    }},

 async fetchVehicules() {
      try {
        const res = await axios.get("http://localhost:3000/api/vehicules");
        this.vehicules = res.data;
      } catch (error) {
        console.error("Erreur récupération véhicules :", error);
      }
    },




      retourPagePrincipale() {
      alert("Retour à la page principale (à remplacer par ta navigation).");
    },
     ouvrirPopupPiece() {
      // Reset temporaire
      this.pieceTmp = {
        nom_piece: "",
        quantite: 1,
        prix_unitaire: 0,
      };
      this.popupPiece = true;
    },     
     fermerPopupPiece() {
      this.popupPiece = false;
    },  
 fermerFormulaireMaintenance() {
    this.popupMaintenance = false; // ceci ferme et supprime le popup
  },
     validerPiece() {
      if (!this.pieceTmp.nom_piece || this.pieceTmp.quantite < 1 || this.pieceTmp.prix_unitaire < 0) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
      }
      this.form.pieces.push({ ...this.pieceTmp });
      this.fermerPopupPiece();
    },
    retirerPiece(index) {
      this.form.pieces.splice(index, 1);
    },
resetCategorie() {
      this.form.categorie = ''; // reset category when type changes
    }, 

  envoyerMaintenance() {
    axios.post("http://localhost:3000/api/maintenance", this.formMaintenance)
      .then(() => {
        alert("Maintenance planifiée avec succès !");
        this.fermerFormulaireMaintenance();
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de la planification");
      });
  },


    async submitFormAlt() {
  try {
    
     if (!this.form.vehicule_id) {
          alert("Veuillez sélectionner un véhicule !");
          return;
        }

    // 2️⃣ Vérifications simples
    if (!this.form.priorite) {
      alert("Le champ Priorité est obligatoire !");
      return;
    }
    if (!this.form.type_demande) {
      alert("Le champ Type de demande est obligatoire !");
      return;
    }

    // ✅ Préparer data
        let data = {
          vehicule_id: this.form.vehicule_id,
          priorite: this.form.priorite,
          type_demande: this.form.type_demande,
          cout: this.form.cout,
        };

    if (this.form.type_demande === 'achat') {
      data.delai = this.form.delai;
      data.description = this.form.description;
      data.fournisseur = this.form.fournisseur;
      data.pieces = this.form.pieces;
    } else if (this.form.type_demande === 'maintenance') {
      data.type_principal = this.form.type_maintenance;
      data.categorie = this.form.categorie;
      data.duree = this.form.duree;
      data.observation = this.form.observation;
    }

    // 4️⃣ Envoi de l'intervention
    await axios.post('http://localhost:3000/api/interventions', data);

    alert("Intervention enregistrée avec succès !");
    this.resetForm();

  } catch (error) {
    alert("Erreur lors de l’enregistrement : " + (error.response?.data?.message || error.message));
    console.error(error);
  }
}
,
  
    
   ouvrirFormulaireMaintenance() {
 
  this.popupMaintenance = true;
},
    
    
    
    async exportPDF(intervention) {
  try {
    // 🔹 Vérifier que l'intervention existe et a un ID
    if (!intervention || !intervention.id) {
      alert("Erreur : intervention non définie ou ID manquant !");
      console.error("Intervention invalide :", intervention);
      return;
    }

    // 🔹 Vérifier que le type de demande existe
    const type = intervention.type_demande;
    if (!type || (type !== "achat" && type !== "maintenance")) {
      alert("Erreur : type de demande invalide !");
      console.error("Type de demande invalide :", intervention);
      return;
    }

    console.log("Export PDF pour l'intervention :", intervention.id, "Type :", type);

    // 1️⃣ Génération + téléchargement du PDF
    const res = await axios.get(
      `http://localhost:3000/api/documents/export/${type}/${intervention.id}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_demande_${intervention.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
    window.URL.revokeObjectURL(url);

    // 2️⃣ Création du document dans la base via le backend
    const postData = {
      intervention_id: intervention.id,
      type
    };

    const response = await axios.post(
      "http://localhost:3000/api/documents/from-intervention",
      postData
    );

    if (response.status === 201) {
      alert("Document exporté et enregistré avec succès ✅");
    } else {
      console.warn("Document créé mais réponse inattendue :", response);
      alert("Document exporté, mais problème lors de l'enregistrement ❌");
    }

  } catch (err) {
    console.error("Erreur export PDF :", err);
    alert("Erreur lors de l'export ou enregistrement du document ❌");
  }
}
,
    async fetchInterventions() {
      const res = await axios.get("http://localhost:3000/api/interventions");
      this.interventions = res.data;
    },
    async viewDetails(intervention) {
      const res = await axios.get(`http://localhost:3000/api/interventions/${intervention.id}/details-debug`);
      this.selectedIntervention = res.data;
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("fr-FR") : "-";
    },
    calculateTotalParts(pieces) {
      return pieces.reduce((sum, p) => sum + (p.quantite * parseFloat(p.prix_unitaire)), 0);
    },
    // Helpers pour les classes
    statusClass(statut) {
      const s = (statut || "").toLowerCase();
      return {
        "sh-badge--status-await": s.includes("attente"),
        "sh-badge--status-run": s.includes("cours"),
        "sh-badge--status-done": s.includes("termin"),
      };
    },
    priorityClass(p) {
      const s = (p || "").toLowerCase();
      return {
        "sh-badge--prio-high": s.includes("urgent") || s.includes("haute"),
        "sh-badge--prio-mid": s.includes("normal") || s.includes("normale"),
        "sh-badge--prio-low": s.includes("basse"),
      };
    },
  },
  mounted() {
    this.fetchInterventions();
      this.fetchVehicules(); // ✅ Charger les véhicules au montage
  },
};
</script>

<!-- IMPORTANT : PAS DE scoped ICI -->
<style>
:root{
  --sh-orange: #ff7b00;
  --sh-orange-600: #f06d00;
  --sh-orange-100: #ffe7d2;

  --sh-black: #681515ff;
  --sh-gray-900:#2c2c2c;
  --sh-gray-700:#4a4a4a;
  --sh-gray-400:#bdbdbd;
  --sh-gray-100:#f5f6f7;

  --sh-white:#ffffff;
  --sh-shadow: 0 10px 30px rgba(0,0,0,.08);
  --sh-radius: 12px;
  --sh-radius-sm: 8px;
}
/* ✅ Style global de la fenêtre */
.modal-header h2 {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; /* police moderne et lisible */
  font-size: 1.4rem; /* taille claire mais pas trop grande */
  font-weight: 600; /* semi-gras */
  color: #333; /* gris foncé pour meilleure lecture */
  letter-spacing: 0.5px; /* petit espacement des lettres */
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

/* ✅ Badge de statut */
.status-badge {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}

/* ✅ Différenciation par statut */
.status-en_attente {
  background-color: #ffcc00;
  color: #000;
}
.status-en_cours {
  background-color: #007bff;
  color: #fff;
}
.status-terminee {
  background-color: #28a745;
  color: #fff;
}

/* ✅ Bouton fermer */
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  color: #555;
  cursor: pointer;
  transition: color 0.2s ease;
}
.btn-close:hover {
  color: #1a1919ff;
}
/* Page */
.sh-page{padding:24px;background:var(--sh-gray-100);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--sh-black);}

/* Header */
.sh-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.sh-title{font-size:22px;font-weight:700;color:var(--sh-orange);}

/* Cards */
.sh-card{background:var(--sh-white);border-radius:var(--sh-radius);box-shadow:var(--sh-shadow);overflow:hidden;}
.sh-card__header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--sh-gray-100);}
.sh-card__title{font-weight:650;color:var(--sh-gray-900);}

/* Table */
.sh-table-wrapper{width:100%;overflow:auto;}
.sh-table{width:100%;border-collapse:collapse;font-size:14px;}
.sh-table thead th{background:linear-gradient(90deg,var(--sh-orange),var(--sh-orange-600));color:#fff;text-align:left;padding:12px;border:0;position:sticky;top:0;}
.sh-table tbody td{padding:12px;border-bottom:1px solid #eee;}
.sh-table tbody tr:hover{background:var(--sh-orange-100);}

/* Vehicule cell */
.sh-veh__main{font-weight:600;}
.sh-veh__sub{margin-top:4px;}

/* Tags & badges */
.sh-tag{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:2px 8px;border-radius:999px;background:#efefef;color:#333;}
.sh-badge{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:12px;padding:6px 10px;border-radius:999px;background:#ececec;color:#2b2b2b;}
.sh-badge--type{background:var(--sh-orange-100);color:var(--sh-orange-600);}
.sh-badge--prio-high{background:#ffe1e1;color:#b10000;}
.sh-badge--prio-mid{background:#fff3cd;color:#7a4c00;}
.sh-badge--prio-low{background:#d1ecf1;color:#0c5460;}
.sh-badge--status-await{background:#f3f4f6;color:#444;}
.sh-badge--status-run{background:#fff3cd;color:#7a4c00;}
.sh-badge--status-done{background:#d4edda;color:#155724;}

/* Buttons */
.sh-btn{display:inline-flex;align-items:center;gap:8px;border:none;background:#e9e9e9;color:#222;padding:8px 12px;border-radius:10px;cursor:pointer;transition:transform .04s ease, filter .2s ease;}
.sh-btn:hover{filter:brightness(.96);}
.sh-btn:active{transform:translateY(1px);}
.sh-btn-primary{background:var(--sh-orange);color:#fff;}
.sh-btn-outline{background:#fff;border:1px solid var(--sh-orange);color:var(--sh-orange);}

/* Modal */
.sh-modal{position:fixed;inset:0;background:rgba(0, 0, 0, 0.8);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000;}
.sh-modal__content{background:#fff;border-radius:16px;box-shadow:var(--sh-shadow);width:min(980px,96vw);max-height:92vh;display:flex;flex-direction:column;overflow:hidden;}
.sh-modal__header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:#1f1f1f;color:#fff;}
.sh-modal__titleblock{display:flex;align-items:center;gap:12px;}
.sh-modal__title{margin:0;font-size:18px;font-weight:700;}
.sh-modal__close{border:none;background:transparent;color:#fff;font-size:20px;cursor:pointer;}
.sh-modal__body{padding:18px;overflow:auto;display:flex;flex-direction:column;gap:16px;}
.sh-modal__footer{padding:14px 18px;background:#fafafa;border-top:1px solid #000000ff;text-align:right}

/* Vehicule banner */
.sh-vehcard{display:flex;gap:12px;align-items:center;background:linear-gradient(90deg,var(--sh-orange),#ff9740);color:#fff;margin:14px 18px 0;border-radius:12px;padding:12px 14px;}
.sh-vehcard__icon{font-size:22px;}
.sh-vehcard__title{font-size:16px;font-weight:800;}
.sh-vehcard__meta{margin-top:2px}

/* Info cards */
.sh-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media (max-width:900px){.sh-grid{grid-template-columns:1fr;}}
.sh-infocard{background:#fff;border:1px solid #000000ff;border-radius:12px;padding:14px;}
.sh-infocard__head{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:var(--sh-orange);}
.sh-infocard__head h4{margin:0;font-weight:800;}
.sh-kv{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed #eee;}
.sh-kv:last-child{border-bottom:0;}
.sh-kv span{color:#6a6a6a;}
.mono{font-variant-numeric:tabular-nums;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
.right{text-align:right;}

.popup {
  position: fixed; /* pour qu’elle reste fixée sur l’écran */
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* fond sombre transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* au-dessus de la modale */
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}.popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(3px);
}

.popup-content {
  background: #F4F6F7; /* blanc cassé */
  border-radius: 12px;
  padding: 25px 30px;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  animation: popupShow 0.3s ease forwards;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

@keyframes popupShow {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-content h5 {
  margin-bottom: 20px;
  font-weight: 700;
  color: #00593F; /* vert foncé Sonatrach */
  text-align: center;
  font-size: 1.4rem;
  letter-spacing: 0.03em;
}

.popup-content select.form-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.8px solid #00875A; /* vert moyen */
  font-size: 1rem;
  transition: border-color 0.3s;
  outline: none;
  cursor: pointer;
  color: #003153; /* bleu foncé texte */
  background-color: white;
}

.popup-content select.form-select:focus {
  border-color: #003153; /* bleu foncé */
  box-shadow: 0 0 8px #003153;
}

.popup-content .mt-2 {
  margin-top: 22px;
  display: flex;
  justify-content: space-between;
}

.popup-content button {
  width: 48%;
  font-weight: 600;
  padding: 8px 0;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  color: white;
}

.popup-content button.btn-primary {
  background-color: #00593F; /* vert foncé */
}

.popup-content button.btn-primary:hover {
  background-color: #003D2E; /* vert encore plus foncé */
}

.popup-content button.btn-secondary {
  background-color: #666666; /* gris neutre */
}

.popup-content button.btn-secondary:hover {
  background-color: #444444;
}
.popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-content {
  background: white;
  padding: 20px;
  border-radius: 6px;
  width: 400px;
}
/* Popup */
.popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1080;
}

.popup-content {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.3s ease forwards;
  outline: none;
  border-radius: 0.5rem;
  padding: 2.5rem 3rem;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Bouton close */
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

/* Form labels */
.form-label {
  letter-spacing: 0.02em;
}
.popup {
  position: fixed; /* pour qu’elle reste fixée sur l’écran */
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* fond sombre transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* au-dessus de la modale */
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}.popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(3px);
}

.popup-content {
  background: #F4F6F7; /* blanc cassé */
  border-radius: 12px;
  padding: 25px 30px;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  animation: popupShow 0.3s ease forwards;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

@keyframes popupShow {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-content h5 {
  margin-bottom: 20px;
  font-weight: 700;
  color: #00593F; /* vert foncé Sonatrach */
  text-align: center;
  font-size: 1.4rem;
  letter-spacing: 0.03em;
}

.popup-content select.form-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.8px solid #00875A; /* vert moyen */
  font-size: 1rem;
  transition: border-color 0.3s;
  outline: none;
  cursor: pointer;
  color: #003153; /* bleu foncé texte */
  background-color: white;
}

.popup-content select.form-select:focus {
  border-color: #003153; /* bleu foncé */
  box-shadow: 0 0 8px #003153;
}

.popup-content .mt-2 {
  margin-top: 22px;
  display: flex;
  justify-content: space-between;
}

.popup-content button {
  width: 48%;
  font-weight: 600;
  padding: 8px 0;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  color: white;
}

.popup-content button.btn-primary {
  background-color: #00593F; /* vert foncé */
}

.popup-content button.btn-primary:hover {
  background-color: #003D2E; /* vert encore plus foncé */
}

.popup-content button.btn-secondary {
  background-color: #666666; /* gris neutre */
}

.popup-content button.btn-secondary:hover {
  background-color: #444444;
}
.popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-content {
  background: white;
  padding: 20px;
  border-radius: 6px;
  width: 400px;
}

/* Couleurs Sonatrach personnalisées */
.btn-sonatrach-danger {
  background-color: #d72631;
  border-color: #d72631;
  transition: background-color 0.3s ease;
}
.btn-sonatrach-danger:hover {
  background-color: #b31d27;
  border-color: #b31d27;
  color: #fff;
}

.text-sonatrach-blue {
  color: #003366;
}

.text-sonatrach-green {
  color: #2a9d8f;
}

.bg-sonatrach-light {
  background-color: #f0f4f8;
}

.border-sonatrach-green {
  border-color: #2a9d8f !important;
}

.btn-sonatrach-green {
  background-color: #2a9d8f;
  border-color: #2a9d8f;
  transition: background-color 0.3s ease;
}
.btn-sonatrach-green:hover {
  background-color: #238377;
  border-color: #238377;
  color: #fff;
}

/* Popup */
.popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1080;
}

.popup-content {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.3s ease forwards;
  outline: none;
  border-radius: 0.5rem;
  padding: 2.5rem 3rem;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Bouton close */
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

/* Form labels */
.form-label {
  letter-spacing: 0.02em;
}

/* Footer boutons */
footer button {
  min-width: 100px;
  padding: 0.5rem 1.5rem;
}

/* Ombrage léger sur inputs */
.form-control,
.form-select,
textarea.form-control {
  box-shadow: 0 0 6px rgba(42, 157, 143, 0.15);
  transition: box-shadow 0.3s ease;
}

.form-control:focus,
.form-select:focus,
textarea.form-control:focus {
  box-shadow: 0 0 10px rgba(42, 157, 143, 0.5);
  border-color: #2a9d8f;
  outline: none;
}
/* Conteneur bouton centré */
.button-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

/* Bouton rouge Sonatrach */
.btn-rouge {
  background-color: #d43228; /* rouge vif */
  border: 2px solid #b3221f;
  color: #fff;
  padding: 0.6rem 1.5rem;
  font-weight: 700;
  border-radius: 10px;
  font-size: 1.15rem;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.btn-rouge:hover,
.btn-rouge:focus {
  background-color: #b3221f;
  border-color: #8c1a18;
  outline: none;
}

/* Overlay popup : fond semi-transparent */
.popup {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
}

/* Carte blanche moderne */
.card-maintenance {
  background-color: #fff; /* fond blanc */
  color: #222; /* texte noir foncé */
  border-radius: 12px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 8px 25px rgba(255, 102, 0, 0.4); /* ombre orange */
  padding: 2rem 2.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeInScale 0.3s ease forwards;
}

/* Header avec titre orange + bouton fermer */
.card-maintenance header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #ff6600;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.title-orange {
  color: #ff6600;
  font-weight: 700;
  font-size: 1.5rem;
}

.btn-close-white {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: #444;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-close-white:hover {
  color: #ff6600;
}

/* Section infos mission */
.card-info {
  background-color: #fff7e6; /* fond clair orange pâle */
  border: 2px solid #ff6600; /* bordure orange */
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.card-info h3 {
  color: #ff6600;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* Liste définition */
dl.row {
  margin-bottom: 0;
}

dt.col-sm-4 {
  font-weight: 700;
  color: #ff6600;
}

dd.col-sm-8 {
  margin-left: 0;
  color: #444;
}

/* Labels */
.form-label {
  font-weight: 600;
  color: #222;
  user-select: none;
}

/* Inputs, selects, textarea - style clair */
.form-control-dark,
.form-select-dark {
  background-color: #fff;
  border: 2px solid #ff6600;
  color: #222;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-control-dark::placeholder {
  color: #999;
  font-style: italic;
}

.form-control-dark:focus,
.form-select-dark:focus {
  outline: none;
  border-color: #28a745; /* vert Sonatrach */
  box-shadow: 0 0 10px #28a745;
  background-color: #fff;
  color: #222;
}

/* Boutons verts Sonatrach */
.btn-vert {
  background-color: #28a745;
  border: 2px solid #28a745;
  color: #fff;
  padding: 0.55rem 1.4rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  font-size: 1.05rem;
}

.btn-vert:hover,
.btn-vert:focus {
  background-color: #218838;
  border-color: #218838;
  outline: none;
}

/* Bouton annuler gris clair */
.btn-outline-secondary {
  background: transparent;
  border: 2px solid #777;
  color: #555;
  font-weight: 700;
  padding: 0.5rem 1.3rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn-outline-secondary:hover {
  background-color: #555;
  color: #fff;
  outline: none;
}

/* Footer boutons alignés */
footer.d-flex.justify-content-end.gap-3 {
  margin-top: 1.5rem;
}

/* Animation */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
  /* Popup Overlay */
  .popup {
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 1rem;
  }

  /* Popup content */
  .popup-content {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  }

  /* Card maintenance */
  .card-maintenance {
    background-color: #fff;
    border-radius: 12px;
    max-width: 520px;
    width: 100%;
    box-shadow: 0 8px 25px rgba(255, 69, 0, 0.4);
    padding: 2rem 2.5rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-height: 90vh;
    overflow-y: auto;
    animation: fadeInScale 0.3s ease forwards;
  }

  /* Title and borders in Sonatrach colors */
  .border-danger {
    border-color: #d43228 !important;
  }

  .text-danger {
    color: #d43228 !important;
  }

  /* Buttons */
  .btn-danger {
    background-color: #d43228;
    border-color: #b3221f;
    color: #fff;
  }

  .btn-danger:hover,
  .btn-danger:focus {
    background-color: #b3221f;
    border-color: #8c1a18;
    color: #fff;
  }

  .btn-success {
    background-color: #28a745;
    border-color: #218838;
    color: #fff;
  }

  .btn-success:hover,
  .btn-success:focus {
    background-color: #218838;
    border-color: #1e7e34;
    color: #fff;
  }

  .btn-warning {
    background-color: #ffc107;
    border-color: #ffca2c;
    color: #212529;
  }

  .btn-warning:hover,
  .btn-warning:focus {
    background-color: #ffca2c;
    border-color: #ffc107;
    color: #212529;
  }

  /* Form controls */
  .form-control,
  .form-select {
    border-radius: 8px;
    border: 2px solid #d43228;
    font-weight: 600;
    color: #222;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .form-control::placeholder {
    color: #999;
  }

  .form-control:focus,
  .form-select:focus {
    border-color: #28a745;
    box-shadow: 0 0 8px #28a745;
    outline: none;
  }

  /* Modal header */
  .modal-header h3 i {
    color: #d43228;
  }

  /* Animate popup */
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
