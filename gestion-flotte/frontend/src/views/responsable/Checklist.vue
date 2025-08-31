<template>
  <div class="checklist-manager">
    <!-- Header avec statistiques -->
    <div class="header-container">
      <div class="header-content">
        <div class="title-section">
          <i class="bi bi-clipboard-check"></i>
          <h1>Gestion des Checklists</h1>
        </div>
      </div>
    

    <!-- Filtres améliorés -->
    <div class="filters-container">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Rechercher par n° D'ordre, véhicule..." class="form-control">
      </div>
      <div class="filter-group">
        <label>Statut</label>
        <select v-model="filterStatus" class="form-control">
          <option value="all">Tous les statuts</option>
          <option value="valid">Validées</option>
          <option value="invalid">Non conformes</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Date</label>
        <select v-model="filterDate" class="form-control">
          <option value="all">Toutes dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Réinitialiser
      </button>
    </div>
    </div>

    <!-- Contenu principal -->
    <div v-if="!showForm" class="main-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement en cours...</p>
      </div>

      <div v-else-if="filteredMissions.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Aucune mission avec checklist disponible</p>
        <button @click="showNewChecklistForm" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Créer une checklist
        </button>
      </div>

      <div v-else class="missions-accordion">
        <div v-for="mission in filteredMissions" :key="mission.id" class="mission-card">
          <div class="mission-header" @click="toggleMission(mission.id)">
            <div class="mission-info">
              <i class="bi bi-chevron-right" :class="{ 'rotate-90': expandedMissions.includes(mission.id) }"></i>
              <div class="mission-title">
                <h3>Mission #{{ mission.mission.demande?.n_ordre || mission.id }}</h3>
                <div class="mission-meta">
                  <span class="badge" :class="getCompletenessBadgeClass(mission)">
                    {{ getCompletenessLabel(mission) }}
                  </span>
                  <span class="date">Dernière mise à jour: {{ getLastUpdateDate(mission) }}</span>
                </div>
              </div>
            </div>
          <div class="mission-stats d-flex align-items-center justify-content-between p-2 rounded shadow-sm bg-light border">
  <div class="d-flex align-items-center gap-2 text-dark">
    <i class="bi bi-clipboard-check fs-5 text-primary"></i>
    <strong>{{ mission.checklists.length }}</strong> checklist(s)
  </div>

  <div class="status-icons d-flex gap-3">
    <div v-if="mission.hasBefore" class="d-flex align-items-center gap-1">
      <i class="bi bi-arrow-up-circle-fill fs-5" :class="getChecklistStatusClass(mission, 'AVANT_MISSION')" title="Contrôle avant mission"></i>
      <small class="text-muted">Avant</small>
      
    </div>
    <div v-if="mission.hasAfter" class="d-flex align-items-center gap-1">
      <i class="bi bi-arrow-down-circle-fill fs-5" :class="getChecklistStatusClass(mission, 'APRES_MISSION')" title="Contrôle après mission"></i>
      <small class="text-muted">Après</small>
      
    </div>
  </div>
</div>

          </div>

 <div v-if="expandedMissions.includes(mission.id)" class="table-responsive my-4">
  <table class="table table-hover table-bordered align-middle shadow-sm">
    <!-- 🟢 En-tête -->
    <thead class="bg-dark text-white text-center">
      <tr>
        <th style="width: 12%">Type</th>
        <th style="width: 12%">Statut</th>
        <th style="width: 15%">Date</th>
        <th style="width: 20%">Véhicule</th>
        <th style="width: 20%">Chauffeur</th>
        <th style="width: 10%">Km</th>
        <th style="width: 11%">Actions</th>
      </tr>
    </thead>

    <!-- 🟢 Corps -->
    <tbody>
      <tr 
        v-for="checklist in mission.checklists" 
        :key="checklist.id"
        class="align-middle"
        :class="checklist.valide ? 'table-success bg-opacity-25' : 'table-danger bg-opacity-25'"
      >
        <!-- Type -->
        <td class="text-center">
          <span class="badge rounded-pill bg-gradient bg-primary px-3 py-2">
            <i class="bi bi-list-check me-1"></i>
            {{ checklist.type_controle === 'AVANT_MISSION' ? 'Pré-mission' : 'Post-mission' }}
          </span>
        </td>

        <!-- Statut -->
        <td class="text-center">
          <span :class="['badge rounded-pill px-3 py-2', checklist.valide ? 'bg-success' : 'bg-danger']">
            <i :class="checklist.valide ? 'bi bi-check-circle me-1' : 'bi bi-x-circle me-1'"></i>
            {{ checklist.valide ? 'Valide' : 'Non conforme' }}
          </span>
        </td>

        <!-- Date -->
        <td>
          <i class="bi bi-calendar-event me-1 text-secondary"></i>
          {{ formatDate(checklist.createdAt) }}
        </td>

        <!-- Véhicule -->
        <td>
          <i class="bi bi-car-front-fill me-1 text-info"></i>
          <strong>{{ checklist.mission?.vehicule?.marque }} {{ checklist.mission?.vehicule?.modele }}</strong>
          <br>
          <small class="text-muted">({{ checklist.mission?.vehicule?.immatriculation }})</small>
        </td>

        <!-- Chauffeur -->
        <td>
          <i class="bi bi-person-fill me-1 text-primary"></i>
          <strong>{{ checklist.mission?.chauffeur?.utilisateur?.prenom }} {{ checklist.mission?.chauffeur?.utilisateur?.nom }}</strong>
        </td>

        <!-- Km -->
        <td class="text-center">
          <span class="fw-bold text-dark">
            <i class="bi bi-speedometer2 me-1 text-warning"></i>
            {{ checklist.kilometrage }} km
          </span>
        </td>

        <!-- Actions -->
        <td class="text-center">
          <button @click.stop="viewChecklist(checklist)" class="btn btn-sm btn-outline-primary rounded-pill px-3">
            <i class="bi bi-eye me-1"></i> Voir
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>


        </div>
      </div>
    </div>

   
  <!-- ✅ Modal de visualisation stylé -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-dialog shadow-lg">
      <div class="modal-content p-4 rounded-lg bg-white">

        <!-- Header Checklist -->
<div class="modal-header d-flex justify-content-between align-items-center mb-4">
  <h3 class="text-lg fw-bold text-primary d-flex align-items-center gap-2">
    <i class="bi bi-clipboard-check fs-4"></i>
    Checklist #{{ selectedChecklist.id }} - 
    <span class="text-muted ms-1">
      {{ selectedChecklist.type_controle === 'AVANT_MISSION' ? 'Pré-mission' : 'Post-mission' }}
    </span>
  </h3>

  <!-- Bouton fermer modal -->
  <button @click="closeModal" class="btn btn-sm btn-outline-danger" aria-label="Fermer">
    <i class="bi bi-x-lg"></i>
  </button>
</div>

<!-- Actions et boutons selon checklist -->
<div class="actions-buttons d-flex flex-wrap gap-2 mb-4">

  <!-- Bouton Démarrer mission (visible si avant mission et non validé) -->
  <button
    v-if="selectedChecklist?.type_controle === 'AVANT_MISSION' && !selectedChecklist?.valide"
    class="btn btn-success fw-semibold"
    @click="demarrerMission(selectedMission.id)"
  >
    🚀 Démarrer la mission
  </button>

  <!-- Bouton Changer véhicule -->
  <button
    v-if="selectedChecklist?.type_controle === 'AVANT_MISSION' && !selectedChecklist?.valide"
    class="btn btn-warning fw-semibold"
    @click="popupVehicule = true"
  >
    🔄 Changer de véhicule
  </button>

  <!-- Bouton Planifier maintenance centré -->
  <div class="flex-grow-1 d-flex justify-content-center">
    <button
      class="btn btn-danger fw-semibold px-4"
      @click="ouvrirFormulaireMaintenance"
    >
      🛠️ Planifier maintenance
    </button>
  </div>
</div>

<!-- Popup Choisir Véhicule -->
<div v-if="popupVehicule" class="popup" @click.self="popupVehicule = false" role="dialog" aria-modal="true" aria-labelledby="vehiculeTitle">
  <div class="popup-content p-4 rounded shadow-sm bg-white" style="max-width: 400px;">
    <h5 id="vehiculeTitle" class="mb-3">Choisir un véhicule</h5>
    <select v-model="vehiculeSelectionne" class="form-select mb-3" aria-label="Sélectionner un véhicule">
      <option disabled value="">-- Sélectionner un véhicule --</option>
      <option v-for="vehicule in vehiculesDisponibles" :key="vehicule.id" :value="vehicule.id">
        {{ vehicule.marque }} - {{ vehicule.immatriculation }}
      </option>
    </select>
    <div class="d-flex justify-content-end gap-2">
      <button class="btn btn-primary btn-sm" @click="validerChangement">Valider</button>
      <button class="btn btn-secondary btn-sm" @click="popupVehicule = false">Annuler</button>
    </div>
  </div>
</div>

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
      <h3 class="fs-6 fw-semibold mb-3 text-danger">Informations de la mission</h3>
      <dl class="row text-dark">
        <dt class="col-sm-4 fw-bold">Mission :</dt>
        <dd class="col-sm-8">{{ selectedMission?.nom || 'Non définie' }}</dd>

        <dt class="col-sm-4 fw-bold">Véhicule :</dt>
        <dd class="col-sm-8">
          {{ selectedMission?.vehicule?.marque || '-' }} -
          {{ selectedMission?.vehicule?.immatriculation || '-' }}
        </dd>
      </dl>
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
        <!-- Corps -->
        <div class="modal-body">

          <!-- Statut + Date -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <span class="badge rounded-pill" :class="selectedChecklist.valide ? 'bg-success' : 'bg-danger'">
              <i :class="selectedChecklist.valide ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
              {{ selectedChecklist.valide ? 'VALIDÉE' : 'NON CONFORME' }}
            </span>
            <span class="text-muted d-flex align-items-center gap-2">
              <i class="bi bi-calendar"></i> {{ formatDate(selectedChecklist.createdAt) }}
            </span>
          </div>

          <!-- Infos générales -->
          <div class="mb-4">
            <h5 class="text-secondary mb-3">
              <i class="bi bi-info-circle-fill me-2"></i>Informations générales
            </h5>
<div class="col-md-6">
  <label class="form-label">ID du véhicule</label>
  <div class="form-control bg-light">
    {{ selectedChecklist.mission?.vehicule?.id || '-' }}
  </div>
</div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Mission</label>
                <div class="form-control bg-light">
                  #{{ selectedChecklist.mission?.demande?.n_ordre || selectedChecklist.mission_id }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Véhicule</label>
                <div class="form-control bg-light">
                  {{ selectedChecklist.mission?.vehicule?.marque }} 
                  {{ selectedChecklist.mission?.vehicule?.modele }} 
                  ({{ selectedChecklist.mission?.vehicule?.immatriculation }})
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Chauffeur</label>
                <div class="form-control bg-light">
                  {{ selectedChecklist.mission?.chauffeur?.utilisateur?.prenom }} 
                  {{ selectedChecklist.mission?.chauffeur?.utilisateur?.nom }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Kilométrage</label>
                <div class="form-control bg-light">
                  {{ selectedChecklist.kilometrage }} km
                </div>
              </div>
            </div>
          </div>

          <!-- Contrôle technique -->
          <div class="mb-4">
            <h5 class="text-secondary mb-3">
              <i class="bi bi-gear me-2"></i>Contrôle technique
            </h5>
            <div class="tech-grid">
              <div class="tech-item" :class="selectedChecklist.niveau_huile === 'CORRECT' ? 'valid' : 'invalid'">
                <label>Niveau d'huile</label>
                <span>{{ getLabelForValue('niveau_huile', selectedChecklist.niveau_huile) }}</span>
              </div>
              <div class="tech-item" :class="selectedChecklist.freins === 'FONCTIONNELS' ? 'valid' : 'invalid'">
                <label>Freins</label>
                <span>{{ getLabelForValue('freins', selectedChecklist.freins) }}</span>
              </div>
              <div class="tech-item" :class="selectedChecklist.pression_pneus === 'NORMALE' ? 'valid' : 'invalid'">
                <label>Pression des pneus</label>
                <span>{{ getLabelForValue('pression_pneus', selectedChecklist.pression_pneus) }}</span>
              </div>
              <div class="tech-item" :class="selectedChecklist.phares === 'FONCTIONNELS' ? 'valid' : 'invalid'">
                <label>Phares</label>
                <span>{{ getLabelForValue('phares', selectedChecklist.phares) }}</span>
              </div>
              <div class="tech-item" :class="selectedChecklist.ceintures === 'OK' ? 'valid' : 'invalid'">
                <label>Ceintures</label>
                <span>{{ getLabelForValue('ceintures', selectedChecklist.ceintures) }}</span>
              </div>
              <div class="tech-item" :class="selectedChecklist.niveau_carburant === 'PLEIN' || selectedChecklist.niveau_carburant === '3/4' ? 'valid' : 'invalid'">
                <label>Carburant</label>
                <span>{{ getLabelForValue('niveau_carburant', selectedChecklist.niveau_carburant) }}</span>
              </div>
            </div>
          </div>

          <!-- Remarques -->
          <div class="mb-4">
            <h5 class="text-secondary mb-3">
              <i class="bi bi-chat-left-text me-2"></i>Remarques
            </h5>
            <div class="form-control bg-light">
              <p v-if="selectedChecklist.remarques">{{ selectedChecklist.remarques }}</p>
              <p v-else class="text-muted">Aucune remarque</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>


    <!-- Confirmation de suppression -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="bi bi-exclamation-triangle text-danger"></i>
              Confirmer la suppression
            </h3>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer définitivement cette checklist ?</p>
            <p><strong>Mission #{{ checklistToDelete.mission?.demande?.n_ordre || checklistToDelete.mission_id }} - {{ checklistToDelete.type_controle === 'AVANT_MISSION' ? 'Pré-mission' : 'Post-mission' }}</strong></p>
            <p class="text-danger">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteConfirm = false" class="btn btn-outline-secondary">
              <i class="bi bi-x-lg"></i> Annuler
            </button>
            <button @click="deleteChecklist" class="btn btn-danger">
              <i class="bi bi-trash"></i> Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  name: 'ChecklistManager',
  data() {
    return {
        form: {
              mission_id: null,
        priorite: "",
        type_demande: "",
        delai: "",
        description: "",
        pieces: [],
      },
      popupPiece: false,
      pieceTmp: {
        nom_piece: "",
        quantite: 1,
        prix_unitaire: 0,
      },
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
       popupVehicule: false,
      vehiculeSelectionne: "",
    vehiculesDisponibles: [],
          selectedMission: null,
      checklists: [],
      availableMissions: [],
      loading: false,
      showForm: false,
      showModal: false,
      showDeleteConfirm: false,
      editingChecklist: null,
      checklistToDelete: null,
      selectedChecklist: {},
      searchQuery: '',
      filterStatus: 'all',
      filterType: 'all',
      filterDate: 'all',
      expandedMissions: [],
      stats: {
        total: 0,
        valid: 0,
        invalid: 0,
        vehicles: 0
      },
      formData: {
        mission_id: '',
        vehicule_id: '',
        chauffeur_id: '',
        type_controle: 'AVANT_MISSION',
        date_controle: dayjs().format('YYYY-MM-DDTHH:mm'),
        niveau_huile: 'CORRECT',
        freins: 'FONCTIONNELS',
        pression_pneus: 'NORMALE',
        phares: 'FONCTIONNELS',
        ceintures: 'OK',
        kilometrage: '',
        niveau_carburant: 'PLEIN',
        remarques: '',
        valide: true,
        vehicule_info: '',
        chauffeur_info: ''
      },
      fieldLabels: {
        niveau_huile: {
          'CORRECT': 'Correct',
          'BAS': 'Bas',
          'VIDE': 'Vide'
        },
        freins: {
          'FONCTIONNELS': 'Fonctionnels',
          'INEFFICACES': 'Inefficaces',
          'DEFAILLANTS': 'Défaillants'
        },
        pression_pneus: {
          'NORMALE': 'Normale',
          'BASSE': 'Basse',
          'A_PLAT': 'À plat'
        },
        phares: {
          'FONCTIONNELS': 'Fonctionnels',
          'INEFFICACES': 'Inefficaces',
          'DEFAILLANTS': 'Défaillants'
        },
        ceintures: {
          'OK': 'OK',
          'NON_CONFORMES': 'Non conformes'
        },
        niveau_carburant: {
          'PLEIN': 'Plein',
          '3/4': '3/4',
          '1/2': '1/2',
          '1/4': '1/4',
          'VIDE': 'Vide'
        }
      }
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
  
    groupedMissions() {
      const missionsMap = {};
      this.checklists.forEach(checklist => {
        const mission = checklist.mission;
        if (!mission) return;
        const missionId = mission.id;

        if (!missionsMap[missionId]) {
          missionsMap[missionId] = {
            id: missionId,
            mission: mission,
            checklists: [],
            hasBefore: false,
            hasAfter: false,
            lastUpdate: null,
            hasValidBefore: false,
            hasValidAfter: false
          };
        }

        missionsMap[missionId].checklists.push(checklist);

        if (checklist.type_controle === 'AVANT_MISSION') {
          missionsMap[missionId].hasBefore = true;
          if (checklist.valide) missionsMap[missionId].hasValidBefore = true;
        }
        if (checklist.type_controle === 'APRES_MISSION') {
          missionsMap[missionId].hasAfter = true;
          if (checklist.valide) missionsMap[missionId].hasValidAfter = true;
        }

        const date = new Date(checklist.createdAt);
        if (!missionsMap[missionId].lastUpdate || date > new Date(missionsMap[missionId].lastUpdate)) {
          missionsMap[missionId].lastUpdate = checklist.createdAt;
        }
      });
      return Object.values(missionsMap).sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
    },
    filteredMissions() {
      let list = this.groupedMissions;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(m => 
          (m.mission.demande?.n_ordre?.toString().includes(q)) ||
          (m.mission.vehicule?.immatriculation?.toLowerCase().includes(q)) ||
          (m.mission.vehicule?.marque?.toLowerCase().includes(q)) ||
          (m.mission.vehicule?.modele?.toLowerCase().includes(q)) ||
          (m.mission.chauffeur?.utilisateur?.nom?.toLowerCase().includes(q)) ||
          (m.mission.chauffeur?.utilisateur?.prenom?.toLowerCase().includes(q))
        );
      }

      if (this.filterStatus !== 'all') {
        list = list.filter(m => m.checklists.some(c => this.filterStatus === 'valid' ? c.valide : !c.valide));
      }

      if (this.filterType !== 'all') {
        list = list.filter(m => m.checklists.some(c => c.type_controle === this.filterType));
      }

      if (this.filterDate !== 'all') {
        const now = dayjs();
        list = list.filter(m => {
          const lastUpdate = dayjs(m.lastUpdate);
          if (this.filterDate === 'today') return lastUpdate.isSame(now, 'day');
          if (this.filterDate === 'week') return lastUpdate.isSame(now, 'week');
          if (this.filterDate === 'month') return lastUpdate.isSame(now, 'month');
          return true;
        });
      }

      return list;
    }
  },
  mounted() {
    
  this.loadVehicules();
}
,

  methods: {
    async submitFormAlt() {
  try {
    if (!this.selectedChecklist) {
      alert("Aucune checklist sélectionnée !");
      return;
    }

    // 🔹 Récupérer l'ID du véhicule depuis la mission de la checklist
    const vehicule_id = this.selectedChecklist.mission?.vehicule?.id || this.selectedChecklist.vehicule_id;

    if (!vehicule_id) {
      alert("Aucun véhicule associé à cette checklist !");
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

    // 3️⃣ Préparer les données
    let data = {
      vehicule_id,
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
   ouvrirFormulaireMaintenance() {
  if (!this.selectedMission || !this.selectedMission.vehicule) {
    alert("Mission ou véhicule non défini.");
    return;
  }

  // 🔹 Récupérer ID du véhicule automatiquement
  this.formMaintenance.id_vehicule = this.selectedMission.vehicule.id;

  // Ouvrir le popup
  this.popupMaintenance = true;
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
 // Charger les véhicules disponibles (ex: au mounted ou quand besoin)
  async loadVehicules() {
    try {
      console.log("📡 Chargement véhicules disponibles...");
      const { data } = await axios.get("http://localhost:3000/api/vehicules");
      console.log("✅ Véhicules reçus :", data);
      this.vehiculesDisponibles = data;
    } catch (err) {
      console.error("❌ Erreur chargement véhicules :", err);
      alert("Erreur lors du chargement des véhicules.");
    }
  },

  // Valider changement véhicule avec mise à jour via PUT + notification backend
 async validerChangement() {
  if (!this.vehiculeSelectionne) {
    alert("Merci de sélectionner un véhicule.");
    return;
  }
  try {
    const response = await axios.put(
      `http://localhost:3000/api/missions/changer-vehicule/${this.selectedMission.id}`,
      { nouveauVehiculeId: this.vehiculeSelectionne }
    );
    alert(response.data.message || "Véhicule changé avec succès !");
    this.popupVehicule = false;
    this.$emit("mission-modifiee"); // pour parent ou recharger liste
  } catch (error) {
    console.error(error);
    alert("Erreur lors du changement de véhicule. Veuillez réessayer.");
  }
},

demarrerMission(id) {
  const utilisateur_id = JSON.parse(localStorage.getItem("user")).id; // ou autre source ID utilisateur

  fetch(`http://localhost:3000/api/missions/demarrer/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ utilisateur_id }), // body avec utilisateur_id
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      this.getMissions(); // recharge la liste
    })
    .catch(err => console.error(err));
},

loadMission(id) {
  axios.get(`http://localhost:3000/api/missions/${id}`)
    .then(res => {
      this.selectedMission = res.data;
      this.form.vehicule_id = this.selectedMission.vehicule_id; // récupère l'id véhicule ici
    })
    .catch(err => {
      console.error("Erreur chargement mission:", err);
    });
},

async loadChecklists() {
  this.loading = true;
  try {
    const { data } = await axios.get("http://localhost:3000/api/checklists");
    this.checklists = data;
    this.calculateStats();
  } catch (err) {
    console.error("Erreur:", err);
    this.$toast.error("Erreur lors du chargement des checklists");
  } finally {
    this.loading = false;
  }
},

    async loadAvailableMissions() {
      try {
        const { data } = await axios.get('http://localhost:3000/api/missions/available');
        this.availableMissions = data;
      } catch (err) {
        console.error('Erreur:', err);
        this.$toast.error('Erreur lors du chargement des missions disponibles');
      }
    },
    calculateStats() {
      this.stats.total = this.checklists.length;
      this.stats.valid = this.checklists.filter(c => c.valide).length;
      this.stats.invalid = this.stats.total - this.stats.valid;
      
      const uniqueVehicles = new Set();
      this.checklists.forEach(c => {
        if (c.mission?.vehicule?.id) {
          uniqueVehicles.add(c.mission.vehicule.id);
        }
      });
      this.stats.vehicles = uniqueVehicles.size;
    },
    toggleMission(id) {
      const i = this.expandedMissions.indexOf(id);
      if (i >= 0) this.expandedMissions.splice(i, 1);
      else this.expandedMissions.push(id);
    },
    formatDate(date) {
      return dayjs(date).format('DD/MM/YYYY HH:mm');
    },
    getLastUpdateDate(m) {
      return this.formatDate(m.lastUpdate);
    },
    resetFilters() {
      this.searchQuery = '';
      this.filterStatus = 'all';
      this.filterType = 'all';
      this.filterDate = 'all';
    },
    showNewChecklistForm() {
      this.editingChecklist = null;
      this.resetForm();
      this.showForm = true;
      this.loadAvailableMissions();
    },
    resetForm() {
      this.formData = {
        mission_id: '',
        vehicule_id: '',
        chauffeur_id: '',
        type_controle: 'AVANT_MISSION',
        date_controle: dayjs().format('YYYY-MM-DDTHH:mm'),
        niveau_huile: 'CORRECT',
        freins: 'FONCTIONNELS',
        pression_pneus: 'NORMALE',
        phares: 'FONCTIONNELS',
        ceintures: 'OK',
        kilometrage: '',
        niveau_carburant: 'PLEIN',
        remarques: '',
        valide: true,
        vehicule_info: '',
        chauffeur_info: ''
      };
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
    };
    },
    async loadMissionDetails() {
  const missionId = this.formData.mission_id;
  if (!missionId) return;

  try {
    const { data } = await axios.get(`http://localhost:3000/api/missions/${missionId}`);
    this.formData.vehicule_id = data.vehicule?.id;
    this.formData.chauffeur_id = data.chauffeur?.id;
    this.formData.vehicule_info = `${data.vehicule?.marque} ${data.vehicule?.modele} (${data.vehicule?.immatriculation})`;
    this.formData.chauffeur_info = `${data.chauffeur?.utilisateur?.prenom} ${data.chauffeur?.utilisateur?.nom}`;
    this.formData.kilometrage = data.vehicule?.kilometrage || '';
  } catch (err) {
    console.error('Erreur:', err);
    this.$toast.error('Erreur lors du chargement des détails de la mission');
  }
},

async submitForm() {
  try {
    const payload = { ...this.formData };
    delete payload.vehicule_info;
    delete payload.chauffeur_info;

    if (this.editingChecklist) {
      await axios.put(`http://localhost:3000/api/checklists/${this.editingChecklist.id}`, payload);
      this.$toast.success('Checklist mise à jour avec succès');
    } else {
      await axios.post('http://localhost:3000/api/checklists', payload);
      this.$toast.success('Checklist créée avec succès');
    }

    this.showForm = false;
    this.loadChecklists();
  } catch (err) {
    console.error('Erreur:', err);
    this.$toast.error('Erreur lors de la sauvegarde de la checklist');
  }
},

    cancelForm() {
      this.showForm = false;
    },
    
    viewChecklist(checklist) {
  this.selectedChecklist = { ...checklist };

  if (checklist.mission) {
    this.selectedMission = { ...checklist.mission };
  } else if (checklist.mission_id) {
    this.selectedMission = { id: checklist.mission_id };
  }

  // ✅ Récupérer l'ID du véhicule
  this.selectedVehicleId = checklist.vehicule_id;

  this.showModal = true;

  console.log("ID du véhicule :", this.selectedVehicleId);
}
,
    editChecklist(checklist) {
  this.editingChecklist = checklist;
  this.formData = {
    id: checklist.id,
    mission_id: checklist.mission_id,
    vehicule_id: checklist.vehicule_id,
    chauffeur_id: checklist.chauffeur_id,
    type_controle: checklist.type_controle,
    date_controle: dayjs(checklist.date_controle).format('YYYY-MM-DDTHH:mm'),
    niveau_huile: checklist.niveau_huile,
    freins: checklist.freins,
    pression_pneus: checklist.pression_pneus,
    phares: checklist.phares,
    ceintures: checklist.ceintures,
    kilometrage: checklist.kilometrage,
    niveau_carburant: checklist.niveau_carburant,
    remarques: checklist.remarques,
    valide: checklist.valide,
    vehicule_info: `${checklist.mission?.vehicule?.marque} ${checklist.mission?.vehicule?.modele} (${checklist.mission?.vehicule?.immatriculation})`,
    chauffeur_info: `${checklist.mission?.chauffeur?.utilisateur?.prenom} ${checklist.mission?.chauffeur?.utilisateur?.nom}`
  };
  this.showForm = true;
  this.loadAvailableMissions();
},

    confirmDeleteChecklist(checklist) {
      this.checklistToDelete = checklist;
      this.showDeleteConfirm = true;
    },
    async deleteChecklist() {
  try {
    await axios.delete(`http://localhost:3000/api/checklists/${this.checklistToDelete.id}`);
    this.$toast.success('Checklist supprimée avec succès');
    this.showDeleteConfirm = false;
    this.loadChecklists();
  } catch (err) {
    console.error('Erreur:', err);
    this.$toast.error('Erreur lors de la suppression de la checklist');
  }
},


    openModal() {
    this.showModal = true;  // pour ouvrir le modal
  },

    closeModal() {
      this.showModal = false;
    },
    getCompletenessBadgeClass(mission) {
      if (mission.hasBefore && mission.hasAfter) {
        return mission.hasValidBefore && mission.hasValidAfter ? 'bg-success' : 'bg-warning';
      }
      return 'bg-secondary';
    },
    getCompletenessLabel(mission) {
      if (mission.hasBefore && mission.hasAfter) {
        return mission.hasValidBefore && mission.hasValidAfter ? 'Complète' : 'Incomplète';
      }
      return 'Partielle';
    },
    getChecklistStatusClass(mission, type) {
      const checklist = mission.checklists.find(c => c.type_controle === type);
      return checklist?.valide ? 'text-success' : 'text-danger';
    },
    getTypeBadgeClass(checklist) {
      return checklist.type_controle === 'AVANT_MISSION' 
        ? (checklist.valide ? 'bg-info' : 'bg-info text-white') 
        : (checklist.valide ? 'bg-warning' : 'bg-warning text-white');
    },
    getLabelForValue(field, value) {
      return this.fieldLabels[field]?.[value] || value;
    }
  },
  created() {
    this.loadChecklists();
  }
};
</script>
<style scoped>
/* Variables de couleurs */
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --danger-color: #f72585;
  --success-color: #4cc9f0;
  --warning-color: #f8961e;
  --info-color: #43aa8b;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gray-color: #6c757d;
  --light-gray: #e9ecef;
  --border-color: #dee2e6;
}

.checklist-manager {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header amélioré */
.header-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
}

.header-content {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-section i {
  font-size: 1.8rem;
  color: var(--primary-color);
}

.title-section h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark-color);
}

.title-section .badge {
  font-size: 0.8rem;
  padding: 5px 10px;
}

.quick-stats {
  display: flex;
  background-color: var(--light-color);
  padding: 15px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 15px;
  border-right: 1px solid var(--border-color);
}

.stat-card:last-child {
  border-right: none;
}

.stat-card i {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
}

.stat-card i.bi-check-circle {
  background-color: var(--success-color);
}

.stat-card i.bi-exclamation-triangle {
  background-color: var(--warning-color);
}

.stat-card i.bi-car-front {
  background-color: var(--accent-color);
}

.stat-card .count {
  font-size: 1.2rem;
  font-weight: 600;
  display: block;
}

.stat-card .label {
  font-size: 0.8rem;
  color: var(--gray-color);
  display: block;
}

/* Filtres améliorés */
.filters-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-color);
}

.search-box input {
  padding-left: 35px;
}

.filter-group {
  min-width: 200px;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--secondary-color);
}

.btn-outline-secondary {
  border-color: var(--border-color);
  color: var(--gray-color);
  background-color: transparent;
}

.btn-outline-secondary:hover {
  background-color: var(--light-gray);
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background-color: #d1146a;
}

.btn-edit {
  background-color: #ffc107;
  color: var(--dark-color);
}

.btn-edit:hover {
  background-color: #e0a800;
}

.btn-view {
  background-color:   rgb(55, 127, 194);
;
  color: white;
}

.btn-view:hover {
  background-color: #1d3b68;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #bb2d3b;
}

.btn-add {
  padding: 10px 20px;
  font-weight: 600;
}

/* Liste des missions */
.main-content {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.missions-accordion {
  padding: 0;
}

.mission-card {
  border-bottom: 1px solid var(--border-color);
}

.mission-card:last-child {
  border-bottom: none;
}

.mission-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mission-header:hover {
  background-color: var(--light-color);
}

.mission-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mission-info i {
  transition: transform 0.2s ease;
  color: var(--gray-color);
  font-size: 1.2rem;
}

.mission-info .rotate-90 {
  transform: rotate(90deg);
}

.mission-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.mission-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.mission-meta .badge {
  font-size: 0.7rem;
  padding: 3px 8px;
}

.mission-meta .date {
  font-size: 0.8rem;
  color: var(--gray-color);
}

.mission-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.checklist-count {
  font-size: 0.9rem;
  color: var(--gray-color);
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-icons {
  display: flex;
  gap: 10px;
}

.status-icons i {
  font-size: 1.2rem;
}

/* Checklists */
.checklists-container {
  background-color: var(--light-color);
}

.checklist-card {
  border-bottom: 1px solid var(--border-color);
  background-color: white;
}

.checklist-card:last-child {
  border-bottom: none;
}

.checklist-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checklist-header:hover {
  background-color: #f8f9fa;
}

.checklist-type .badge {
  font-size: 0.75rem;
  padding: 5px 10px;
  border-radius: 50px;
  min-width: 100px;
  text-align: center;
}

.checklist-main {
  flex: 1;
}

.checklist-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
}

.checklist-meta .date {
  font-size: 0.8rem;
  color: var(--gray-color);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.valid {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.invalid {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.checklist-summary {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
}

.checklist-summary span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--gray-color);
}

.checklist-summary i {
  font-size: 0.9rem;
}

.checklist-actions {
  display: flex;
  gap: 8px;
}

/* Détails de la checklist */
.checklist-details {
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid var(--border-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  background-color: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-item label {
  display: block;
  font-size: 0.75rem;
  color: var(--gray-color);
  margin-bottom: 5px;
}

.detail-item span {
  font-size: 0.9rem;
  font-weight: 500;
}

.technical-section {
  margin-bottom: 20px;
}

.technical-section h4 {
  font-size: 1rem;
  margin-bottom: 15px;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.tech-item {
  background-color: white;
  padding: 12px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 4px solid var(--light-gray);
}

.tech-item.valid {
  border-left-color: var(--success-color);
}

.tech-item label {
  display: block;
  font-size: 0.75rem;
  color: var(--gray-color);
  margin-bottom: 5px;
}

.tech-item span {
  font-size: 0.9rem;
  font-weight: 500;
}

.remarks-section {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.remarks-section h4 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.remarks-section p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}


.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.valid {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.invalid {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-outline-primary {
  border-color: #0d6efd;
  color: #0d6efd;
  background-color: transparent;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
  background-color: transparent;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}

.btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
  background-color: transparent;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.loading-state .spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

/* Modal styles */
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
  z-index: 1050;
}

.modal-dialog {
  max-width: 800px;
  width: 90%;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.checklist-details-modal h4 {
  color: #343a40;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.checklist-details-modal .status-badge {
  display: inline-flex;
  padding: 8px 15px;
  font-size: 1rem;
}

.technical-checks table td {
  vertical-align: middle;
}

.remarks .card-body {
  background-color: #f8f9fa;
  border-radius: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-filter {
    width: 100%;
    flex-direction: column;
  }
  
  .mission-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .checklist-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .checklist-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .checklist-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-dialog {
    width: 95%;
  }
}
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.tech-item {
  padding: 1rem;
  border-left: 4px solid transparent;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.tech-item.valid {
  border-left-color: #198754;
  background-color: #e6f4ec;
}

.tech-item.invalid {
  border-left-color: #dc3545;
  background-color: #fbeaea;
}

.tech-item label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.25rem;
}

.tech-item span {
  font-size: 0.95rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.checklists-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.checklist-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
  overflow: hidden;
}

.checklist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.checklist-header {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-type .badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: bold;
}

.checklist-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #555;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge.valid {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.invalid {
  background-color: #f8d7da;
  color: #721c24;
}

.checklist-summary span {
  display: block;
  margin-top: 4px;
  color: #444;
  font-size: 0.9rem;
}

.checklist-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-view {
  background-color: #f0f0f0;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-view:hover {
  background-color: #e0e0e0;
}
.checklists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.checklist-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 16px;
  background-color: #f9f9f9;
  transition: box-shadow 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.checklist-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.checklist-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-summary span {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 0.9rem;
}

.status-badge.valid {
  color: #198754;
  font-weight: bold;
}

.status-badge.invalid {
  color: #dc3545;
  font-weight: bold;
}

.badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
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