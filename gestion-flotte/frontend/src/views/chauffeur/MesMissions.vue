<template>
  <div class="container mt-4">
    <!-- En-tête avec filtre -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
      <h2 class="text-primary fw-bold mb-3 mb-md-0">
        <i class="bi bi-car-front-fill me-2"></i>Mes Missions Actives
      </h2>
      
      <div class="d-flex gap-2">
        <div class="input-group" style="width: 200px;">
          <span class="input-group-text bg-white"><i class="bi bi-funnel"></i></span>
          <select v-model="filtreEtat" class="form-select">
            <option value="">Tous les états</option>
            <option value="en attente">En attente</option>
            <option value="en cours">En cours</option>
            <option value="terminée">Terminée</option>
          </select>
        </div>
        
        <div class="input-group" style="width: 200px;">
          <span class="input-group-text bg-white"><i class="bi bi-calendar"></i></span>
          <input v-model="filtreDate" type="date" class="form-control">
        </div>
      </div>
    </div>

    <!-- Carte de statistiques -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card border-start border-4 border-primary h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-2">Missions en cours</h6>
                <h3 class="mb-0">{{ missionsEnCours.length }}</h3>
              </div>
              <div class="bg-primary bg-opacity-10 p-3 rounded">
                <i class="bi bi-speedometer2 text-primary fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card border-start border-4 border-warning h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-2">Missions en attente</h6>
                <h3 class="mb-0">{{ missionsEnAttente.length }}</h3>
              </div>
              <div class="bg-warning bg-opacity-10 p-3 rounded">
                <i class="bi bi-hourglass text-warning fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card border-start border-4 border-success h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-2">Missions terminées</h6>
                <h3 class="mb-0">{{ missionsTerminees.length }}</h3>
              </div>
              <div class="bg-success bg-opacity-10 p-3 rounded">
                <i class="bi bi-check-circle text-success fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucune mission -->
    <div v-if="missionsFiltrees.length === 0" class="alert alert-info text-center">
      <i class="bi bi-info-circle-fill me-2"></i>Aucune mission correspondant aux critères sélectionnés.
    </div>

    <!-- Tableau des missions -->
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr class="text-center">
            <th><i class="bi bi-calendar-event me-1"></i>#</th>
            <th><i class="bi bi-calendar-check me-1"></i>Date Début</th>
            <th><i class="bi bi-geo-alt me-1"></i>Destination</th>
            <th><i class="bi bi-car-front me-1"></i>Véhicule</th>
            <th><i class="bi bi-info-circle me-1"></i>État</th>
            <th><i class="bi bi-activity me-1"></i>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mission in missionsFiltrees" :key="mission.id" class="text-center">
            <td>
          <span v-if="mission.type_mission === 'aller'" class="text-primary">
            <i class="bi bi-arrow-up-circle me-1"></i> Aller
          </span>
          <span v-else-if="mission.type_mission === 'retour'" class="text-success">
            <i class="bi bi-arrow-down-circle me-1"></i> Retour
          </span>
          <span v-else-if="mission.type_mission === 'aller-retour'" class="text-warning">
            <i class="bi bi-arrow-left-right me-1"></i> Aller-Retour
          </span>
          <span v-else class="text-muted">
            <i class="bi bi-question-circle me-1"></i> Inconnu
          </span>
        </td>
            <td>
              <div v-if="mission.type_mission === 'aller'">
      {{ formatDate(mission.demande.date_heure_debut) }}
          </div>
          <div v-else-if="mission.type_mission === 'aller-retour'">
               {{ formatDate(mission.demande.date_heure_debut) }}
          </div>
          <div v-else-if="mission.type_mission === 'retour'">
             {{ formatDate(mission.demande.date_heure_fin) }}
          </div>
              </td>
            <td>{{ mission.demande.destination }}</td>
            <td>
              <span class="d-flex flex-column">
                <span><i class="bi bi-car-front me-1"></i>{{ mission.vehicule.marque }} {{ mission.vehicule.modele }}</span>
                <small class="text-muted"><i class="bi bi-123 me-1"></i>{{ mission.vehicule.immatriculation }}</small>
              </span>
            </td>
            <td>
              <span
                class="badge px-3 py-2 rounded-pill"
                :class="{
  'bg-warning text-dark': mission.etat === 'en attente',
  'bg-info text-white': mission.etat === 'en cours',
  'bg-success text-white': mission.etat === 'terminée',
  'bg-danger text-white': mission.etat === 'annuler',
  'bg-orange text-white': mission.etat === 'bloquer',
  'bg-secondary text-white': mission.etat === 'panne'
}"

              >
                {{ mission.etat }}
              </span>
            </td>
            <td>
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-outline-primary" v-if="mission.etat === 'en cours'"  @click="goToMissionMap(mission)" title="Voir sur la carte">
                  <i class="bi bi-map me-1"></i>Map
                </button>
                
                <button
                  v-if="mission.etat?.toLowerCase().trim() === 'en attente'"
                  class="btn btn-sm btn-outline-success"
                  :title="missionEnCoursExiste ? 'Une mission est déjà en cours' : 'Démarrer la mission'"
                  :disabled="missionsEnCours.length > 0"
                  @click="ouvrirChecklist(mission)">
                  <i class="bi bi-play-fill me-1"></i>Démarrer
                </button>

                <button
                  v-else-if="mission.etat === 'en cours'"
                  class="btn btn-sm btn-outline-danger"
                  @click="terminerMission(mission)"
                  title="Terminer la mission">
                  <i class="bi bi-stop-fill me-1"></i>Terminer
                </button>

                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="voirDetailsMission(mission)"
                  title="Voir les détails">
                  <i class="bi bi-eye-fill me-1"></i>Voir
                </button>

                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="ouvrirModalSignalement(mission)"
                  v-if="mission.etat === 'en cours'"
                  title="Signaler un incident">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>Signaler
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL INCIDENT -->
    <div v-if="incidentModal" class="modal-overlay" @click.self="fermerIncidentModal">
      <div class="modal-content bg-white rounded-4 p-4 shadow-lg border border-danger">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-bold text-danger mb-0">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Signaler un Incident
          </h4>
          <button class="btn-close" @click="fermerIncidentModal"></button>
        </div>

        <form @submit.prevent="validerEtEnvoyerIncident">
          <div class="mb-3">
            <label class="form-label fw-semibold">Type d'incident</label>
            <select v-model="incident.type" class="form-select border-danger" required>
              <option disabled value="">-- Sélectionner un type --</option>
              <option value="Panne"><i class="bi bi-tools me-2"></i>Panne</option>
              <option value="Retard"><i class="bi bi-clock me-2"></i>Retard</option>
              <option value="Accident"><i class="bi bi-car-front me-2"></i>Accident</option>
              <option value="Autre"><i class="bi bi-chat-square-text me-2"></i>Autre</option>
            </select>
          </div>

          <div v-if="incident.type && incident.type !== 'Retard'">
            <div class="mb-3">
              <label class="form-label fw-semibold">Intervention effectuée ?</label>
              <select v-model="incident.intervention" class="form-select border-danger" required>
                <option disabled value="">-- Sélectionner --</option>
                <option value="oui">✔ Oui</option>
                <option value="non">✖ Non</option>
              </select>
            </div>

            <div class="mb-3" v-if="incident.intervention === 'oui'">
              <label class="form-label fw-semibold">Description de l'intervention</label>
              <textarea
                v-model="incident.intervention_description"
                class="form-control border-danger"
                rows="3"
                placeholder="Exemple : J'ai changé le pneu crevé avec la roue de secours"
                required
              ></textarea>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">La mission peut-elle continuer ?</label>
            <select v-model="incident.mission_continue" class="form-select border-danger" required>
              <option disabled value="">-- Sélectionner --</option>
              <option value="oui">✔ Oui</option>
              <option value="non">✖ Non</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Description de l'incident</label>
            <textarea
              v-model="incidentMessage"
              class="form-control border-danger"
              rows="4"
              placeholder="Décrivez brièvement ce qui s'est passé..."
              required
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Photo (optionnelle)</label>
            <div class="input-group">
              <input
                type="file"
                class="form-control border-danger"
                accept="image/*"
                @change="e => incidentPhoto = e.target.files[0]"
              >
              <button class="btn btn-outline-secondary" type="button" @click="incidentPhoto = null" v-if="incidentPhoto">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="fermerIncidentModal">
              <i class="bi bi-x-circle me-1"></i>Annuler
            </button>
            <button type="submit" class="btn btn-danger text-white fw-bold">
              <i class="bi bi-send-fill me-1"></i>Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL CHECKLIST -->
    <div v-if="showModal" class="modal-overlay" @click.self="fermerChecklist">
      <div class="modal-content bg-white rounded-4 p-4 shadow-lg" style="max-width: 600px;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0 fw-bold">
            <i class="bi bi-clipboard-check me-2"></i>
            Checklist - {{ typeControle === 'AVANT_MISSION' ? 'Avant Mission' : 'Après Mission' }}
          </h4>
          <button class="btn-close" @click="fermerChecklist"></button>
        </div>

        <div class="border p-3 rounded bg-light mb-4">
          <p class="mb-1"><strong><i class="bi bi-geo-alt me-2"></i>Destination :</strong> {{ missionSelectionnee.demande.destination }}</p>
          <p class="mb-1"><strong><i class="bi bi-car-front me-2"></i>Véhicule :</strong> {{ missionSelectionnee.vehicule.marque }} {{ missionSelectionnee.vehicule.modele }} ({{ missionSelectionnee.vehicule.immatriculation }})</p>
        </div>

        <div v-if="currentQuestionIndex < checklist.length" class="card p-4 border-0 shadow-sm mb-3">
          <div class="text-center mb-3">
            <div class="display-4 mb-2 text-primary">
              <i :class="checklist[currentQuestionIndex].icon"></i>
            </div>
            <div v-if="checklist[currentQuestionIndex].image" class="mb-3">
              <img :src="checklist[currentQuestionIndex].image" alt="Illustration" class="img-fluid rounded" style="max-height: 150px;" />
            </div>
            <h5 class="fw-semibold">{{ checklist[currentQuestionIndex].text }}</h5>
          </div>

          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button
              v-for="option in checklist[currentQuestionIndex].options"
              :key="option.value"
              class="btn rounded-pill px-3"
              :class="option.class"
              @click="setDynamicResponse(option.value)">
              <i :class="option.icon" class="me-1"></i>{{ option.label }}
            </button>
          </div>
        </div>

        <div v-else class="text-center">
          <div class="alert alert-success mb-4">
            <i class="bi bi-check-circle-fill me-2"></i>Checklist complétée
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-semibold">Kilométrage actuel</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-speedometer2"></i></span>
              <input 
                v-model="kilometrage" 
                class="form-control" 
                type="number" 
                placeholder="Ex: 125000" 
                required
              >
            </div>
            <small class="text-danger" v-if="showError && !kilometrage">
              <i class="bi bi-exclamation-circle-fill me-1"></i>Le kilométrage est obligatoire.
            </small>
          </div>
          
          <div class="mb-4">
            <label class="form-label fw-semibold">Remarques (facultatif)</label>
            <textarea 
              v-model="remarques" 
              class="form-control" 
              rows="3" 
              placeholder="Ajoutez des remarques si nécessaire..."
            ></textarea>
          </div>

          <!-- Section pour les remarques du prochain départ (visible seulement après mission) -->
          <div class="mb-4" v-if="typeControle === 'APRES_MISSION'">
            <label class="form-label fw-semibold">Remarques pour le prochain départ</label>
            <textarea 
              v-model="remarquesProchainDepart" 
              class="form-control" 
              rows="2" 
              placeholder="Ex: Pression des pneus à vérifier, niveau d'huile bas..."
            ></textarea>
          </div>
          
          <button class="btn btn-primary px-4" @click="validerChecklist">
            <i class="bi bi-check-circle-fill me-2"></i>Enregistrer
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DÉTAILS MISSION -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="fermerDetails">
      <div class="modal-content bg-light rounded-4 p-4 shadow-lg" style="max-width: 900px; border: 4px solid #f7b731;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0 fw-bold text-dark">
            <i class="bi bi-info-circle-fill me-2"></i>Détails de la Mission
          </h4>
          <button class="btn btn-sm btn-outline-dark" @click="fermerDetails">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div v-if="loadingDetails" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="mt-3 text-secondary">
            <i class="bi bi-hourglass-split me-2"></i>Chargement des détails...
          </p>
        </div>

        <div v-else-if="missionDetails" class="mission-details">
          <div class="row g-4">
            <!-- Demandeur -->
            <div class="col-md-6">
              <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-primary">
                <h5 class="text-primary fw-semibold mb-2">
                  <i class="bi bi-person-badge me-2"></i>Demandeur
                </h5>
                <p class="mb-1"><strong>Nom :</strong> {{  missionDetails.demande?.utilisateur?.nom  || 'N/A' }} {{  missionDetails.demande?.utilisateur?.prenom || '' }}</p>
                <p class="mb-1"><strong>Fonction :</strong> {{ missionDetails.demande?.utilisateur?.fonction }}</p>
                <p class="mb-1"><strong>Numéro de téléphone :</strong> {{ missionDetails.demande?.utilisateur?.numero_telephone }}</p>
              </div>
            </div>

            <!-- Véhicule -->
            <div class="col-md-6">
              <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-success">
                <h5 class="text-primary fw-semibold mb-2">
                  <i class="bi bi-car-front me-2"></i>Véhicule
                </h5>
                <p class="mb-1"><strong>Modèle :</strong> {{ missionDetails.vehicule.marque }} {{ missionDetails.vehicule.modele }}</p>
                <p class="mb-1"><strong>Immatriculation :</strong> {{ missionDetails.vehicule.immatriculation }}</p>
                <p class="mb-1"><strong>Kilométrage :</strong> {{ missionDetails.vehicule.kilometrage }}</p>
              </div>
            </div>
            
            <!-- Détails mission -->
            <div class="col-md-6">
              <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-info">
                <h5 class="text-primary fw-semibold mb-2">
                  <i class="bi bi-calendar2-event me-2"></i>Dates
                </h5>
                <p class="mb-1"><strong>Début :</strong> {{ formatDate(missionDetails.demande.date_heure_debut) }}</p>
                <p class="mb-1"><strong>Fin :</strong> {{ formatDate(missionDetails.demande.date_heure_fin) }}</p>
                <p class="mb-1"><strong>Durée :</strong> {{ calculerDuree(missionDetails.demande.date_heure_debut, missionDetails.demande.date_heure_fin) }}</p>
              </div>
            </div>
            
            <!-- Itinéraire -->
            <div class="col-md-6">
              <div class="p-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                <h5 class="text-primary fw-semibold mb-2">
                  <i class="bi bi-signpost-2 me-2"></i>Itinéraire
                </h5>
                <p class="mb-1"><strong>Destination :</strong> {{ missionDetails.demande.destination }}</p>
                <p class="mb-1"><strong>Itineraire :</strong> {{ missionDetails.demande.itineraire }} </p>
                <p class="mb-1"><strong>Points de passage :</strong> {{ missionDetails.points_passage || 'Aucun' }}</p>
              </div>
            </div>
            
            
          </div>
        </div>

        <div v-else class="alert alert-danger mt-4 text-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>Impossible de charger les détails de la mission
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "MesMissions",
  data() {
    return {
      showMap: false,
      map: null,
      marker: null,
      missionRoutes: [],
      // Incident
      incidentModal: false,
      incident: {
        type: '',
        intervention: '',
        intervention_description: '',
        mission_continue: ''
      },
      missionIncident: null,
      incidentMessage: '',
      incidentPhoto: null,
      selectedMission: null,
      // Missions
      missions: [],
      showModal: false,
      missionSelectionnee: null,
      typeControle: 'AVANT_MISSION',
      currentQuestionIndex: 0,
      kilometrage: null,
      remarques: '',
      remarquesProchainDepart: '', // Nouveau champ pour les remarques du prochain départ
      showError: false,
      missionDetails: null,
      showDetailsModal: false,
      loadingDetails: false,
      // Filtres
      filtreEtat: '',
      filtreDate: '',
      checklist: [
        {
          field: "niveau_huile",
          text: "Niveau d'huile",
          icon: "bi bi-droplet-fill",
          image: require("@/assets/huile.jpg"),
          options: [
            { label: "Correct", value: "CORRECT", class: "btn-success", icon: "bi bi-check-circle-fill" },
            { label: "Bas", value: "BAS", class: "btn-warning", icon: "bi bi-exclamation-triangle-fill" },
            { label: "Vide", value: "VIDE", class: "btn-danger", icon: "bi bi-x-circle-fill" }
          ],
          reponse: null
        },
        {
          field: "pression_pneus",
          text: "Pression des pneus",
          icon: "bi bi-circle-fill",
          image: require("@/assets/pneus.png"),
          options: [
            { label: "Normale", value: "NORMALE", class: "btn-success", icon: "bi bi-check-circle-fill" },
            { label: "Basse", value: "BASSE", class: "btn-warning", icon: "bi bi-exclamation-triangle-fill" },
            { label: "À plat", value: "A_PLAT", class: "btn-danger", icon: "bi bi-x-circle-fill" }
          ],
          reponse: null
        },
        {
          field: "phares",
          text: "Phares",
          icon: "bi bi-lightbulb-fill",
          image: require("@/assets/phares.jpg"),
          options: [
            { label: "Fonctionnels", value: "FONCTIONNELS", class: "btn-success", icon: "bi bi-check-circle-fill" },
            { label: "Inefficaces", value: "INEFFICACES", class: "btn-warning", icon: "bi bi-exclamation-triangle-fill" },
            { label: "Défaillants", value: "DEFAILLANTS", class: "btn-danger", icon: "bi bi-x-circle-fill" }
          ],
          reponse: null
        },
        {
          field: "freins",
          text: "Freins",
          icon: "bi bi-brake-pad-fill",
          image: require("@/assets/freins.png"),
          options: [
            { label: "Fonctionnels", value: "FONCTIONNELS", class: "btn-success", icon: "bi bi-check-circle-fill" },
            { label: "Inefficaces", value: "INEFFICACES", class: "btn-warning", icon: "bi bi-exclamation-triangle-fill" },
            { label: "Défaillants", value: "DEFAILLANTS", class: "btn-danger", icon: "bi bi-x-circle-fill" }
          ],
          reponse: null
        },
        {
          field: "ceintures",
          text: "Ceintures de sécurité",
          icon: "bi bi-shield-check",
          image: require("@/assets/centure.png"),
          options: [
            { label: "OK", value: "OK", class: "btn-success", icon: "bi bi-check-circle-fill" },
            { label: "Non conformes", value: "NON_CONFORMES", class: "btn-danger", icon: "bi bi-x-circle-fill" }
          ],
          reponse: null
        },
        {
          field: "niveau_carburant",
          text: "Niveau de carburant",
          icon: "bi bi-fuel-pump-fill",
          image: require("@/assets/carburant.png"),
          options: [
            { label: "Plein", value: "PLEIN", class: "btn-success", icon: "bi bi-check-circle-fill" },
            { label: "3/4", value: "3/4", class: "btn-info", icon: "bi bi-check-circle-fill" },
            { label: "1/2", value: "1/2", class: "btn-info", icon: "bi bi-check-circle-fill" },
            { label: "1/4", value: "1/4", class: "btn-warning", icon: "bi bi-exclamation-triangle-fill" },
            { label: "Vide", value: "VIDE", class: "btn-danger", icon: "bi bi-x-circle-fill" }
          ],
          reponse: null
        }
      ]
    };
  },
  computed: {
    missionsEnCours() {
      return this.missions.filter(m => m.etat?.toLowerCase().trim() === 'en cours');
    },
    missionsAnnuler() {
      return this.missions.filter(m => m.etat?.toLowerCase().trim() === 'annuler');
    },
    
    missionsEnAttente() {
      return this.missions.filter(m => m.etat?.toLowerCase().trim() === 'en attente');
    },
    missionsTerminees() {
      return this.missions.filter(m => m.etat?.toLowerCase().trim() === 'terminée');
    },
    missionsActives() {
      return this.missions.filter(m => m.etat !== "terminer");
    },
    missionEnCoursExiste() {
      return this.missionsEnCours.length > 0;
    },
    missionsFiltrees() {
      let missions = this.missionsActives;
      
      if (this.filtreEtat) {
        missions = missions.filter(m => m.etat?.toLowerCase().trim() === this.filtreEtat.toLowerCase().trim());
      }
      
      if (this.filtreDate) {
        const dateFiltre = new Date(this.filtreDate);
        missions = missions.filter(m => {
          const dateDebut = new Date(m.demande.date_heure_debut);
          return dateDebut.toDateString() === dateFiltre.toDateString();
        });
      }
      
      return missions;
    }
  },
  methods: {
    async chargerMissions() {
      try {
        const response = await axios.get("http://localhost:3000/api/missions");
        this.missionRoutes = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des missions :", error.message);
      }
    },
    // Fonctions incident
    ouvrirIncidentModal(mission) {
      this.missionIncident = mission;
      this.incidentMessage = '';
      this.incidentPhoto = null;
      this.incidentModal = true;
    },
    fermerIncidentModal() {
      this.incidentModal = false;
      this.missionIncident = null;
      this.incidentMessage = '';
      this.incidentPhoto = null;
      this.incident = {
        type: '',
        intervention: '',
        intervention_description: '',
        mission_continue: ''
      };
    },
    ouvrirModalSignalement(mission) {
      this.selectedMission = mission;
      this.incidentModal = true;
      this.incident = {
        type: '',
        intervention: '',
        intervention_description: '',
        mission_continue: ''
      };
      this.incidentMessage = '';
      this.incidentPhoto = null;
    },
    async validerEtEnvoyerIncident() {
      if (!this.incident.type) {
        Swal.fire("Erreur", "Veuillez sélectionner un type d'incident", "warning");
        return;
      }

      if (!this.incident.mission_continue) {
        Swal.fire("Erreur", "Veuillez indiquer si la mission peut continuer", "warning");
        return;
      }

      if (!this.incidentMessage) {
        Swal.fire("Erreur", "Le message est requis", "warning");
        return;
      }

      if (!this.selectedMission || !this.selectedMission.id) {
        Swal.fire("Erreur", "Aucune mission sélectionnée", "warning");
        return;
      }

      if ((this.incident.type !== 'Retard') && !this.incident.intervention) {
        Swal.fire("Erreur", "Veuillez indiquer si une intervention a été faite", "warning");
        return;
      }

      if (this.incident.intervention === 'oui' && !this.incident.intervention_description) {
        Swal.fire("Erreur", "Veuillez décrire l'intervention effectuée", "warning");
        return;
      }

      const formData = new FormData();
      formData.append("type", this.incident.type);
      formData.append("description", this.incidentMessage);
      formData.append("mission_id", this.selectedMission.id);
      formData.append("chauffeur_id", JSON.parse(localStorage.getItem("user")).id);
      formData.append("date_signalement", new Date().toISOString());

      formData.append("intervention_demandee", this.incident.type !== 'Retard' ? this.incident.intervention : "non");

      if (this.incident.intervention === "oui") {
        formData.append("intervention_description", this.incident.intervention_description);
      }

      formData.append("mission_continue", this.incident.mission_continue);

      if (this.incidentPhoto) {
        formData.append("photo", this.incidentPhoto);
      }

      try {
        const token = localStorage.getItem("token");

        await axios.post("http://localhost:3000/api/missions/signalements", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        Swal.fire({
          title: "Succès",
          text: "Incident signalé avec succès",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#198754"
        });
        
        this.fermerIncidentModal();
        this.incident = {
          type: "",
          intervention: "",
          intervention_description: "",
          mission_continue: "",
        };
        this.incidentMessage = "";
        this.incidentPhoto = null;
      } catch (error) {
        console.error("Erreur lors du signalement :", error);
        Swal.fire({
          title: "Erreur",
          text: error.response?.data?.message || "Échec de l'envoi",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545"
        });
      }
    },
    goToMissionMap(mission) {
      localStorage.setItem('currentMission', JSON.stringify(mission));
      this.$router.push('/chauffeur/mission-map');
    },
    async fetchMissions() {
      try {
        const token = localStorage.getItem("token");
        const utilisateur = JSON.parse(localStorage.getItem("user"));
        const res = await axios.get("http://localhost:3000/api/missions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.missions = res.data.filter(m =>
          m.chauffeur?.utilisateur?.nom === utilisateur.nom &&
          m.chauffeur?.utilisateur?.prenom === utilisateur.prenom
        );
      } catch (error) {
        console.error("Erreur lors du chargement des missions:", error);
        Swal.fire({
          title: "Erreur",
          text: "Impossible de charger les missions",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545"
        });
      }
    },
    formatDate(d) {
      return new Date(d).toLocaleString("fr-FR");
    },
    calculerDuree(debut, fin) {
      const diff = new Date(fin) - new Date(debut);
      const heures = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${heures}h${minutes.toString().padStart(2, '0')}`;
    },
   badgeClass(etat) {
  return {
    "badge rounded-pill": true,
    "bg-warning text-dark": etat?.toLowerCase() === "en attente",
    "bg-info text-white": etat?.toLowerCase() === "en cours",
    "bg-success": etat?.toLowerCase() === "terminer",
    "bg-danger": etat?.toLowerCase() === "annuler",
    "bg-orange": etat?.toLowerCase() === "bloquer"
  };
},
    ouvrirChecklist(m) {
      console.log("Mission reçue :", m);
      this.typeControle = 'AVANT_MISSION';
      this.missionSelectionnee = m;
      this.resetChecklist();
      this.showModal = true;
    },
    terminerMission(m) {
      this.typeControle = 'APRES_MISSION';
      this.missionSelectionnee = m;
      this.resetChecklist();
      this.showModal = true;
    },
    fermerChecklist() {
      this.showModal = false;
      this.currentQuestionIndex = 0;
      this.kilometrage = null;
      this.remarques = '';
      this.remarquesProchainDepart = '';
      this.showError = false;
    },
    resetChecklist() {
      this.checklist.forEach(q => q.reponse = null);
      this.currentQuestionIndex = 0;
    },
    setDynamicResponse(value) {
      this.checklist[this.currentQuestionIndex].reponse = value;
      this.currentQuestionIndex++;
    },


    async validerChecklist() {
      if (!this.kilometrage) {
        this.showError = true;
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        const nonConformes = this.checklist.filter(item =>
          ["BAS", "VIDE", "A_PLAT", "INEFFICACES", "DEFAILLANTS", "NON_CONFORMES", "1/4"].includes(item.reponse)
        );
        const estValide = nonConformes.length === 0;

        const vehiculeId = this.missionSelectionnee.vehicule_id || this.missionSelectionnee.vehicule?.id;
        if (!vehiculeId) {
          Swal.fire("Erreur", "Véhicule non trouvé pour la mission sélectionnée", "error");
          return;
        }

        const payload = {
          mission_id: this.missionSelectionnee.id,
          vehicule_id: vehiculeId,
          chauffeur_id: this.missionSelectionnee.chauffeur_id || this.missionSelectionnee.chauffeur?.id,
          type_controle: this.typeControle,
          kilometrage: this.kilometrage,
          remarques: this.remarques,
          remarques_prochain_depart: this.remarquesProchainDepart, // Ajout des remarques pour le prochain départ
          valide: estValide ? 1 : 0
        };

        this.checklist.forEach(item => {
          payload[item.field] = item.reponse;
        });

        

        // Envoi de notification si non conforme
        if (!estValide) {
          await axios.post("http://localhost:3000/api/checklists", payload, {
            headers: {Authorization: `Bearer ${token}`}
          });
          
          try {
            await axios.post("http://localhost:3000/api/notifications", {
              type: "ALERTE",
              titre: "Checklist non conforme",
              message: `Le véhicule de la mission ${payload.mission_id} présente des anomalies après contrôle ${this.typeControle === "APRES_MISSION" ? "final" : "initial"}.`,
              utilisateur_id: user.id,
              recepteur_id: 22
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (notifError) {
            console.warn("Erreur lors de l'envoi de la notification :", notifError);
          }

          if (this.typeControle === "AVANT_MISSION") {
            await axios.put(`http://localhost:3000/api/missions/${payload.mission_id}`, {
              etat: "bloquer"
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            Swal.fire({
              title: "Checklist non valide",
              text: "La mission est bloquée et ne peut pas être démarrée.",
              icon: "warning",
              confirmButtonText: "OK",
              confirmButtonColor: "#ffc107"
            });
            this.fermerChecklist();
            return;
          }

          Swal.fire({
            title: "Alerte",
            text: "Checklist non conforme signalée au responsable.",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#ffc107"
          });
        }

        await axios.post("http://localhost:3000/api/checklists", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Mise à jour de mission si checklist valide
        if (estValide && payload.mission_id) {
          const etat = this.typeControle === 'AVANT_MISSION' ? 'en cours' : 'terminer'
          const dateField = this.typeControle === 'AVANT_MISSION' ? 'date_depart' : 'date_retour';
          

          await axios.put(`http://localhost:3000/api/missions/${payload.mission_id}`, {
            etat,
            [dateField]: new Date()
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          Swal.fire({
            title: "Succès",
            text: "Checklist enregistrée et mission mise à jour",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#198754"
          });
        }
// 🔹 Mise à jour du kilométrage du véhicule
if (this.typeControle === 'APRES_MISSION' && vehiculeId) {
  try {
    await axios.put(`http://localhost:3000/api/vehicules/${vehiculeId}`, {
      kilometrage: this.kilometrage
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`Kilométrage du véhicule ${vehiculeId} mis à jour à ${this.kilometrage}`);
  } catch (vehiculeError) {
    console.error("Erreur lors de la mise à jour du véhicule :", vehiculeError);
    Swal.fire({
      title: "Erreur",
      text: "Impossible de mettre à jour le kilométrage du véhicule",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#dc3545"
    });
  }
}
// 🔹 Mise à jour du kilométrage et de l'état de la mission après validation
if (this.typeControle === 'APRES_MISSION' && vehiculeId) {
  try {
    await axios.put(`http://localhost:3000/api/vehicules/${vehiculeId}`, {
      kilometrage: this.kilometrage
    }, { headers: { Authorization: `Bearer ${token}` } });

    await axios.put(`http://localhost:3000/api/missions/${payload.mission_id}`, {
      etat: 'terminer',
      date_retour: new Date()
    }, { headers: { Authorization: `Bearer ${token}` } });

    console.log(`Kilométrage du véhicule ${vehiculeId} mis à jour et mission ${payload.mission_id} terminée`);
  } catch (vehiculeError) {
    console.error("Erreur mise à jour véhicule/mission :", vehiculeError);
  }
}
        this.fermerChecklist();
        await this.fetchMissions();

      } catch (error) {
        console.error("Erreur validation checklist:", error);
        Swal.fire({
          title: "Erreur",
          text: error.response?.data?.message || "Échec de la validation",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545"
        });
      }
    },
    async voirDetailsMission(mission) {
      try {
        this.loadingDetails = true;
        this.showDetailsModal = true;

        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/missions/${mission.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.missionDetails = response.data;
        
        // Initialiser la mini carte si des coordonnées sont disponibles
        this.$nextTick(() => {
          if (this.missionDetails.coordonnees) {
            this.initMiniMap();
          }
        });
      } catch (error) {
        console.error("Erreur détails mission:", error);
        this.missionDetails = null;
        Swal.fire({
          title: "Erreur",
          text: "Impossible de charger les détails de la mission",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545"
        });
      } finally {
        this.loadingDetails = false;
      }
    },
    initMiniMap() {
      if (!this.missionDetails?.coordonnees) return;
      
      try {
        const coords = this.missionDetails.coordonnees.split(',');
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        
        const miniMap = L.map('miniMap').setView([lat, lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(miniMap);
        
        L.marker([lat, lng]).addTo(miniMap)
          .bindPopup('Destination: ' + this.missionDetails.demande.destination);
          
      } catch (e) {
        console.error("Erreur initialisation mini map:", e);
      }
    },
    fermerDetails() {
      this.showDetailsModal = false;
      this.missionDetails = null;
      this.loadingDetails = false;
    }
  },
  mounted() {
    this.chargerMissions();
    this.fetchMissions();
  }
};
</script>

<style scoped>
/* Styles globaux */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

/* Cartes de statistiques */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

/* Tableau */
.table {
  font-size: 0.9rem;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}
.bg-orange {
  background-color:  #0e0155dc !important;
  color: white !important;
}
.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  background-color: #f8f9fa;
  padding: 1rem;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

/* Badges */
.badge {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.5em 0.75em;
  min-width: 90px;
}

/* Boutons */
.btn {
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}

.btn-outline-success:hover {
  background-color: #198754;
  color: white;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeIn 0.3s ease-out;
  border: none;
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Checklist */
.checklist-question {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}

.checklist-options .btn {
  margin: 0.25rem;
  min-width: 120px;
  transition: transform 0.2s;
}

.checklist-options .btn:hover {
  transform: scale(1.05);
}

/* Inputs */
.form-control, .form-select {
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Icônes */
.bi {
  vertical-align: middle;
}

/* Responsive */
@media (max-width: 768px) {
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .btn-group-vertical {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-group-vertical .btn {
    margin-bottom: 0.5rem;
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    padding: 1rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .input-group {
    width: 100% !important;
  }
}

/* Détails mission */
.mission-details .col-md-6 {
  margin-bottom: 1.5rem;
}

.border-primary { border-left-color: #0d6efd !important; }
.border-success { border-left-color: #198754 !important; }
.border-info { border-left-color: #0dcaf0 !important; }
.border-warning { border-left-color: #ffc107 !important; }
.border-danger { border-left-color: #dc3545 !important; }

/* Cartes de détails */
.detail-card {
  height: 100%;
  transition: all 0.3s ease;
}

.detail-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Mini map */
#miniMap {
  border: 1px solid #dee2e6;
}
</style>