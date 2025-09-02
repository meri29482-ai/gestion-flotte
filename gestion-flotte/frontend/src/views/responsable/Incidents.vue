<template>
  <div class="signalements-container">
    <!-- Header -->
    <div class="header-container">
      <div class="title-container">
        <i class="icon-flag"></i>
        <h1>Gestion des Signalements</h1>
      </div>
      <div class="header-info">
        <span>{{ filteredSignalements.length }} signalement(s)</span>
        <button class="btn btn-icon" title="Actualiser" @click="fetchSignalements">
          <i class="icon-refresh"></i>
        </button>
      </div>
    </div>
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





    <!-- Filtres et recherche -->
    <div class="filters-container">
      <div class="search-box">
        <i class="icon-search"></i>
        <input type="text" placeholder="Rechercher un signalement..." v-model="searchQuery">
      </div>
      <div class="filter-group">
        <select v-model="filterType">
          <option value="">Tous les types</option>
          <option value="ACCIDENT">Accident</option>
          <option value="PANNE">Panne</option>
          <option value="RETARD">Retard</option>
          <option value="AUTRE">Autre</option>
        </select>
        <select v-model="filterIntervention">
          <option value="">Intervention demandée</option>
          <option value="oui">Oui</option>
          <option value="non">Non</option>
        </select>
      </div>
    </div>

    <!-- Tableau -->
     <div class="table-container">
    <div class="table-responsive">
      <table class="signalements-table">
        <thead>
          <tr>
            <th @click="sortBy('id')" class="sortable">
              ID <i :class="sortIcon('id')"></i>
            </th>
            <th>Mission</th>
            <th>Type</th>
            <th>Chauffeur</th>
            <th class="description-col">Description</th>
            <th @click="sortBy('date_signalement')" class="sortable">
              Date <i :class="sortIcon('date_signalement')"></i>
            </th>
            <th>Intervention</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
       <tr 
  v-for="sig in filteredSignalements" 
  :key="sig.id"
  :class="{
    'highlight-row': sig.mission_continue.toLowerCase() === 'non',
    'green-row': sig.mission_continue.toLowerCase() === 'oui' 
                 && (sig.solution_enregistree == 1 || sig.solution_enregistree === true)
  }"
>


            <td class="id-cell">{{ sig.id }}</td>
            <td class="mission-cell">
              {{ sig.mission && sig.mission.demande ? sig.mission.demande.n_ordre : "-" }}
            </td>
            <td>
              <span class="type-badge" :class="getTypeClass(sig.type)">
                {{ getTypeLabel(sig.type) }}
              </span>
            </td>
            <td>
              {{ sig.mission.chauffeur && sig.mission.chauffeur.utilisateur 
                ? sig.mission.chauffeur.utilisateur.nom + " " + sig.mission.chauffeur.utilisateur.prenom 
                : "-" }}
            </td>
            <td class="description-cell">
              <div class="description-text" :title="sig.description || '-'">
                {{ truncateText(sig.description, 50) || "-" }}
              </div>
            </td>
            <td class="date-cell">{{ formatDate(sig.date_signalement) }}</td>
            <td>
              <span
                class="intervention-badge"
                :class="sig.intervention_demandee === 'oui' ? 'intervention-yes' : 'intervention-no'"
              >
                {{ sig.intervention_demandee === 'oui' ? 'Oui' : 'Non' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn btn-icon btn-details" @click="voirDetails(sig)" title="Voir détails">
                <i class="icon-eye"></i>
              </button>

          <!-- Bouton Solution ou badge -->
<div v-if="!sig.solutionEnregistree && sig.mission_continue === 'non'">
  <button 
    class="btn btn-icon btn-solution" 
    @click="ouvrirSolution(sig)" 
    title="Ajouter une solution"
  >
    <i class="icon-note"></i> Solution
  </button>
</div>
<div v-else-if="sig.solutionEnregistree">
  <span class="badge badge-success">✅ Solution enregistrée</span>
</div>

            </td>
          </tr>
          <tr v-if="filteredSignalements.length === 0">
            <td colspan="8" class="empty-state">
              <i class="icon-empty"></i>
              <p>Aucun signalement trouvé</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
 </div>
<!-- Modal Détails --><div v-if="showDetails" class="modal-overlay" @click.self="fermerDetails">
  <div class="modal-content modal-large">
    <!-- 🔹 En-tête -->
    <div class="modal-header">
      <h2>Détails du Signalement #{{ details.id }}</h2>
      <button class="btn-close" @click="fermerDetails">
        <i class="icon-close"></i>
      </button>
    </div>

    <!-- 🔹 Corps -->
    <div class="modal-body">
      <div class="details-grid">
        
        <!-- ID -->
        <div class="detail-item">
          <label>ID</label>
          <span>{{ details.id }}</span>
        </div>

        <!-- Mission -->
        <div class="detail-item">
          <label>Mission</label>
          <span v-if="details.mission && details.mission.demande">
            Ordre #{{ details.mission.demande.n_ordre }}
          </span>
          <span v-else>-</span>
        </div>

        <!-- Chauffeur -->
        <div class="detail-item">
          <label>Chauffeur</label>
          <span v-if="details.chauffeur && details.chauffeur.utilisateur">
            {{ details.chauffeur.utilisateur.nom }} {{ details.chauffeur.utilisateur.prenom }}
          </span>
          <span v-else>-</span>
        </div>

        <!-- Type -->
        <div class="detail-item">
          <label>Type</label>
          <span class="type-badge" :class="getTypeClass(details.type)">
            {{ getTypeLabel(details.type) }}
          </span>
        </div>

        <!-- Date signalement -->
        <div class="detail-item">
          <label>Date Signalement</label>
          <span>{{ formatDate(details.date_signalement) }}</span>
        </div>

        <!-- Intervention demandée -->
        <div class="detail-item">
          <label>Intervention demandée</label>
          <span :class="details.intervention_demandee === 'oui' ? 'intervention-yes' : 'intervention-no'">
            {{ details.intervention_demandee === 'oui' ? 'Oui' : 'Non' }}
          </span>
        </div>

        <!-- Véhicule de remplacement -->
        <div v-if="details.vehicule_remplacement" class="detail-item">
          <label>Véhicule de remplacement</label>
          <span>
            {{ details.vehicule_remplacement.matricule }} - {{ details.vehicule_remplacement.type }}
          </span>
        </div>

        <!-- Mission continue -->
        <div class="detail-item">
          <label>Mission continue</label>
          <span :class="details.mission_continue === 'oui' ? 'mission-yes' : 'mission-no'">
            {{ details.mission_continue === 'oui' ? 'Oui' : 'Non' }}
          </span>
        </div>

        <!-- Solution enregistrée -->
        <div class="detail-item">
          <label>Solution enregistrée</label>
          <span :class="details.solution_enregistree ? 'solution-yes' : 'solution-no'">
            {{ details.solution_enregistree ? 'Oui' : 'Non' }}
          </span>
        </div>

        <!-- Description -->
        <div class="detail-item full-width">
          <label>Description</label>
          <p class="description-full">{{ details.description || "-" }}</p>
        </div>

        <!-- Description intervention -->
        <div class="detail-item full-width">
          <label>Description intervention</label>
          <p class="description-full">{{ details.intervention_description || "-" }}</p>
        </div>

        <!-- Dates -->
        <div class="detail-item">
          <label>Créé le</label>
          <span>{{ formatDate(details.createdAt) }}</span>
        </div>

        <div class="detail-item">
          <label>Modifié le</label>
          <span>{{ formatDate(details.updatedAt) }}</span>
        </div>
      </div>

     <!-- 🔹 Photo associée -->
      <div v-if="details.photo" class="photo-container">
        <label>Photo associée</label>
        <div class="photo-wrapper">
          <img
            :src="getPhotoUrl(details.photo)"
            alt="Photo Signalement"
            class="detail-photo"
            @click="ouvrirPhoto(details.photo)"
          />
          <div class="photo-hover" @click="ouvrirPhoto(details.photo)">
            <i class="icon-zoom"></i>
            <span>Agrandir</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Footer -->
    <div class="modal-footer">
      <button class="btn btn-primary" @click="fermerDetails">
        Fermer
      </button>
    </div>
  </div>
</div>

    <!-- Modal Solution -->
<div v-if="showSolutionModal" class="modal-overlay" @click.self="fermerSolution">
  <div class="modal-content modal-small">
    <div class="modal-header">
      <h3>Ajouter une solution pour le signalement #{{ selectedSignalement.id }}</h3>
      <button class="btn-close" @click="fermerSolution">
        <i class="icon-close"></i>
      </button>
    </div>

    <div class="modal-body">
      <!-- Remarque -->
      <label for="solutionText">Remarque :</label>
      <textarea id="solutionText" v-model="solutionText" placeholder="Écrire votre remarque..." rows="3"></textarea>

      <!-- Véhicule disponible -->
      <label for="vehiculeSelect" class="mt-3">Véhicule disponible :</label>
      <select id="vehiculeSelect" v-model="vehiculeSelectionne">
        <option value="">-- Sélectionner un véhicule --</option>
        <option v-for="veh in vehiculesDisponibles" :key="veh.id" :value="veh.id">
          {{ veh.marque }} {{ veh.modele }} - {{ veh.type }}
        </option>
      </select>

      <!-- Message si aucun véhicule disponible -->
      <p v-if="vehiculesDisponibles.length === 0" class="text-warning mt-2">
        Aucun véhicule disponible ! Vous pouvez notifier le chauffeur.
      </p>
    </div>

    <div class="modal-footer">
      <button class="btn btn-primary" @click="envoyerSolution">
        Envoyer
      </button>
      <button class="btn btn-secondary" @click="fermerSolution">
        Annuler
      </button>
    </div>
  </div>
</div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SignalementsView",
  data() {
    return {    vehiculesDisponibles: [],   // ← tableau pour les véhicules
      vehiculeSelectionne: '',    // ← véhicule choisi dans le select
      solutionText: '',           // texte de la solution
      showSolutionModal: false,   // contrôle la modale
      selectedSignalement: {}, // Liste des véhicules disponibles
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
      signalements: [],
      showDetails: false,
      showPhoto: false,
      photoActuelle: null,
      details: {},
      searchQuery: "",
      filterType: "",
      filterIntervention: "",
      sortField: "id",
      sortDirection: "desc",
      zoomLevel: 1
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
    },

    filteredSignalements() {
      let filtered = this.signalements;
      
      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(sig => 
          sig.id.toString().includes(query) ||
          sig.mission_id.toString().includes(query) ||
          (sig.description && sig.description.toLowerCase().includes(query))
        );
      }
      
      // Filtre par type
      if (this.filterType) {
        filtered = filtered.filter(sig => sig.type === this.filterType);
      }
      
      // Filtre par intervention demandée
      if (this.filterIntervention) {
        filtered = filtered.filter(sig => sig.intervention_demandee === this.filterIntervention);
      }
      
      // Tri
      if (this.sortField) {
        filtered = filtered.sort((a, b) => {
          let modifier = 1;
          if (this.sortDirection === 'desc') modifier = -1;
          
          if (a[this.sortField] < b[this.sortField]) return -1 * modifier;
          if (a[this.sortField] > b[this.sortField]) return 1 * modifier;
          return 0;
        });
      }
      
      return filtered;
    }
  },
  methods: {
    async envoyerSolution() {
  if (!this.solutionText && !this.vehiculeSelectionne) {
    alert("Veuillez entrer une remarque ou sélectionner un véhicule !");
    return;
  }

  try {
    // 1) Préparer payload pour le signalement
    const payloadSignalement = {
      intervention_description: this.solutionText,
      mission_continue: "oui" // ✅ dès qu'une solution est enregistrée
    };

    if (this.vehiculeSelectionne) {
      payloadSignalement.vehicule_remplacement_id = this.vehiculeSelectionne;
    }

    // 2) Mettre à jour le signalement (⚡ backend gère aussi la mission)
    await axios.put(
      `http://localhost:3000/api/signalements/${this.selectedSignalement.id}`,
      payloadSignalement
    );

    // 3) Récupérer le signalement complet (mission + véhicule)
    const { data: signalement } = await axios.get(
      `http://localhost:3000/api/signalements/${this.selectedSignalement.id}`
    );
    const vehiculePrecedentId = signalement?.mission?.vehicule?.id ?? null;

    // 4) Mettre à jour l’état des véhicules
    const updates = [];
    if (vehiculePrecedentId && this.vehiculeSelectionne) {
      updates.push(
        axios.put(`http://localhost:3000/api/vehicules/${vehiculePrecedentId}`, { etat: "EN_PANNE" }),
        axios.put(`http://localhost:3000/api/vehicules/${this.vehiculeSelectionne}`, { etat: "EN_MISSION" })
      );
    } else if (this.vehiculeSelectionne) {
      updates.push(
        axios.put(`http://localhost:3000/api/vehicules/${this.vehiculeSelectionne}`, { etat: "EN_MISSION" })
      );
    } else if (vehiculePrecedentId && !this.vehiculeSelectionne) {
      updates.push(
        axios.put(`http://localhost:3000/api/vehicules/${vehiculePrecedentId}`, { etat: "EN_PANNE" })
      );
    }
    await Promise.all(updates);

    // 5) Créer une notification
    const utilisateurConnecteId =
      this.$store?.state?.auth?.user?.id ??
      this.$store?.state?.user?.id ??
      null;

    await axios.post("http://localhost:3000/api/notifications/vehicule-ou-remarque", {
      signalementId: this.selectedSignalement.id,
      vehiculeId: this.vehiculeSelectionne || null,
      remarque: this.solutionText || "",
      utilisateurId: utilisateurConnecteId,
    });

    // 6) Mettre à jour la liste locale
    const index = this.signalements.findIndex(s => s.id === this.selectedSignalement.id);
    if (index !== -1) {
      this.signalements[index].solution_enregistree = true;
      this.signalements[index].mission_continue = "oui";
      this.signalements[index].mission = signalement.mission; // ✅ MAJ mission depuis backend
    }

    alert("✅ Solution enregistrée : mission mise à jour, véhicules mis à jour et notification envoyée !");
    
    // Optionnel : rafraîchir la liste globale
    if (this.chargerSignalements) {
      await this.chargerSignalements();
    }

    this.fermerSolution();

  } catch (error) {
    console.error(error);
    alert("❌ Erreur lors de l'enregistrement de la solution !");
  }
}
, async fetchVehiculesDisponibles() {
      try {
        const response = await axios.get('http://localhost:3000/api/vehicules/disponibles');
        this.vehiculesDisponibles = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des véhicules disponibles :', error);
        this.vehiculesDisponibles = [];
      }
    },
     // Ouvrir la modale et charger les véhicules 
    openSolutionModal(signalement) {
      this.selectedSignalement = signalement;
      this.showSolutionModal = true;
      this.fetchVehiculesDisponibles(); // <- récupère les véhicules à l'ouverture
    },
    // Solution methods
    ouvrirSolution(sig) {
      this.selectedSignalement = sig;
      this.solutionText = '';
      this.showSolutionModal = true;
      this.fetchVehiculesDisponibles(); // <- récupérer véhicules dispo à l'ouverture
    },
    fermerSolution() {
      this.showSolutionModal = false;
      this.selectedSignalement = null;
      this.solutionText = '';
    },
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
    
    
    
    async fetchSignalements() {
      try {
        const res = await axios.get("http://localhost:3000/api/signalements");
        this.signalements = res.data;
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement des signalements");
      }
    },
    voirDetails(sig) {
      this.details = { ...sig };
      this.showDetails = true;
    },
    fermerDetails() {
      this.showDetails = false;
      this.details = {};
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getPhotoUrl(photo) {
      return `http://localhost:3000/uploads/${photo}`;
    }, ouvrirPhoto(photo) {
      this.photoActuelle = photo;
      this.zoomLevel = 1;
      this.showPhoto = true;
    },
    fermerPhoto() {
      this.showPhoto = false;
      this.photoActuelle = null;
    },
    zoomIn() {
      if (this.zoomLevel < 3) {
        this.zoomLevel += 0.1;
      }
    },
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.1;
      }
    },
    getTypeClass(type) {
      return {
        "type-accident": type === "ACCIDENT",
        "type-panne": type === "PANNE",
        "type-retard": type === "RETARD",
        "type-default": type === "AUTRE",
      };
    },
    getTypeLabel(type) {
      const types = {
        "ACCIDENT": "Accident",
        "PANNE": "Panne",
        "RETARD": "Retard",
        "AUTRE": "Autre"
      };
      return types[type] || type;
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    sortIcon(field) {
      if (this.sortField !== field) return 'icon-sort';
      return this.sortDirection === 'asc' ? 'icon-sort-up' : 'icon-sort-down';
    }
  },
  mounted() {
    this.fetchSignalements();
       this.fetchVehicules(); // ✅ Charger les véhicules au
  
  },
};
</script>


  <style>
  
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

/* ================================
   📋 Details Grid (amélioré)
   ================================ */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.detail-item {
  background: var(--gray-light);
  padding: 1rem;
  border-radius: 0.75rem;
  border-left: 4px solid var(--primary);
}

.detail-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-dark);
  margin-bottom: 0.25rem;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  font-size: 0.95rem;
  color: var(--dark);
  font-weight: 500;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}
    /* Variables de couleur avec dominante orange */
    :root {
      --primary: #FF6B00;
      --primary-light: #FF8C33;
      --primary-dark: #CC5600;
      --primary-very-light: #FFF3EB;
      --dark: #2C3E50;
      --gray-dark: #4A5568;
      --gray-medium: #718096;
      --gray-light: #EDF2F7;
      --white: #FFFFFF;
      --danger: #E53E3E;
      --success: #38A169;
      --warning: #DD6B20;
      --info: #3182CE;
    }

    /* Styles de base */
    .signalements-container {
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-container h1 {
      font-size: 1.75rem;
      color: var(--dark);
      margin: 0;
      font-weight: 600;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-info span {
      font-weight: 500;
      color: var(--gray-dark);
    }

    /* Filtres */
    .filters-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      background-color: var(--white);
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box i {
      position: absolute;
      left: 0.75rem;
      color: var(--gray-medium);
    }
/* Ligne mission non continue / nocturne */
.highlight-row {
  background-color: #fff3cd; /* couleur jaune clair, tu peux changer */
  font-weight: 500;
}

    .search-box input {
      padding: 0.5rem 0.75rem 0.5rem 2rem;
      border: 1px solid var(--gray-medium);
      border-radius: 0.375rem;
      min-width: 250px;
    }

    .filter-group {
      display: flex;
      gap: 0.75rem;
    }

    .filter-group select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--gray-medium);
      border-radius: 0.375rem;
      background-color: var(--white);
    }

    /* Boutons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      text-align: center;
    }

    .btn-primary {
      background-color: var(--primary);
      color: var(--white);
    }

    .btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .btn-icon {
      padding: 0.5rem;
      border-radius: 0.375rem;
      background-color: rgba(255, 107, 0, 0.1);
      color: var(--primary);
    }

    .btn-icon:hover {
      background-color: rgba(255, 107, 0, 0.2);
    }

    .btn-details {
      background-color: rgba(49, 130, 206, 0.1);
      color: var(--info);
    }

    .btn-details:hover {
      background-color: rgba(49, 130, 206, 0.2);
    }

    /* Tableau */
    .table-container {
      background-color: var(--white);
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid rgba(255, 107, 0, 0.2);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .signalements-table {
      width: 100%;
      border-collapse: collapse;
    }

    .signalements-table thead {
      background-color: var(--primary);
      color: var(--white);
    }

    .signalements-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .signalements-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--gray-light);
      color: var(--gray-dark);
      vertical-align: middle;
    }

    .signalements-table tr:last-child td {
      border-bottom: none;
    }

    .signalements-table tr:hover td {
      background-color: rgba(255, 107, 0, 0.05);
    }

    /* Badges */
    .type-badge, .intervention-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .type-accident {
      background-color: rgba(229, 62, 62, 0.1);
      color: var(--danger);
    }

    .type-panne {
      background-color: rgba(255, 107, 0, 0.1);
      color: var(--primary-dark);
    }

    .type-retard {
      background-color: rgba(255, 107, 0, 0.1);
      color: var(--primary-dark);
    }

    .type-default {
      background-color: rgba(113, 128, 150, 0.1);
      color: var(--gray-medium);
    }

    .intervention-yes {
      background-color: rgba(56, 161, 105, 0.1);
      color: var(--success);
    }

    .intervention-no {
      background-color: rgba(113, 128, 150, 0.1);
      color: var(--gray-medium);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background-color: var(--white);
      border-radius: 0.75rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border: 2px solid var(--primary);
    }

    .modal-large {
      max-width: 800px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background-color: var(--primary);
      color: var(--white);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--white);
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background-color: var(--gray-light);
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--gray-medium);
    }

    /* Détails grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-item label {
      font-weight: 600;
      color: var(--gray-dark);
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .detail-item span {
      color: var(--dark);
    }

    .description-full {
      background-color: var(--gray-light);
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 0;
      line-height: 1.5;
    }

    /* Photo container */
    .photo-container {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--gray-light);
    }

    .photo-container label {
      font-weight: 600;
      color: var(--gray-dark);
      margin-bottom: 0.75rem;
      display: block;
    }

    .photo-wrapper {
      position: relative;
      display: inline-block;
      cursor: pointer;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .photo-wrapper:hover {
      transform: translateY(-2px);
    }

    .detail-photo {
      display: block;
      max-width: 300px;
      height: auto;
    }

    .photo-hover {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .photo-wrapper:hover .photo-hover {
      opacity: 1;
    }

    .photo-hover i {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    /* Photo plein écran */
   
    /* Photo plein écran */
    .photo-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      padding: 1rem;
    }


    .photo-container-full {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .photo-full {
      max-width: 100%;
      max-height: 90vh;
      border-radius: 0.5rem;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
      cursor: move;
    }

    .btn-close-photo {
      position: absolute;
      top: -2.5rem;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .photo-controls {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.6);
      padding: 0.5rem;
      border-radius: 0.5rem;
    }

    .btn-photo-nav {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .btn-photo-nav:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* État vide */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--gray-medium);
    }

    .empty-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
      color: var(--primary);
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }

    /* Cellules spécifiques */
    .description-cell {
      max-width: 300px;
    }

    .description-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .id-cell {
      font-weight: 600;
      color: var(--primary-dark);
    }

    .mission-cell {
      color: var(--primary);
      font-weight: 500;
    }

    .date-cell {
      white-space: nowrap;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Icônes */
    .icon-flag::before { content: "🚩"; }
    .icon-search::before { content: "🔍"; }
    .icon-refresh::before { content: "🔄"; }
    .icon-eye::before { content: "👁️"; }
    .icon-close::before { content: "✕"; }
    .icon-empty::before { content: "😕"; }
    .icon-zoom::before { content: "🔍"; }
    .icon-zoom-in::before { content: "+"; font-weight: bold; }
    .icon-zoom-out::before { content: "−"; font-weight: bold; }
    .icon-sort::before { content: "↕️"; font-size: 0.75rem; }
    .icon-sort-up::before { content: "↑"; font-size: 0.75rem; }
    .icon-sort-down::before { content: "↓"; font-size: 0.75rem; }

    /* Responsive */
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-box input {
        min-width: auto;
        width: 100%;
      }
      
      .filter-group {
        flex-direction: column;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
      }
      
      .modal-content {
        margin: 1rem;
      }
      
      .photo-wrapper {
        max-width: 100%;
      }
      
      .detail-photo {
        max-width: 100%;
      }
    }
    
/* ✅ Styles globaux */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 450px;
  max-width: 95%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.solution-section {
  margin: 15px 0;
}
.solution-section label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}
.solution-section textarea,
.solution-section select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;

}
 :root {
            --primary-color: #db7f34ff;
            --primary-hover: #b98729ff;
            --secondary-color: #95a5a6;
            --secondary-hover: #7f8c8d;
            --success-color: #2ecc71;
            --warning-color: #f39c12;
            --danger-color: #e74c3c;
            --dark-color: #2c3e50;
            --light-color: #ecf0f1;
            --text-color: #333;
            --border-radius: 8px;
            --box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #f5f7fa;
            color: var(--text-color);
            line-height: 1.6;
            padding: 20px;
        }

        /* Overlay de la modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        /* Contenu de la modal */
        .modal-content {
            background-color: white;
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 500px;
            overflow: hidden;
            box-shadow: var(--box-shadow);
            animation: slideIn 0.3s ease;
        }

        .modal-small {
            max-width: 500px;
        }
        /* Bouton Solution */




/* Badge pour solution enregistrée */
.badge-success {
  background-color: #0cc738ff; /* Vert */
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}


        /* En-tête de la modal */
        .modal-header {
            background-color: var(--primary-color);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            font-weight: 500;
            font-size: 1.25rem;
        }

        .btn-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            transition: var(--transition);
        }

        .btn-close:hover {
            transform: rotate(90deg);
        }

        /* Corps de la modal */
        .modal-body {
            padding: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--dark-color);
        }

        textarea, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: var(--border-radius);
            font-size: 1rem;
            transition: var(--transition);
        }

        textarea:focus, select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

        .mt-3 {
            margin-top: 1rem;
        }

        .text-warning {
            color: var(--warning-color);
            font-size: 0.9rem;
            margin-top: 8px;
            padding: 10px;
            background-color: rgba(243, 156, 18, 0.1);
            border-radius: 4px;
            border-left: 3px solid var(--warning-color);
        }

        /* Pied de page de la modal */
        .modal-footer {
            padding: 15px 20px;
            background-color: #f8f9fa;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-weight: 500;
            transition: var(--transition);
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .btn-secondary {
            background-color: var(--secondary-color);
            color: white;
        }

        .btn-secondary:hover {
            background-color: var(--secondary-hover);
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        /* Style pour la démo */
        .demo-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }

        .demo-title {
            text-align: center;
            margin-bottom: 20px;
            color: var(--dark-color);
        }

        .demo-btn {
            display: block;
            margin: 30px auto;
            padding: 12px 25px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 1rem;
            transition: var(--transition);
        }

        .demo-btn:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
        }
        .highlight-row {
  background-color: #f8d7da; /* rouge clair */
}

.green-row {
  background-color: #d4edda; /* vert clair */
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-weight: bold;
  margin-bottom: 4px;
  color: #555;
}

.detail-item span,
.detail-item p {
  font-size: 14px;
  color: #333;
}

.full-width {
  grid-column: span 2;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}

.intervention-yes {
  color: green;
  font-weight: bold;
}
.intervention-no {
  color: red;
  font-weight: bold;
}
.mission-yes {
  color: green;
  font-weight: bold;
}
.mission-no {
  color: red;
  font-weight: bold;
}
.solution-yes {
  background: #4caf50;
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
}
.solution-no {
  background: #f44336;
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
}

.photo-container {
  margin-top: 20px;
}
.photo-wrapper {
  position: relative;
  display: inline-block;
}
.detail-photo {
  width: 180px;
  border-radius: 8px;
  cursor: pointer;
}
.photo-hover {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;   /* limite la hauteur */
  overflow-y: auto;   /* ajoute un scroll interne */
}

/* ================================
   📋 Details Grid (amélioré)
   ================================ */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.detail-item {
  background: var(--gray-light);
  padding: 1rem;
  border-radius: 0.75rem;
  border-left: 4px solid var(--primary);
}

.detail-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-dark);
  margin-bottom: 0.25rem;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  font-size: 0.95rem;
  color: var(--dark);
  font-weight: 500;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}
    /* Variables de couleur avec dominante orange */
    :root {
      --primary: #FF6B00;
      --primary-light: #FF8C33;
      --primary-dark: #CC5600;
      --primary-very-light: #FFF3EB;
      --dark: #2C3E50;
      --gray-dark: #4A5568;
      --gray-medium: #718096;
      --gray-light: #EDF2F7;
      --white: #FFFFFF;
      --danger: #E53E3E;
      --success: #38A169;
      --warning: #DD6B20;
      --info: #3182CE;
    }

    /* Styles de base */
    .signalements-container {
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-container h1 {
      font-size: 1.75rem;
      color: var(--dark);
      margin: 0;
      font-weight: 600;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-info span {
      font-weight: 500;
      color: var(--gray-dark);
    }

    /* Filtres */
    .filters-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      background-color: var(--white);
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box i {
      position: absolute;
      left: 0.75rem;
      color: var(--gray-medium);
    }

    .search-box input {
      padding: 0.5rem 0.75rem 0.5rem 2rem;
      border: 1px solid var(--gray-medium);
      border-radius: 0.375rem;
      min-width: 250px;
    }

    .filter-group {
      display: flex;
      gap: 0.75rem;
    }

    .filter-group select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--gray-medium);
      border-radius: 0.375rem;
      background-color: var(--white);
    }

    /* Boutons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      text-align: center;
    }

    .btn-primary {
      background-color: var(--primary);
      color: var(--white);
    }

    .btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .btn-icon {
      padding: 0.5rem;
      border-radius: 0.375rem;
      background-color: rgba(255, 107, 0, 0.1);
      color: var(--primary);
    }

    .btn-icon:hover {
      background-color: rgba(255, 107, 0, 0.2);
    }

    .btn-details {
      background-color: rgba(49, 130, 206, 0.1);
      color: var(--info);
    }

    .btn-details:hover {
      background-color: rgba(49, 130, 206, 0.2);
    }

    /* Tableau */
    .table-container {
      background-color: var(--white);
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid rgba(255, 107, 0, 0.2);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .signalements-table {
      width: 100%;
      border-collapse: collapse;
    }

    .signalements-table thead {
      background-color: var(--primary);
      color: var(--white);
    }

    .signalements-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .signalements-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--gray-light);
      color: var(--gray-dark);
      vertical-align: middle;
    }

    .signalements-table tr:last-child td {
      border-bottom: none;
    }

    .signalements-table tr:hover td {
      background-color: rgba(255, 107, 0, 0.05);
    }

    /* Badges */
    .type-badge, .intervention-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .type-accident {
      background-color: rgba(229, 62, 62, 0.1);
      color: var(--danger);
    }

    .type-panne {
      background-color: rgba(255, 107, 0, 0.1);
      color: var(--primary-dark);
    }

    .type-retard {
      background-color: rgba(255, 107, 0, 0.1);
      color: var(--primary-dark);
    }

    .type-default {
      background-color: rgba(113, 128, 150, 0.1);
      color: var(--gray-medium);
    }

    .intervention-yes {
      background-color: rgba(56, 161, 105, 0.1);
      color: var(--success);
    }

    .intervention-no {
      background-color: rgba(113, 128, 150, 0.1);
      color: var(--gray-medium);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background-color: var(--white);
      border-radius: 0.75rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border: 2px solid var(--primary);
    }

    .modal-large {
      max-width: 800px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background-color: var(--primary);
      color: var(--white);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--white);
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background-color: var(--gray-light);
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--gray-medium);
    }

    /* Détails grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-item label {
      font-weight: 600;
      color: var(--gray-dark);
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .detail-item span {
      color: var(--dark);
    }

    .description-full {
      background-color: var(--gray-light);
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 0;
      line-height: 1.5;
    }

    /* Photo container */
    .photo-container {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--gray-light);
    }

    .photo-container label {
      font-weight: 600;
      color: var(--gray-dark);
      margin-bottom: 0.75rem;
      display: block;
    }

    .photo-wrapper {
      position: relative;
      display: inline-block;
      cursor: pointer;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .photo-wrapper:hover {
      transform: translateY(-2px);
    }

    .detail-photo {
      display: block;
      max-width: 300px;
      height: auto;
    }

    .photo-hover {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .photo-wrapper:hover .photo-hover {
      opacity: 1;
    }

    .photo-hover i {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    /* Photo plein écran */
    .photo-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      padding: 1rem;
    }


    .photo-container-full {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .photo-full {
      max-width: 100%;
      max-height: 90vh;
      border-radius: 0.5rem;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
      cursor: move;
    }

    .btn-close-photo {
      position: absolute;
      top: -2.5rem;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .photo-controls {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.6);
      padding: 0.5rem;
      border-radius: 0.5rem;
    }

    .btn-photo-nav {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .btn-photo-nav:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* État vide */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--gray-medium);
    }

    .empty-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
      color: var(--primary);
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }

    /* Cellules spécifiques */
    .description-cell {
      max-width: 300px;
    }

    .description-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .id-cell {
      font-weight: 600;
      color: var(--primary-dark);
    }

    .mission-cell {
      color: var(--primary);
      font-weight: 500;
    }

    .date-cell {
      white-space: nowrap;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Icônes */
    .icon-flag::before { content: "🚩"; }
    .icon-search::before { content: "🔍"; }
    .icon-refresh::before { content: "🔄"; }
    .icon-eye::before { content: "👁️"; }
    .icon-close::before { content: "✕"; }
    .icon-empty::before { content: "😕"; }
    .icon-zoom::before { content: "🔍"; }
    .icon-zoom-in::before { content: "+"; font-weight: bold; }
    .icon-zoom-out::before { content: "−"; font-weight: bold; }
    .icon-sort::before { content: "↕️"; font-size: 0.75rem; }
    .icon-sort-up::before { content: "↑"; font-size: 0.75rem; }
    .icon-sort-down::before { content: "↓"; font-size: 0.75rem; }

    /* Responsive */
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-box input {
        min-width: auto;
        width: 100%;
      }
      
      .filter-group {
        flex-direction: column;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
      }
      
      .modal-content {
        margin: 1rem;
      }
      
      .photo-wrapper {
        max-width: 100%;
      }
      
      .detail-photo {
        max-width: 100%;
      }
    }
    .back-button {
  background-color: #ff7519ff;   /* fond clair */
  color: #333;                 /* texte sombre */
  border: none;                /* pas de bordure */
  padding: 10px 20px;          /* espacement */
  border-radius: 8px;          /* coins arrondis */
  font-size: 16px;             /* taille texte */
  font-weight: 500;
  cursor: pointer;             /* main au survol */
  display: inline-flex;        /* alignement icône + texte */
  align-items: center;
  gap: 8px;                    /* espace entre flèche et texte */
  transition: all 0.3s ease;   /* animation douce */
}

.back-button:hover {
  background-color: #e0e0e0;   /* couleur plus foncée au survol */
  transform: translateX(-3px); /* petit déplacement gauche */
}


  </style>