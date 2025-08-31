<template>
  <div class="container py-4">
    <!-- Header avec bouton retour -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.go(-1)">
        <i class="bi bi-arrow-left me-2"></i>Retour
      </button>
      <h1 class="h4 mb-0 text-center flex-grow-1">
        {{ vehicule.immatriculation }}
        <span class="badge ms-2" :class="'bg-' + couleurEtat(vehicule.etat)">
          {{ getStatusText(vehicule.etat) }}
        </span>
      </h1>
    </div>

    <!-- Photo et info de base -->
    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <div class="avatar-container mb-4">
              <img :src="getVehicleImage()" alt="Image du véhicule" class="profile-avatar" />
            </div>
            <h2 class="h5 mb-3">{{ vehicule.marque }} {{ vehicule.modele }}</h2>
            <p class="text-muted mb-4">
              <i class="bi bi-car-front me-2"></i>
              {{ vehicule.type }}
            </p>

            <!-- Stats rapides -->
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <div class="stat-value">{{ formatNumber(vehicule.kilometrage) }}</div>
                <div class="stat-label">Kilométrage</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ new Date(vehicule.date_achat).getFullYear() }}</div>
                <div class="stat-label">Année</div>
              </div>
              
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="startEditing">
                <i class="bi bi-pencil-square me-1"></i> Modifier
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header bg-white p-0">
            <ul class="nav nav-tabs" id="vehiculeTabs" role="tablist">
              <li class="nav-item" role="presentation" v-for="tab in tabs" :key="tab.id">
                <button 
                  class="nav-link" 
                  :class="{ active: activeTab === tab.id }" 
                  @click="activeTab = tab.id"
                >
                  <i :class="tab.icon" class="me-1"></i> {{ tab.label }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Contenu des onglets -->
          <div class="tab-content p-4">
            <!-- Onglet Informations -->
            <div v-show="activeTab === 'infos'">
  <!-- Mode édition -->
  <form v-if="editMode" @submit.prevent="saveVehicle">
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Immatriculation</label>
        <input type="text" class="form-control" v-model="vehicule.immatriculation" required>
      </div>
      <div class="col-md-6">
        <label class="form-label">Marque</label>
        <input type="text" class="form-control" v-model="vehicule.marque">
      </div>
      <div class="col-md-6">
        <label class="form-label">Modèle</label>
        <input type="text" class="form-control" v-model="vehicule.modele">
      </div>
      <div class="col-md-6">
        <label class="form-label">Type</label>
        <input type="text" class="form-control" v-model="vehicule.type">
      </div>
      <div class="col-md-6">
        <label class="form-label">Kilométrage</label>
        <input type="number" class="form-control" v-model="vehicule.kilometrage">
      </div>
      <div class="col-md-6">
        <label class="form-label">Date d'achat</label>
        <input type="date" class="form-control" v-model="vehicule.date_achat">
      </div>
      <div class="col-md-6">
        <label class="form-label">État</label>
        <select class="form-select" v-model="vehicule.etat" required>
          <option value="DISPO">Disponible</option>
          <option value="EN_MISSION">En mission</option>
          <option value="MAINTENANCE">En maintenance</option>
          <option value="HORS_SERVICE">Hors service</option>
        </select>
      </div>
      <div class="col-md-12">
        <label class="form-label">Photo</label>
        <input type="file" class="form-control" @change="handlePhotoUpload">
      </div>
    </div>

    <div class="d-flex justify-content-end mt-3 gap-2">
      <button type="submit" class="btn btn-primary">
        <i class="bi bi-check-circle me-1"></i> Enregistrer
      </button>
    </div>
  </form>

  <!-- Mode affichage -->
  <div v-else class="info-grid">
    <div class="info-item">
      <span class="info-label">Immatriculation</span>
      <span class="info-value">{{ vehicule.immatriculation || '-' }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Marque</span>
      <span class="info-value">{{ vehicule.marque || '-' }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Modèle</span>
      <span class="info-value">{{ vehicule.modele || '-' }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Type</span>
      <span class="info-value">{{ vehicule.type || '-' }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Kilométrage</span>
      <span class="info-value">{{ vehicule.kilometrage ? vehicule.kilometrage + ' km' : '-' }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Date d'achat</span>
      <span class="info-value">{{ formatDate(vehicule.date_achat) || '-' }}</span>
    </div>
    
  </div>
</div>


            <!-- Documents -->
            <div v-show="activeTab === 'documents'">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h5 mb-0">
                  <i class="bi bi-files text-primary me-2"></i>
                  Documents du véhicule
                </h3>
                <button class="btn btn-sm btn-primary" @click="openDocumentModal(null)">
                  <i class="bi bi-plus me-1"></i> Ajouter
                </button>
              </div>
              
              <div class="table-responsive" v-if="documents.length">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Expiration</th>
                      <th>Statut</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="document in documents" :key="document.id">
                      <td>{{ formatDocumentType(document.type_document) }}</td>
                      <td :class="{ 'text-danger': isExpired(document.date_expiration) }">
                        {{ formatDate(document.date_expiration) }}
                      </td>
                      <td>
                        <span class="badge" :class="{
                          'bg-success': document.statut === 'valide',
                          'bg-danger': document.statut === 'expiré',
                          'bg-warning text-dark': document.statut === 'à vérifier'
                        }">
                          {{ document.statut }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-2" @click="viewDocument(document)">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" @click="openDocumentModal(document)">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-state">
                <i class="bi bi-folder-x"></i> Aucun document enregistré
              </div>
            </div>

            <!-- Missions -->
            <div v-show="activeTab === 'missions'">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h5 mb-0">
                  <i class="bi bi-clock-history text-primary me-2"></i>
                  Historique des missions
                </h3>
              </div>

              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>N° d'ordre</th>
                      <th>Destination</th>
                      <th>Véhicule</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th>État</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(mission) in missions" :key="mission.id">
                      <td>{{ mission.demande?.n_ordre }}</td>
                      <td>{{ mission.demande?.destination || '-' }}</td>
                      <td>{{ mission.chauffeur?.utilisateur?.nom  || '-' }} {{ mission.chauffeur?.utilisateur?.prenom  || '-' }}</td>
                      <td>{{ formatDate(mission.date_depart) || '-' }}</td>
                      <td>{{ formatDate(mission.date_routour) || '-' }}</td>
                      <td>
                        <span class="badge" :class="{
                          'bg-warning text-dark': mission.etat === 'en cours',
                          'bg-success': mission.etat === 'terminer',
                          'bg-secondary': mission.etat === 'en attente',
                          'bg-danger': mission.etat === 'annuler'
                        }">
                          {{ mission.etat }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" @click="showMissionDetails(mission)">
                          <i class="bi bi-eye"></i> Détails
                        </button>
                      </td>
                    </tr>
                    <tr v-if="missions.length === 0">
                      <td colspan="7" class="text-center text-muted py-4">Aucune mission trouvée.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Contrôles -->
            <div v-show="activeTab === 'controles'">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h5 mb-0">
                  <i class="bi bi-clipboard-check text-primary me-2"></i>
                  Contrôles techniques
                </h3>
              </div>

              <div class="table-responsive" v-if="checklist_controles.length">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Kilométrage</th>
                      <th>Statut</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="control in checklist_controles" :key="control.id" :class="{ 'table-danger': !control.valide }">
                      <td>{{ formatControlType(control.type_controle) }}</td>
                      <td>{{ formatDateTime(control.date_controle) }}</td>
                      <td>{{ formatNumber(control.kilometrage) }} km</td>
                      <td>
                        <span class="badge" :class="control.valide ? 'bg-success' : 'bg-danger'">
                          {{ control.valide ? 'Valide' : 'Non valide' }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" @click="openControlDetailsModal(control)">
                          <i class="bi bi-eye"></i> Détails
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-state">
                <i class="bi bi-clipboard-x"></i> Aucun contrôle enregistré
              </div>
            </div>

            <!-- Maintenance -->
            <div v-show="activeTab === 'maintenance'">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h5 mb-0">
                  <i class="bi bi-tools text-primary me-2"></i>
                  Historique de maintenance
                </h3>
                <button class="btn btn-sm btn-primary" @click="openMaintenanceModal(null)">
                  <i class="bi bi-plus me-1"></i> Ajouter
                </button>
              </div>

              <div class="table-responsive" v-if="maintenance.length">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Type principal</th>
                      <th>Catégorie</th>
                      <th>Date intervention</th>
                      <th>Coût</th>
                      <th>Description</th>
                      <th>Garage</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in maintenance" :key="item.id">
                      <td>{{ item.type_principal }}</td>
                      <td>{{ item.categorie }}</td>
                      <td>{{ formatDate(item.date_intervention) }}</td>
                      <td>{{ formatNumber(item.cout) }} €</td>
                      <td>{{ item.description?.substring(0, 50) }}{{ item.description?.length > 50 ? '...' : '' }}</td>
                      <td>{{ item.garage_nom }}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" @click="openMaintenanceDetailsModal(item)">
                          <i class="bi bi-eye"></i> Détails
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="empty-state text-center text-muted py-4">
                <i class="bi bi-tools fs-2"></i>
                <p class="mt-2 mb-0">Aucune maintenance enregistrée</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal document -->
    <div v-if="showDocumentModal" class="modal-backdrop show"></div>
    <div v-if="showDocumentModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-plus text-primary me-2"></i>
              {{ currentDocument.id ? 'Modifier' : 'Ajouter' }} un document
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDocument">
              <div class="mb-3">
                <label class="form-label">Type de document</label>
                <select v-model="currentDocument.type_document" class="form-select" required>
                  <option value="assurance">Assurance</option>
                  <option value="carte_grise">Carte grise</option>
                  <option value="controle_technique">Contrôle technique</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Date d'expiration</label>
                <input v-model="currentDocument.date_expiration" type="date" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Fichier</label>
                <input type="file" class="form-control" @change="handleDocumentFileChange">
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check-circle me-1"></i> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  <!-- Modal Détails Mission -->
<div v-if="selectedMission" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content shadow-lg rounded-3 border-0">
      
      <!-- Header -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">
          <i class="bi bi-geo-alt-fill me-2"></i>
          Mission N° {{ selectedMission.demande?.n_ordre }}
        </h5>
        <button type="button" class="btn-close btn-close-white" @click="selectedMission = null"></button>
      </div>
      
      <!-- Body -->
      <div class="modal-body">
        <div class="row g-3">
          
          <!-- Chauffeur -->
          <div class="col-md-6">
            <div class="p-3 bg-light rounded shadow-sm h-100">
              <h6 class="fw-bold text-primary"><i class="bi bi-person-badge me-2"></i>Chauffeur</h6>
              <p class="mb-1">{{ selectedMission.chauffeur?.utilisateur?.nom }} {{ selectedMission.chauffeur?.utilisateur?.prenom }}</p>
              <p class="text-muted small mb-0">Matricule : {{ selectedMission.chauffeur?.utilisateur?.matricule }}</p>
            </div>
          </div>
          
          <!-- Destination -->
          <div class="col-md-6">
            <div class="p-3 bg-light rounded shadow-sm h-100">
              <h6 class="fw-bold text-primary"><i class="bi bi-flag-fill me-2"></i>Destination</h6>
              <p class="mb-1">{{ selectedMission.demande?.destination }}</p>
              <p class="text-muted small mb-0">Itinéraire : {{ selectedMission.demande?.itineraire }}</p>
            </div>
          </div>
          
          <!-- Dates -->
          <div class="col-md-6">
            <div class="p-3 bg-light rounded shadow-sm h-100">
              <h6 class="fw-bold text-primary"><i class="bi bi-calendar-event me-2"></i>Départ</h6>
              <p class="mb-0">{{ formatDate(selectedMission.demande?.date_heure_debut) }}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 bg-light rounded shadow-sm h-100">
              <h6 class="fw-bold text-primary"><i class="bi bi-calendar-check me-2"></i>Retour</h6>
              <p class="mb-0">{{ formatDate(selectedMission.demande?.date_heure_fin) }}</p>
            </div>
          </div>
          
          <!-- Observation -->
          <div class="col-12">
            <div class="p-3 bg-light rounded shadow-sm">
              <h6 class="fw-bold text-primary"><i class="bi bi-journal-text me-2"></i>Observation</h6>
              <p class="mb-0">{{ selectedMission.demande?.observation || 'Aucune' }}</p>
            </div>
          </div>
          
          <!-- État -->
          <div class="col-12">
            <div class="p-3 rounded shadow-sm" :class="{
              'bg-success text-white': selectedMission.etat === 'terminée',
              'bg-warning text-dark': selectedMission.etat === 'en cours',
              'bg-secondary text-white': selectedMission.etat === 'en attente'
            }">
              <h6 class="fw-bold"><i class="bi bi-info-circle me-2"></i>État</h6>
              <p class="mb-0 text-capitalize">{{ selectedMission.etat }}</p>
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-outline-secondary" @click="selectedMission = null">
          <i class="bi bi-x-circle me-2"></i>Fermer
        </button>
      </div>
    </div>
  </div>
</div>

    <!-- Modal détails contrôle -->
    <div v-if="showControlModal" class="modal-backdrop show"></div>
    <div v-if="showControlModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-clipboard-check text-primary me-2"></i>
              Détails du contrôle
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Type:</label>
                  <p class="fw-medium">{{ formatControlType(currentControl.type_controle) }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label">Date:</label>
                  <p class="fw-medium">{{ formatDateTime(currentControl.date_controle) }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label">Kilométrage:</label>
                  <p class="fw-medium">{{ formatNumber(currentControl.kilometrage) }} km</p>
                </div>
                <div class="mb-3">
                  <label class="form-label">Statut:</label>
                  <p class="fw-medium">
                    <span class="badge" :class="currentControl.valide ? 'bg-success' : 'bg-danger'">
                      {{ currentControl.valide ? 'Valide' : 'Non valide' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Niveau d'huile:</label>
                  <p class="fw-medium">{{ formatNumber(currentControl.niveau_huile) }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label">Freins:</label>
                  <p class="fw-medium">{{ formatNumber(currentControl.freins) }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label">Pression des pneus:</label>
                  <p class="fw-medium">{{ formatNumber(currentControl.pression_pneus) }}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label">Phares:</label>
                  <p class="fw-medium">{{ formatNumber(currentControl.phares) }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="form-label">Remarques:</label>
                  <p class="fw-medium">{{ currentControl.remarques || 'Aucune remarque' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal détails maintenance -->
    <div v-if="showMaintenanceModal" class="modal-backdrop show"></div>
    <div v-if="showMaintenanceModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-tools text-primary me-2"></i>
              {{ currentMaintenance.id ? 'Détails' : 'Ajouter' }} maintenance
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMaintenance">
              <div class="mb-3">
                <label for="type_principal" class="form-label">Type Principal</label>
                <select v-model="currentMaintenance.type_principal" id="type_principal" class="form-select" required>
                  <option disabled value="">-- Sélectionner --</option>
                  <option value="Préventive">Préventive</option>
                  <option value="Curative">Curative</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="categorie" class="form-label">Catégorie</label>
                <select v-model="currentMaintenance.categorie" id="categorie" class="form-select" required>
                  <option disabled value="">-- Choisir une catégorie --</option>
                  <option v-for="cat in filteredCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input v-model="currentMaintenance.date_intervention" type="date" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Coût (€)</label>
                <input v-model="currentMaintenance.cout" type="number" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="currentMaintenance.description" class="form-control" rows="3" required></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check-circle me-1"></i> Enregistrer
                </button>
              </div>
            </form>
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
  name: 'VehiculeDetail',
  data() {
    return {
      vehicule: {
        immatriculation: '',
        marque: '',
        modele: '',
        type: '',
        etat: '',
        kilometrage: 0,
        date_achat: '',
        photo_url: ''
      },
      editMode: false,
      documents: [],
      missions: [],
      checklist_controles: [],
      maintenance: [],
      activeTab: 'infos',
      tabs: [
        { id: 'infos', label: 'Informations', icon:'bi bi-info-circle'},
        { id: 'documents', label: 'Documents', icon: 'bi-file-earmark-text' },
        { id: 'missions', label: 'Missions', icon: 'bi-calendar-check' },
        { id: 'controles', label: 'Contrôles', icon: 'bi-clipboard-check' },
        { id: 'maintenance', label: 'Maintenance', icon: 'bi-tools' }
      ],
      showVehicleModal: false,
      showDocumentModal: false,
      showMissionModal: false,
      showControlModal: false,
      showMaintenanceModal: false,
      selectedMission: null,

      editVehicle: {},
      currentDocument: { id: null, type_document: '', date_expiration: '' },
      newDocumentFile: null,
      currentMission: {},
      currentControl: {},
      currentMaintenance: {
        id: null,
        type_principal: '',
        categorie: '',
        date_intervention: new Date().toISOString().split('T')[0],
        cout: 0,
        description: '',
        garage_nom: '',
        statut: 'Prévu',
        fichier_facture: null
      },
      newVehiclePhoto: null,
      newFactureFile: null,
      
      categories: {
        Préventive: [
          'Vidange', 'Révision périodique', 'Filtre à air', 'Filtre à huile',
          'Contrôle technique', 'Inspection HSE'
        ],
        Curative: [
          'Freins', 'Pneumatiques', 'Moteur', 'Boîte de vitesses',
          'Électrique', 'Suspension', 'Refroidissement', 'Injection',
          'Échappement', 'Transmission', 'Embrayage', 'Autre'
        ]
      }
    };
  },
  computed: {
    filteredCategories() {
      return this.categories[this.currentMaintenance.type_principal] || [];
    }
  },
  methods: {
    async fetchDetails() {
      const id = this.$route.params.id;
      try {
        const response = await axios.get(`http://localhost:3000/api/vehicules/${id}/details`);
        this.vehicule = response.data.vehicule || {};
        this.documents = response.data.documents || [];
        this.missions = response.data.missions || [];
        this.checklist_controles = response.data.checklist_controles || [];
        this.maintenance = response.data.maintenance || [];
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
      }
    },
    getVehicleImage() {
      return this.vehicule.photo_url
        ? `http://localhost:3000/uploads/vehicules/${this.vehicule.photo_url}`
        : 'https://via.placeholder.com/300x200?text=Véhicule';
    },
    showMissionDetails(mission) {
      this.selectedMission = mission;
    },
    formatDate(date) {
    return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';
  },
  formatDateTime(date) {
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A';
  },
    formatNumber(num) {
      return num ? num.toLocaleString('fr-FR') : '0';
    },
    getStatusText(status) {
      const statusMap = {
        DISPO: 'Disponible',
        EN_MISSION: 'En mission',
        MAINTENANCE: 'Maintenance',
        HORS_SERVICE: 'Hors service'
      };
      return statusMap[status] || status;
    },
    couleurEtat(etat) {
      const etatMap = {
        DISPO: 'success',
        EN_MISSION: 'primary',
        MAINTENANCE: 'warning',
        HORS_SERVICE: 'danger'
      };
      return etatMap[etat] || 'secondary';
    },
    formatDocumentType(type) {
      const types = {
        assurance: 'Assurance',
        carte_grise: 'Carte grise',
        controle_technique: 'Contrôle technique'
      };
      return types[type] || type;
    },
    formatControlType(type) {
      return type === 'AVANT_MISSION' ? 'Pré-mission' : 'Post-mission';
    },
    isExpired(date) {
      return dayjs(date).isBefore(dayjs());
    },
    downloadDocument(doc) {
      if (!doc.fichier_url) return;
      const link = document.createElement('a');
      link.href = `http://localhost:3000${doc.fichier_url}`;
      link.download = doc.fichier_url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    viewDocument(doc) {
      if (!doc.fichier_url) return;
      window.open(`http://localhost:3000${doc.fichier_url}`, '_blank');
    },
    openDocumentModal(document) {
      this.currentDocument = document
        ? { ...document }
        : { type_document: 'assurance', date_expiration: '', statut: 'valide', fichier: null };
      this.showDocumentModal = true;
    },
    openMaintenanceModal(item) {
      this.currentMaintenance = item
        ? { ...item }
        : {
            type_principal: '',
            categorie: '',
            date_intervention: new Date().toISOString().split('T')[0],
            cout: 0,
            description: '',
            garage_nom: '',
            fichier_facture: null
          };
      this.newFactureFile = null;
      this.showMaintenanceModal = true;
    },
    openMaintenanceDetailsModal(item) {
      this.currentMaintenance = { ...item };
      this.showMaintenanceModal = true;
    },
    openMissionDetailsModal(mission) {
      this.selectedMission = {
        ...mission,
        chauffeur_nom: mission.chauffeur?.utilisateur?.nom || '',
        chauffeur_prenom: mission.chauffeur?.utilisateur?.prenom || '',
        chauffeur_matricule: mission.chauffeur?.utilisateur?.matricule || '',
        n_ordre: mission.demande?.n_ordre || '',
        destination: mission.demande?.destination || '',
        itineraire: mission.demande?.itineraire || '',
        date_heure_debut: mission.demande?.date_heure_debut || '',
        date_heure_fin: mission.demande?.date_heure_fin || '',
        observation: mission.demande?.observation || '',
        etat: mission.etat
      };
      this.showMissionModal = true;
    },
    openControlDetailsModal(control) {
      this.currentControl = { ...control };
      this.showControlModal = true;
    },
    handleVehiclePhotoChange(e) {
      this.newVehiclePhoto = e.target.files[0];
    },
    handleDocumentFileChange(e) {
      this.newDocumentFile = e.target.files[0] || null;
    },
    handleFactureFileChange(e) {
      this.newFactureFile = e.target.files[0] || null;
    },
    closeModal() {
      this.showVehicleModal = false;
      this.showDocumentModal = false;
      this.showMissionModal = false;
      this.showControlModal = false;
      this.showMaintenanceModal = false;
      this.newVehiclePhoto = null;
      this.newDocumentFile = null;
      this.newFactureFile = null;
      this.selectedMission = null;
    },
    startEditing() {
      this.activeTab = 'infos';
      this.editMode = true;
      this.editVehicle = { ...this.vehicule };
    },
    async saveVehicle() {
      try {
        const formData = new FormData();
        for (const key in this.vehicule) {
          if (this.vehicule[key] !== null && this.vehicule[key] !== undefined) {
            formData.append(key, this.vehicule[key]);
          }
        }
        if (this.newVehiclePhoto) {
          formData.append('photo', this.newVehiclePhoto);
        }
        const response = await axios.put(
          `http://localhost:3000/api/vehicules/${this.vehicule.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        this.vehicule = response.data.vehicule;
        this.editMode = false;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du véhicule:', error);
      }
    },
    async saveDocument() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("Aucun token trouvé");
          return;
        }
        const formData = new FormData();
        formData.append('type_document', this.currentDocument.type_document);
        formData.append('date_expiration', this.currentDocument.date_expiration);
        if (this.newDocumentFile) {
          formData.append('fichier', this.newDocumentFile);
        }
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
        if (this.currentDocument.id) {
          await axios.put(`http://localhost:3000/api/documents/${this.currentDocument.id}`, formData, config);
        } else {
          formData.append('vehicule_id', this.vehicule.id);
          await axios.post('http://localhost:3000/api/documents', formData, config);
        }
        this.closeModal();
        this.fetchDetails();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du document:', error);
      }
    },
    async saveMaintenance() {
      try {
        const formData = new FormData();
        const fields = ['type_principal', 'categorie', 'date_intervention', 'statut', 'description', 'cout', 'garage_nom'];
        fields.forEach(field => formData.append(field, this.currentMaintenance[field] || ''));
        formData.append('id_vehicule', this.vehicule.id);
        if (this.newFactureFile) {
          formData.append('fichier_facture', this.newFactureFile);
        }
        if (this.currentMaintenance.id) {
          await axios.put(`http://localhost:3000/api/maintenance/${this.currentMaintenance.id}`, formData);
        } else {
          await axios.post('http://localhost:3000/api/maintenance', formData);
        }
        this.closeModal();
        this.fetchDetails();
      } catch (error) {
        console.error('Erreur maintenance:', error.response?.data || error.message);
      }
    }
  },
  mounted() {
    this.fetchDetails();
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.card {
  border-radius: 0.5rem;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
  border-color: transparent;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: transparent;
  border-bottom: 3px solid #0d6efd;
  font-weight: 600;
}

.tab-content {
  background-color: #fff;
  border-radius: 0 0 0.5rem 0.5rem;
}

.avatar-container {
  position: relative;
  width: 100%;
  height: 200px;
  margin: 0 auto 1.5rem;
  overflow: hidden;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.02);
}

.stats-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: linear-gradient(to right, #f8fcff, #e7f3ff);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  min-width: 90px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #0d6efd;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #a0aec0;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #cbd5e0;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.empty-state i {
  font-size: 2rem;
  color: #cbd5e0;
}

.table {
  font-size: 0.9rem;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
  text-transform: capitalize;
}

.btn {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.modal-backdrop.show {
  opacity: 0.5;
  background-color: #000;
}

.modal.show.d-block {
  display: block !important;
  background-color: rgba(0, 0, 0, 0.3);
}

.modal-content {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: none;
  background :#0d6dfd83 ;
}

.modal-title {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: none;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.info-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-weight: 500;
  color: #212529;
  word-break: break-word;
}

.form-label {
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.25rem;
  display: block;
}

.fw-medium {
  font-weight: 500;
}

@media (max-width: 992px) {
  .stats-grid {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .avatar-container {
    width: 120px;
    height: 120px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }

  .nav-tabs .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .nav-tabs .nav-link {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>