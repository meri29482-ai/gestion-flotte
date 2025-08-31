<template>
  <div class="container py-4">
    <!-- Header avec bouton retour -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.go(-1)">
        <i class="bi bi-arrow-left me-2"></i>Retour
      </button>
      <h1 class="h4 mb-0 text-center flex-grow-1">Fiche Chauffeur</h1>
      <div style="width: 100px;"></div> <!-- Pour l'alignement -->
    </div>

    <!-- États de chargement -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="mt-2 text-muted">Chargement des données du chauffeur...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger text-center">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      Erreur lors du chargement des données
      <button class="btn btn-sm btn-outline-danger ms-3" @click="fetchChauffeur">Réessayer</button>
    </div>

    <!-- Contenu principal -->
    <div v-else class="row">
      <!-- Colonne de gauche - Photo et infos de base -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">
            <!-- Photo profil -->
            <div class="avatar-container mb-4">
              <img v-if="chauffeur.utilisateur?.photo" 
                   :src="'http://localhost:3000/uploads/' + chauffeur.utilisateur.photo" 
                   class="profile-avatar"
                   alt="Photo du chauffeur">
              <div v-else class="avatar-placeholder">
                <i class="bi bi-person-circle"></i>
              </div>
              <span class="status-badge" :class="'bg-' + couleurEtat(chauffeur.etat)">
                {{ chauffeur.etat }}
              </span>
            </div>

            <!-- Infos principales -->
            <h2 class="h5 mb-3 text-capitalize">{{ chauffeur.utilisateur?.prenom }} {{ chauffeur.utilisateur?.nom }}</h2>
            <p class="text-muted mb-4">
              <i class="bi bi-person-badge me-2"></i>
              {{ chauffeur.utilisateur?.matricule }}
            </p>

            <!-- Stats rapides -->
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <div class="stat-value">{{ missions.length || 0 }}</div>
                <div class="stat-label">Missions</div>
              </div>
              <div class="stat-item">
  <div class="stat-value">{{ totalHeuresTravail() }}</div>
  <div class="stat-label">Total Heures de Travail</div>
</div>
            </div>

            <!-- Actions rapides -->
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="editMode = !editMode">
                <i class="bi bi-pencil-square me-1"></i> {{ editMode ? 'Annuler' : 'Modifier' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne de droite - Détails -->
      <div class="col-md-8">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white p-0">
            <ul class="nav nav-tabs" id="chauffeurTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'infos' }" 
                        @click="activeTab = 'infos'" type="button">
                  <i class="bi bi-info-circle me-1"></i> Informations
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'documents' }" 
                        @click="activeTab = 'documents'" type="button">
                  <i class="bi bi-files me-1"></i> Documents
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'missions' }" 
                        @click="activeTab = 'missions'" type="button">
                  <i class="bi bi-clock-history me-1"></i> Missions
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'HT' }" 
                        @click="activeTab = 'HT'" type="button">
                  <i class="bi bi-hourglass-split me-1"></i> H. travail
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeTab === 'conges' }" 
                        @click="activeTab = 'conges'" type="button">
                  <i class="bi bi-calendar-check me-1"></i> Congés
                </button>
              </li>
            </ul>
          </div>

          <!-- Contenu des onglets -->
          <div class="tab-content p-4">
            <!-- Onglet Informations -->
            <div v-show="activeTab === 'infos'">
              <form v-if="editMode" @submit.prevent="saveChanges">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Prénom</label>
                    <input type="text" class="form-control" v-model="chauffeur.utilisateur.prenom" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Nom</label>
                    <input type="text" class="form-control" v-model="chauffeur.utilisateur.nom" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" v-model="chauffeur.utilisateur.email" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Téléphone</label>
                    <input type="tel" class="form-control" v-model="chauffeur.utilisateur.numero_telephone">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date de naissance</label>
                    <input type="date" class="form-control" v-model="chauffeur.date_naissance">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Statut</label>
                    <select class="form-select" v-model="chauffeur.etat" required>
                      <option value="Dispo">Disponible</option>
                      <option value="en mission">En mission</option>
                      <option value="hors service">Hors service</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Adresse</label>
                    <textarea class="form-control" rows="2" v-model="chauffeur.adresse"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Numéro de permis</label>
                    <input type="text" class="form-control" v-model="chauffeur.numero_permis">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Type de permis</label>
                    <input type="text" class="form-control" v-model="chauffeur.type_permis">
                  </div>
                </div>
                <div class="d-flex justify-content-end mt-3 gap-2">
                  <button type="button" class="btn btn-outline-secondary" @click="editMode = false">
                    Annuler
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="bi bi-check-circle me-1"></i> Enregistrer
                  </button>
                </div>
              </form>

              <div v-else class="info-grid">
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ chauffeur.utilisateur?.email || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Téléphone</span>
                  <span class="info-value">{{ chauffeur.utilisateur?.numero_telephone || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date de naissance</span>
                  <span class="info-value">{{ formatDate(chauffeur.date_naissance) || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Adresse</span>
                  <span class="info-value">{{ chauffeur.adresse || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Numéro de permis</span>
                  <span class="info-value">{{ chauffeur.numero_permis || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Societé </span>
                  <span class="info-value">{{ chauffeur.societe || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Onglet Documents -->
            <div v-show="activeTab === 'documents'">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h5 mb-0">
                  <i class="bi bi-files text-primary me-2"></i>
                  Documents du chauffeur
                </h3>
                <button class="btn btn-sm btn-primary" @click="showDocumentModal = true">
                  <i class="bi bi-plus me-1"></i> Ajouter
                </button>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>        </th>
                      <th>Expiration</th>
                      <th>Statut</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="doc in chauffeur.documents" :key="doc.id">
                      <td>{{ getDocumentLabel(doc.type_document) }}</td>
                      <td>{{ doc.numero || '-' }}</td>
                      <td :class="{ 'text-danger': isExpired(doc.date_expiration) }">
                        {{ formatDate(doc.date_expiration) }}
                      </td>
                      <td>
                        <span class="badge" :class="isExpired(doc.date_expiration) ? 'bg-danger' : 'bg-success'">
                          {{ isExpired(doc.date_expiration) ? 'Expiré' : 'Valide' }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary me-2" @click="viewDocument(doc)">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteDocument(doc.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="chauffeur.documents?.length === 0">
                      <td colspan="5" class="text-center text-muted py-4">
                        Aucun document enregistré
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
<div v-show="activeTab === 'HT'">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="h5 mb-0">
      <i class="bi bi-clock-history text-success me-2"></i>
      Heures de travail du chauffeur
    </h3>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th>Mission</th>
          <th>Heure départ</th>
          <th>Heure arrivée</th>
          <th>Durée totale</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="heure in heuresTravail" :key="heure.id">
          <td>
            <span class="fw-semibold">#{{ heure.n_ordre }}</span>
          </td>
          <td>{{ formatDateHeure(heure.heure_depart) }}</td>
          <td>
            <span v-if="heure.heure_arrivee">
              {{ formatDateHeure(heure.heure_arrivee) }}
            </span>
            <span v-else class="text-muted fst-italic">En cours</span>
          </td>
          <td>
            <span
  v-if="heure.duree_total"
  class="badge rounded-pill shadow-sm"
  :class="getDureeBadgeClass(heure.duree_total)"
  :title="'Durée totale : ' + heure.duree_total"
>
  {{ heure.duree_total }}
</span>
            <span v-else class="text-muted">--</span>
          </td>
          
        </tr>

        <tr v-if="heuresTravail.length === 0">
          <td colspan="5" class="text-center text-muted py-4">
            Aucune heure de travail enregistrée
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

            <!-- Onglet Congés -->
            <div v-show="activeTab === 'conges'">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h5 mb-0">
                  <i class="bi bi-calendar-check text-primary me-2"></i>
                  Congés du chauffeur
                </h3>
                <button class="btn btn-sm btn-primary" @click="showCongeModal = true">
                  <i class="bi bi-plus me-1"></i> Ajouter
                </button>
              </div>

              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th>Durée</th>
                      <th>Statut</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="conge in conges" :key="conge.id">
                      <td>{{ conge.type }}</td>
                      <td>{{ formatDate(conge.date_debut) }}</td>
                      <td>{{ formatDate(conge.date_fin) }}</td>
                      <td>{{ calculerDuree(conge.date_debut, conge.date_fin) }} jours</td>
                      <td>
                        <span :class="{
                          'badge bg-warning text-dark': conge.statut === 'En attente',
                          'badge bg-success': conge.statut === 'Approuvé',
                          'badge bg-danger': conge.statut === 'Rejeté'
                        }">
                          {{ conge.statut }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" @click="deleteConge(conge.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="conges.length === 0">
                      <td colspan="6" class="text-center text-muted py-4">
                        Aucun congé enregistré
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Onglet Missions -->
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
                      <td>{{ mission.vehicule?.immatriculation || '-' }}</td>
                      <td>{{ formatDate(mission.date_depart) }}</td>
                      <td>{{ formatDate(mission.date_routour) }}</td>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Détails Mission -->
    <div v-if="showMissionModal" class="modal-backdrop show"></div>
    <div v-if="showMissionModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-info-circle text-primary me-2"></i>
              Détails de la mission
            </h5>
            <button type="button" class="btn-close" @click="closeMissionModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Colonne gauche - Infos principales -->
              <div class="col-md-6">
                <div class="mb-4">
                  <h6 class="d-flex align-items-center text-primary mb-3">
                    <i class="bi bi-geo-alt me-2"></i>
                    Itinéraire
                  </h6>
                  <div class="ps-4">
                    <div class="mb-3">
                      <label class="form-label">Destination :</label>
                      <p class="fw-medium">{{ selectedMission?.demande?.destination || '-' }}</p>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Itinéraire :</label>
                      <p class="fw-medium">{{ selectedMission?.demande?.itineraire || '-' }}</p>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <h6 class="d-flex align-items-center text-primary mb-3">
                    <i class="bi bi-calendar-event me-2"></i>
                    Dates
                  </h6>
                  <div class="ps-4">
                    <div class="mb-3">
                      <label class="form-label">Date de départ :</label>
                      <p class="fw-medium">{{ formatDateTime(selectedMission?.demande?.date_heure_debut) || '-' }}</p>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Date de retour :</label>
                      <p class="fw-medium">{{ formatDateTime(selectedMission?.demande?.date_heure_fin) || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Colonne droite - Véhicule et statut -->
              <div class="col-md-6">
                <div class="mb-4">
                  <h6 class="d-flex align-items-center text-primary mb-3">
                    <i class="bi bi-car-front me-2"></i>
                    Véhicule
                  </h6>
                  <div class="ps-4">
                    <div class="mb-3">
                      <label class="form-label">Immatriculation :</label>
                      <p class="fw-medium">{{ selectedMission?.vehicule?.immatriculation || '-' }}</p>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Marque/Modèle :</label>
                      <p class="fw-medium">{{ selectedMission?.vehicule?.marque || '-' }} {{ selectedMission?.vehicule?.modele || '' }}</p>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <h6 class="d-flex align-items-center text-primary mb-3">
                    <i class="bi bi-clipboard-check me-2"></i>
                    Statut
                  </h6>
                  <div class="ps-4">
                    <div class="mb-3">
                      <label class="form-label">État :</label>
                      <p class="fw-medium">
                        <span class="badge" :class="getStatusClass(selectedMission?.etat)">
                          {{ selectedMission?.etat }}
                        </span>
                      </p>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Kilométrage :</label>
                      <p class="fw-medium">{{ selectedMission?.kilometrage || '-' }} km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Notes -->
            <div class="mt-4">
              <h6 class="d-flex align-items-center text-primary mb-3">
                <i class="bi bi-chat-left-text me-2"></i>
                Observations
              </h6>
              <div class="ps-4">
                <p class="fw-medium">{{ selectedMission?.demande?.observation || 'Aucune observation' }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeMissionModal">
              <i class="bi bi-x-circle me-1"></i> Fermer
            </button>
            <button v-if="selectedMission?.etat === 'en cours'" 
                    type="button" 
                    class="btn btn-primary"
                    @click="terminerMission(selectedMission.id)">
              <i class="bi bi-check-circle me-1"></i> Terminer la mission
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout Document -->
    <div v-if="showDocumentModal" class="modal-backdrop show"></div>
    <div v-if="showDocumentModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-plus text-primary me-2"></i>
              Ajouter un document
            </h5>
            <button type="button" class="btn-close" @click="showDocumentModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addDocument">
              <div class="mb-3">
                <label class="form-label">Type de document</label>
                <select class="form-select" v-model="newDocument.type_document" required>
                  <option value="permis_conduire">Permis de conduire</option>
                  <option value="certificat_medical">Certificat médical</option>
                  <option value="certificat_capacite">Certificat de capacité</option>
                  <option value="cni">Carte d'identité</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Date d'expiration</label>
                <input type="date" class="form-control" v-model="newDocument.date_expiration" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Fichier</label>
                <input type="file" class="form-control" @change="handleFileUpload" required>
                <small class="text-muted">Formats acceptés: PDF, JPG, PNG (max 5MB)</small>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="showDocumentModal = false">
                  <i class="bi bi-x-circle me-1"></i> Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-save me-1"></i> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout Congé -->
    <div v-if="showCongeModal" class="modal-backdrop show"></div>
    <div v-if="showCongeModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-plus text-primary me-2"></i>
              Ajouter un congé
            </h5>
            <button type="button" class="btn-close" @click="showCongeModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addConge">
              <div class="mb-3">
                <label class="form-label">Type de congé</label>
                <select class="form-select" v-model="newConge.type" required>
                  <option value="Annuel">Annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Maternité">Maternité</option>
                  <option value="Exceptionnel">Exceptionnel</option>
                </select>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Date début</label>
                  <input type="date" class="form-control" v-model="newConge.date_debut" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date fin</label>
                  <input type="date" class="form-control" v-model="newConge.date_fin" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Remarque</label>
                <textarea class="form-control" v-model="newConge.remarque" rows="2"></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="showCongeModal = false">
                  <i class="bi bi-x-circle me-1"></i> Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-save me-1"></i> Enregistrer
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

export default {
  name: 'ChauffeurDetails',
  data() {
    return {
      chauffeur: {
        utilisateur: {}
      },
      documents: [],
      missions: [],
      conges: [],
      heuresTravail: [], // ⚠️ initialisé à un tableau vide
      selectedMission: {},
      loading: true,
      error: false,
      editMode: false,
       showMissionModal: false,
    showDocumentModal: false,
    showCongeModal: false,
      newConge: {
        type: 'Annuel',
        date_debut: '',
        date_fin: '',
        remarque: ''
      },
      newDocument: {
        type_document: 'permis_conduire',
        numero: '',
        date_expiration: '',
        fichier: null
      },
      activeTab: 'infos'
    };
  },
  computed: {
    chauffeurId() {
      return this.$route.params.id;
    }
  },
  methods: {
    async fetchChauffeur() {
      try {
        this.loading = true;
        this.error = false;
        const { data } = await axios.get(`http://localhost:3000/api/chauffeurs/${this.chauffeurId}`);
        this.chauffeur = data;
        await this.fetchMissions();
        await this.getCongesByChauffeur();
        await this.fetchHeuresTravail();
      } catch (error) {
        console.error('Erreur lors du chargement du chauffeur:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    async fetchMissions() {
      try {
        const { data } = await axios.get(`http://localhost:3000/api/missions/chauffeur/${this.chauffeurId}`);
        this.missions = data;
      } catch (error) {
        console.error('Erreur lors du chargement des missions:', error);
        this.missions = [];
      }
    },

    async fetchHeuresTravail() {
  try {
    this.loading = true;
    this.error = null;

    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:3000/api/heures-travail/chauffeur/${this.chauffeurId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    this.heuresTravail = Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Erreur fetchHeuresTravail :", err);
    this.error = "Erreur lors de la récupération des heures de travail.";
    this.heuresTravail = [];
  } finally {
    this.loading = false;
  }
},
    formatDateHeure(date) {
  if (!date) return '-';
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  return new Date(date).toLocaleString('fr-FR', options);
},

getDureeBadgeClass(duree) {
    if (!duree) return 'badge bg-secondary';

    const [hh, mm] = duree.split(':').map(Number);
    const totalHours = hh + mm / 60;

    if (totalHours >= 100) return 'badge bg-danger';     // très longue
    if (totalHours >= 50) return 'badge bg-warning';     // longue
    return 'badge bg-success';                           // courte
  },

   totalHeuresTravail() {
    if (!this.heuresTravail || this.heuresTravail.length === 0) return '0h 0m';

    // Récupère le mois actuel (0 = janvier, 11 = décembre)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalSeconds = 0;

    this.heuresTravail.forEach(h => {
      const dateMission = new Date(h.heure_depart);
      if (dateMission.getMonth() === currentMonth && dateMission.getFullYear() === currentYear) {
        // Si duree_total est défini et au format hh:mm:ss
        if (h.duree_total) {
          const [hh, mm, ss] = h.duree_total.split(':').map(Number);
          totalSeconds += hh * 3600 + mm * 60 + (ss || 0);
        }
      }
    });

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

    return `${totalHours}h ${totalMinutes}m`;
  },

    async getCongesByChauffeur() {
      try {
        const response = await axios.get(`http://localhost:3000/api/conges/chauffeur/${this.chauffeurId}`);
        this.conges = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des congés:', error);
      }
    },

    async addConge() {
      try {
        await axios.post(`http://localhost:3000/api/conges`, {
          chauffeur_id: this.chauffeurId,
          type: this.newConge.type,
          date_debut: this.newConge.date_debut,
          date_fin: this.newConge.date_fin,
          remarque: this.newConge.remarque
        });

        this.$toast.success('Congé ajouté avec succès');
        this.showCongeModal = false;
        this.resetNewConge();
        await this.getCongesByChauffeur();
      } catch (error) {
        console.error('Erreur lors de l\'ajout du congé:', error);
        this.$toast.error('Erreur lors de l\'ajout du congé');
      }
    },

    async deleteConge(id) {
      if (!confirm('Voulez-vous vraiment supprimer ce congé ?')) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/conges/${id}`);
        this.$toast.success('Congé supprimé avec succès');
        await this.getCongesByChauffeur();
      } catch (error) {
        console.error('Erreur lors de la suppression du congé:', error);
        this.$toast.error('Erreur lors de la suppression du congé');
      }
    },

    async addDocument() {
      try {
        const formData = new FormData();
        formData.append('type_document', this.newDocument.type_document);
        formData.append('numero', this.newDocument.numero);
        formData.append('date_expiration', this.newDocument.date_expiration);
        if (this.newDocument.fichier) {
          formData.append('fichier', this.newDocument.fichier);
        }

        const { data } = await axios.post(
          `http://localhost:3000/api/chauffeurs/${this.chauffeurId}/documents`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (!this.chauffeur.documents) {
          this.chauffeur.documents = [];
        }
        this.chauffeur.documents.push(data);
        this.showDocumentModal = false;
        this.resetNewDocument();
        this.$toast.success('Document ajouté avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du document:', error);
        this.$toast.error('Erreur lors de l\'ajout du document');
      }
    },

    async deleteDocument(documentId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

      try {
        await axios.delete(`http://localhost:3000/api/documents/${documentId}`);
        this.chauffeur.documents = this.chauffeur.documents.filter(d => d.id !== documentId);
        this.$toast.success('Document supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        this.$toast.error('Erreur lors de la suppression du document');
      }
    },

    async saveChanges() {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:3000/api/chauffeurs/${this.chauffeur.id}`,
      this.chauffeur,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Chauffeur modifié avec succès !");
    this.editMode = false;
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);

    // Vérifie que la structure existe avant d’y accéder
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Erreur inconnue";

    alert("Échec de la modification : " + message);
  }
},

    showMissionDetails(mission) {
      this.selectedMission = mission;
      this.showMissionModal = true;
    },
    
    closeMissionModal() {
      this.showMissionModal = false;
    },

    async terminerMission(missionId) {
      try {
        await axios.put(`http://localhost:3000/api/missions/${missionId}/terminer`);
        this.$toast.success('Mission terminée avec succès');
        this.closeMissionModal();
        await this.fetchMissions();
        await this.fetchChauffeur();
      } catch (error) {
        console.error('Erreur lors de la terminaison de la mission:', error);
        this.$toast.error('Erreur lors de la terminaison de la mission');
      }
    },

    viewDocument(doc) {
      window.open(`http://localhost:3000${doc.fichier_url}`, '_blank');
    },

    formatDateTime(date) {
      if (!date) return '-';
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(date).toLocaleString('fr-FR', options);
    },

    couleurEtat(etat) {
      const map = {
        'Dispo': 'success',
        'en mission': 'warning',
        'hors service': 'danger'
      };
      return map[etat] || 'secondary';
    },

    getStatusClass(etat) {
      const map = {
        'en attente': 'bg-info',
        'en cours': 'bg-primary',
        'terminer': 'bg-success',
        'annuler': 'bg-danger'
      };
      return map[etat] || 'bg-secondary';
    },

    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('fr-FR');
    },

    isExpired(date) {
      return date && new Date(date) < new Date();
    },

    getDocumentLabel(type) {
      const map = {
        'permis_conduire': 'Permis de conduire',
        'certificat_medical': 'Certificat médical',
        'certificat_capacite': 'Certificat de capacité',
        'cni': 'Carte d\'identité'
      };
      return map[type] || type;
    },

    calculerDuree(debut, fin) {
      const d1 = new Date(debut);
      const d2 = new Date(fin);
      const diff = Math.abs(d2 - d1);
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    handleFileUpload(event) {
      this.newDocument.fichier = event.target.files[0];
    },

    resetNewDocument() {
      this.newDocument = {
        type_document: 'permis_conduire',
        numero: '',
        date_expiration: '',
        fichier: null
      };
    },

    resetNewConge() {
      this.newConge = {
        type: 'Annuel',
        date_debut: '',
        date_fin: '',
        remarque: ''
      };
    }
  },
  mounted() {
    this.fetchChauffeur();
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
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  font-size: 4rem;
  color: #adb5bd;
}

.status-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-transform: capitalize;
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

.form-label {
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.25rem;
  display: block;
}

.fw-medium {
  font-weight: 500;
}

/* Classes pour les états */
.bg-primary {
  background-color: #0d6efd !important;
}

.bg-success {
  background-color: #198754 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #212529 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.bg-secondary {
  background-color: #6c757d !important;
}

.bg-info {
  background-color: #0dcaf0 !important;
}

@media (max-width: 992px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
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
