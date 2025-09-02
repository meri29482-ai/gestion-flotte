<template>
  <div class="container-fluid py-4 px-4 bg-light-subtle min-vh-100">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h3 class="fw-semibold text-dark mb-0">
          <i class="bi bi-speedometer2 me-2"></i>Gestion des Missions
        </h3>
        <p class="text-muted mb-0 small">Suivi et gestion des missions en cours</p>
      </div>
      
      <div class="d-flex gap-2 align-items-center">
        <div class="input-group input-group-sm" style="width: 260px;">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="recherche"
            type="search"
            placeholder="Rechercher une mission..."
            class="form-control border-start-0 ps-0"
          />
        </div>
        <button class="btn btn-sm btn-primary" @click="ouvrirNouvelleMission">
          <i class="bi bi-plus-lg me-1"></i>Nouvelle
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="afficherHistorique">
          <i class="bi bi-clock-history me-1"></i>Historique
        </button>
      </div>
    </div>

    <!-- Bouton calendrier -->
    <button class="btn btn-toggle-calendar" @click="showCalendar = !showCalendar">
      <i :class="showCalendar ? 'fas fa-calendar-minus' : 'fas fa-calendar-plus'"></i>
      {{ showCalendar ? 'Masquer le calendrier' : 'Afficher le calendrier' }}
    </button>

    <!-- Calendrier -->
    <transition name="slide-fade">
      <MissionCalendar 
        v-if="showCalendar"
        :missions="missions"
        :openAddModal="openAddModalWithDate"
        :openEditModal="ouvrirModifier"
        @close="showCalendar = false"
        class="mb-4"
      />
    </transition>
    
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>N° d'ordre</th>
                <th>Type</th>
                <th class="ps-4">Véhicule</th>
                <th>Chauffeur</th>
                <th>Départ</th>
                <th>Retour</th>
                <th>Destination</th>
                <th>État</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(missionsGroupees, nOrdre) in missionsGroupedByOrder" :key="nOrdre">
 <tr 
  v-for="(mission, index) in missionsGroupees" 
  :key="mission.id"
  class="hover-shadow"
  :class="[
    {'border-bottom-0': index < missionsGroupees.length - 1},
    mission.probleme === 'oui' ? 'ligne-probleme' : ''
  ]"
>
    <!-- Numéro d'ordre (affiché uniquement pour la première mission du groupe) -->
    <td v-if="index === 0" :rowspan="missionsGroupees.length">
      <span class="text-truncate d-inline-block" style="max-width: 150px;">
        {{ nOrdre || '—' }}
      </span>
    </td>

    <td v-else class="d-none"></td> <!-- Cellule cachée pour maintenir la structure -->

    <td>
      <span class="badge bg-light text-dark text-uppercase d-flex align-items-center gap-1">
        <i :class="getTypeMissionIcon(mission.type_mission)"></i>
        {{ getTypeMissionText(mission.type_mission) }}
      </span>
    </td>

    <td class="ps-4">
      <div v-if="mission.vehicule" class="d-flex align-items-center gap-2">
        <i class="bi bi-car-front-fill text-primary"></i>
        <span class="fw-medium">{{ mission.vehicule.immatriculation }}</span>
      </div>
      <span v-else class="text-muted">—</span>
    </td>

    <td>
      <div v-if="mission.chauffeur?.utilisateur" class="d-flex align-items-center gap-2">
        <i class="bi bi-person-circle text-secondary"></i>
        <span>{{ mission.chauffeur.utilisateur.nom }} {{ mission.chauffeur.utilisateur.prenom }}</span>
      </div>
      <span v-else class="text-muted">—</span>
    </td>

    <td>{{ formatDate(mission.date_depart) }}</td>
    <td>{{ formatDate(mission.date_routour) }}</td>

    <td>
      <span class="text-truncate d-inline-block" style="max-width: 150px;">
        {{ mission.demande?.destination || '—' }}
      </span>
    </td>

    <td>
      <span class="badge text-uppercase px-2 py-1 rounded-pill" :class="getClasseEtat(mission.etat)">
        {{ getEtatText(mission.etat) }}
      </span>
    </td>

    <td class="text-end pe-4">
      <div class="d-flex justify-content-end gap-2">
        <button 
          class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" 
          style="width: 32px; height: 32px;"
          @click="ouvrirModifier(mission)"
          title="Modifier"
        >
          <i class="bi bi-pencil"></i>
        </button>

        <button 
          class="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
          style="width: 32px; height: 32px;"
          @click="ouvrirDetails(mission)"
          title="Détails"
        >
          <i class="bi bi-eye"></i>
        </button>
      </div>
    </td>
  </tr>
</template>
              <tr v-if="missionsFiltrees.length === 0">
                <td colspan="9" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-4 d-block mb-2"></i>
                  Aucune mission trouvée
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DETAILS -->
    <div v-if="missionDetailsVisible" class="modal-backdrop d-flex justify-content-center align-items-center">
      <div class="modal-content bg-white shadow-lg p-4 rounded-4" style="width: 90%; max-width: 700px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold mb-0">
            <i class="bi bi-card-checklist text-primary me-2"></i>
            Détails de la Mission
          </h5>
          <button type="button" class="btn-close" @click="missionDetailsVisible = false"></button>
        </div>
        
        <div class="row g-3">
          <div class="col-md-6">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Véhicule</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-car-front me-2"></i>
                {{ missionSelectionnee.vehicule?.immatriculation || '—' }}
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Chauffeur</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-person me-2"></i>
                {{ missionSelectionnee.chauffeur?.utilisateur 
                  ? missionSelectionnee.chauffeur.utilisateur.nom + ' ' + missionSelectionnee.chauffeur.utilisateur.prenom 
                  : '—' }}
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Type de mission</p>
              <p class="fw-medium mb-0">
                <i :class="getTypeMissionIcon(missionSelectionnee.type_mission) + ' me-2'"></i>
                {{ getTypeMissionText(missionSelectionnee.type_mission) }}
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Intervention</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-tools me-2"></i>
                {{ missionSelectionnee.intervention === 'oui' ? 'Oui' : 'Non' }}
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Date départ</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-calendar-event me-2"></i>
                {{ formatDate(missionSelectionnee.date_depart) }}
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Date retour</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-calendar-check me-2"></i>
                {{ formatDate(missionSelectionnee.date_routour) }}
              </p>
            </div>
          </div>
          <div class="col-12">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Destination</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-geo-alt me-2"></i>
                {{ missionSelectionnee.demande?.destination || '—' }}
              </p>
            </div>
          </div>
          <div class="col-12">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Itinéraire</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-signpost me-2"></i>
                {{ missionSelectionnee.demande?.itineraire || '—' }}
              </p>
            </div>
          </div>
          <div class="col-12">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">Observation</p>
              <p class="fw-medium mb-0">
                <i class="bi bi-chat-left-text me-2"></i>
                {{ missionSelectionnee.demande?.observation || 'Aucune observation' }}
              </p>
            </div>
          </div>
          <div class="col-12">
            <div class="bg-light p-3 rounded-3">
              <p class="mb-1 small text-muted">État</p>
              <p class="fw-medium mb-0">
                <span class="badge text-uppercase px-2 py-1 rounded-pill" :class="getClasseEtat(missionSelectionnee.etat)">
                  {{ getEtatText(missionSelectionnee.etat) }}
                </span>
              </p>
            </div>
          </div>
          <!-- Position du véhicule avec carte OpenStreetMap -->
          <div class="col-12" v-if="missionSelectionnee.etat === 'en cours' && missionSelectionnee.vehicule">
            <div class="bg-light p-3 rounded-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <p class="mb-1 small text-muted">Position actuelle du véhicule</p>
                  <p class="fw-medium mb-0">
                    <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                    <span v-if="positionVehicule">
                      {{ positionVehicule.latitude.toFixed(6) }}, {{ positionVehicule.longitude.toFixed(6) }}
                    </span>
                    <span v-else>
                      Position non disponible
                    </span>
                  </p>
                </div>
                <button class="btn btn-sm btn-outline-primary" @click="getPositionVehicule(missionSelectionnee.id)">
                  <i class="bi bi-arrow-repeat me-1"></i>Actualiser
                </button>
              </div>
              <div class="mt-3" style="height: 300px;" v-if="positionVehicule">
                <div id="map-container" style="height: 100%; width: 100%; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-outline-secondary rounded-3" @click="missionDetailsVisible = false">
            <i class="bi bi-x-lg me-1"></i> Fermer
          </button>
          <button 
            class="btn btn-success rounded-3" 
            @click="terminerMission(missionSelectionnee)"
            v-if="missionSelectionnee.etat === 'en cours'"
          >
            <i class="bi bi-check-circle me-1"></i> Terminer
          </button>
          <button 
            class="btn btn-danger rounded-3" 
            @click="annulerMission(missionSelectionnee)"
            v-if="missionSelectionnee.etat !== 'terminer' && missionSelectionnee.etat !== 'annuler'"
          >
            <i class="bi bi-x-circle me-1"></i> Annuler
          </button>
          <button 
            class="btn btn-info rounded-3" 
            @click="genererFeuilleRoute(missionSelectionnee.id)"
          >
            <i class="bi bi-download me-1"></i> Feuille de route
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL MODIFIER -->
    <div v-if="missionModifierVisible" class="modal-backdrop d-flex justify-content-center align-items-center">
      <div class="modal-content bg-white shadow-lg p-4 rounded-4" style="width: 90%; max-width: 700px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold mb-0">
            <i class="bi bi-pencil-square text-primary me-2"></i>
            {{ missionSelectionnee.id ? 'Modifier Mission' : 'Nouvelle Mission' }}
          </h5>
          <button type="button" class="btn-close" @click="fermerModaleModification"></button>
        </div>
        
        <form @submit.prevent="enregistrerModification">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Numéro d'ordre</label>
              <input 
                v-model="missionSelectionnee.demande.n_ordre" 
                type="text" 
                class="form-control" 
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Type de mission</label>
              <select v-model="missionSelectionnee.type_mission" class="form-select" required @change="handleTypeMissionChange">
                <option value="aller">Aller</option>
                <option value="retour">Retour</option>
                <option value="aller-retour">Aller-retour</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Date Départ</label>
              <input 
                v-model="missionSelectionnee.date_depart" 
                type="date" 
                class="form-control" 
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Date Retour</label>
              <input 
                v-model="missionSelectionnee.date_routour" 
                type="date" 
                class="form-control" 
                :required="missionSelectionnee.type_mission !== 'aller'"
                :disabled="missionSelectionnee.type_mission === 'aller'"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Intervention</label>
              <select v-model="missionSelectionnee.intervention" class="form-select" required>
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">État</label>
              <select v-model="missionSelectionnee.etat" class="form-select" required>
                <option value="en attente">En attente</option>
                <option value="en cours">En cours</option>
                <option value="terminer">Terminée</option>
                <option value="annuler">Annulée</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Véhicule</label>
              <select v-model="missionSelectionnee.vehicule_id" class="form-select" required>
                <option disabled value="">-- Sélectionner un véhicule --</option>
                <option 
                  v-for="v in vehiculesDisponibles" 
                  :key="v.id" 
                  :value="v.id"
                  :disabled="v.etat !== 'DISPO'"
                >
                  {{ v.immatriculation }} ({{ v.marque }} {{ v.modele }})
                  <span v-if="v.etat !== 'DISPO'" class="text-danger"> - {{ getStatusText(v.etat) }}</span>
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Chauffeur</label>
              <select v-model="missionSelectionnee.chauffeur_id" class="form-select" required>
                <option disabled value="">-- Sélectionner un chauffeur --</option>
                <option 
                  v-for="c in chauffeursDisponibles" 
                  :key="c.id" 
                  :value="c.id"
                  :disabled="c.etat !== 'Dispo'"
                >
                  {{ c.utilisateur?.nom }} {{ c.utilisateur?.prenom }}
                  <span v-if="c.etat !== 'Dispo'" class="text-danger"> - Indisponible</span>
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Destination</label>
              <input 
                v-model="missionSelectionnee.demande.destination" 
                type="text" 
                class="form-control" 
                required
              />
            </div>
            <div class="col-12">
              <label class="form-label">Itinéraire</label>
              <input 
                v-model="missionSelectionnee.demande.itineraire" 
                type="text" 
                class="form-control" 
              />
            </div>
            <div class="col-12">
              <label class="form-label">Observation</label>
              <textarea 
                v-model="missionSelectionnee.demande.observation" 
                class="form-control" 
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="d-flex justify-content-between mt-4">
            <div class="d-flex gap-2 ms-auto">
              <button type="button" class="btn btn-outline-secondary" @click="fermerModaleModification">
                <i class="bi bi-x-lg me-1"></i> Annuler
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-1"></i> Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL HISTORIQUE -->
    <div v-if="historiqueVisible" class="modal-backdrop d-flex justify-content-center align-items-center">
      <div class="modal-content bg-white shadow-lg p-4 rounded-4" style="width: 90%; max-width: 900px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold mb-0">
            <i class="bi bi-clock-history text-primary me-2"></i>
            Historique des Missions
          </h5>
          <button type="button" class="btn-close" @click="historiqueVisible = false"></button>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Période</label>
            <select v-model="periodeHistorique" class="form-select" @change="filtrerHistorique">
              <option value="mois_en_cours">Mois en cours</option>
              <option value="mois_precedent">Mois précédent</option>
              <option value="trimestre">Trimestre en cours</option>
              <option value="annee">Année en cours</option>
              <option value="personnalise">Personnalisée</option>
            </select>
          </div>
          <div class="col-md-3" v-if="periodeHistorique === 'personnalise'">
            <label class="form-label">Date début</label>
            <input v-model="dateDebutHistorique" type="date" class="form-control">
          </div>
          <div class="col-md-3" v-if="periodeHistorique === 'personnalise'">
            <label class="form-label">Date fin</label>
            <input v-model="dateFinHistorique" type="date" class="form-control">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>N° d'ordre</th>
                <th>Date</th>
                <th>Véhicule</th>
                <th>Chauffeur</th>
                <th>Type</th>
                <th>Destination</th>
                <th>État</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mission in missionsHistorique" :key="mission.id">
                <td>{{ mission.demande?.n_ordre || '—' }}</td>
                <td>{{ formatDate(mission.date_depart) }}</td>
                <td>{{ mission.vehicule?.immatriculation || '—' }}</td>
                <td>
                  {{ mission.chauffeur?.utilisateur 
                    ? mission.chauffeur.utilisateur.nom + ' ' + mission.chauffeur.utilisateur.prenom 
                    : '—' }}
                </td>
                <td>
                  <span class="badge bg-light text-dark text-uppercase d-flex align-items-center gap-1">
                    <i :class="getTypeMissionIcon(mission.type_mission)"></i>
                    {{ getTypeMissionText(mission.type_mission) }}
                  </span>
                </td>
                <td>{{ mission.demande?.destination || '—' }}</td>
                <td>
                  <span class="badge text-uppercase px-2 py-1 rounded-pill" :class="getClasseEtat(mission.etat)">
                    {{ getEtatText(mission.etat) }}
                  </span>
                </td>
                <td class="text-end">
                  <button 
                    class="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
                    style="width: 32px; height: 32px;"
                    @click="ouvrirDetails(mission)"
                    title="Détails"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-info rounded-circle d-flex align-items-center justify-content-center ms-2" 
                    style="width: 32px; height: 32px;"
                    @click="genererFeuilleRoute(mission.id)"
                    title="Feuille de route"
                  >
                    <i class="bi bi-download"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="missionsHistorique.length === 0">
                <td colspan="8" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-4 d-block mb-2"></i>
                  Aucune mission trouvée pour cette période
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted small">
            Affichage de {{ missionsHistorique.length }} missions
          </div>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-outline-primary btn-sm" 
              @click="exporterHistoriqueExcel"
              :disabled="missionsHistorique.length === 0"
            >
              <i class="bi bi-file-earmark-excel me-1"></i> Exporter Excel
            </button>
            <button 
              class="btn btn-outline-secondary btn-sm" 
              @click="historiqueVisible = false"
            >
              <i class="bi bi-x-lg me-1"></i> Fermer
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
import MissionCalendar from './MissionCalendar.vue';
import * as XLSX from 'xlsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: "ResponsableMissions",
  components: { MissionCalendar },
  data() {
    return {
      showCalendar: false,
      missions: [],
      missionsHistorique: [],
      vehicules: [],
      chauffeurs: [],
      recherche: "",
      missionDetailsVisible: false,
      missionModifierVisible: false,
      confirmationVisible: false,
      historiqueVisible: false,
      missionSelectionnee: this.getMissionVide(),
      missionASupprimer: null,
      positionVehicule: null,
      periodeHistorique: 'mois_en_cours',
      dateDebutHistorique: dayjs().startOf('month').format('YYYY-MM-DD'),
      dateFinHistorique: dayjs().endOf('month').format('YYYY-MM-DD'),
      map: null,
      marker: null
    };
  },
  computed: {
    missionsFiltrees() {
      const txt = this.recherche.toLowerCase();
      return this.missions.filter(m => {
        const veh = m.vehicule?.immatriculation?.toLowerCase() || '';
        const chauffeur = m.chauffeur?.utilisateur
          ? (m.chauffeur.utilisateur.nom + ' ' + m.chauffeur.utilisateur.prenom).toLowerCase()
          : '';
        const dest = m.demande?.destination?.toLowerCase() || '';
        const etat = this.getEtatText(m.etat).toLowerCase();
        const type = this.getTypeMissionText(m.type_mission).toLowerCase();
        const nOrdre = m.demande?.n_ordre?.toString().toLowerCase() || '';
        return veh.includes(txt) || chauffeur.includes(txt) || dest.includes(txt) || etat.includes(txt) || type.includes(txt) || nOrdre.includes(txt);
      }).sort((a, b) => new Date(b.date_depart) - new Date(a.date_depart));
    },
    
    // Nouveau computed pour grouper les missions par numéro d'ordre
    missionsGroupedByOrder() {
      const grouped = {};
      
      this.missionsFiltrees.forEach(mission => {
        const nOrdre = mission.demande?.n_ordre || 'Sans numéro';
        
        if (!grouped[nOrdre]) {
          grouped[nOrdre] = [];
        }
        
        grouped[nOrdre].push(mission);
      });
      
      return grouped;
    },
    
    chauffeursDisponibles() {
      return this.chauffeurs.filter(ch => {
        if (this.missionSelectionnee.chauffeur_id === ch.id) return true;
        const estOccupe = this.missions.some(m =>
          m.id !== this.missionSelectionnee.id &&
          m.chauffeur?.id === ch.id &&
          this.datesSeChevauchent(
            m.date_depart,
            m.date_routour,
            this.missionSelectionnee.date_depart,
            this.missionSelectionnee.date_routour
          )
        );
        return !estOccupe;
      });
    },
    vehiculesDisponibles() {
      return this.vehicules.filter(v => {
        if (this.missionSelectionnee.vehicule_id === v.id) return true;
        const estOccupe = this.missions.some(m =>
          m.id !== this.missionSelectionnee.id &&
          m.vehicule?.id === v.id &&
          this.datesSeChevauchent(
            m.date_depart,
            m.date_routour,
            this.missionSelectionnee.date_depart,
            this.missionSelectionnee.date_routour
          )
        );
        return !estOccupe;
      });
    }
  },
  methods: {
    getMissionVide() {
      return {
        id: null,
        demande_id: null,
        type_mission: 'aller',
        vehicule_id: '',
        chauffeur_id: '',
        etat: 'en attente',
        date_depart: dayjs().format('YYYY-MM-DD'),
        date_routour: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        intervention: 'non',
        latitude: null,
        longitude: null,
        demande: {
          n_ordre: '',
          destination: '',
          itineraire: '',
          observation: ''
        }
      };
    },
    
    // Nouvelle méthode pour obtenir l'icône du type de mission
    getTypeMissionIcon(type) {
      const icons = {
        "aller": "bi-arrow-right-circle text-info",
        "retour": "bi-arrow-left-circle text-warning",
        "aller-retour": "bi-arrow-left-right text-success"
      };
      return icons[type] || "bi-question-circle";
    },
    
    handleTypeMissionChange() {
      if (this.missionSelectionnee.type_mission === 'aller') {
        this.missionSelectionnee.date_routour = null;
      } else if (!this.missionSelectionnee.date_routour) {
        this.missionSelectionnee.date_routour = dayjs(this.missionSelectionnee.date_depart).add(1, 'day').format('YYYY-MM-DD');
      }
    },
    datesSeChevauchent(debut1, fin1, debut2, fin2) {
      if (!debut1 || !debut2) return false;
      fin1 = fin1 || debut1;
      fin2 = fin2 || debut2;
      return (new Date(debut1) <= new Date(fin2)) && (new Date(debut2) <= new Date(fin1));
    },
    async fetchMissions() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get("http://localhost:3000/api/missions", { 
          headers: { Authorization: `Bearer ${token}` },
          params: { withDemande: true, withVehicule: true, withChauffeur: true }
        });
        this.missions = data;
      } catch (err) {
        console.error("Erreur chargement missions :", err);
      }
    },
    async fetchVehicules() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get("http://localhost:3000/api/vehicules", { headers: { Authorization: `Bearer ${token}` } });
        this.vehicules = data;
      } catch (err) {
        console.error("Erreur chargement véhicules :", err);
      }
    },
    async fetchChauffeurs() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get("http://localhost:3000/api/chauffeurs", { 
          headers: { Authorization: `Bearer ${token}` },
          params: { withUser: true }
        });
        this.chauffeurs = data;
      } catch (err) {
        console.error("Erreur chargement chauffeurs :", err);
      }
    },
    async getPositionVehicule(missionId) {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          `http://localhost:3000/api/missions/${missionId}/position`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const lat = Number(data.latitude);
        const lng = Number(data.longitude);

        if (isNaN(lat) || isNaN(lng)) return;

        this.positionVehicule = { ...data, latitude: lat, longitude: lng };

        this.$nextTick(() => this.initOpenStreetMap());
      } catch (err) {
        console.error("Erreur récupération position :", err);
      }
    },
    async initOpenStreetMap() {
      if (!this.positionVehicule || !this.missionSelectionnee?.demande?.destination) return;

      const startLat = Number(this.positionVehicule.latitude);
      const startLng = Number(this.positionVehicule.longitude);
      if (!isFinite(startLat) || !isFinite(startLng)) return;

      if (this.map) { this.map.remove(); this.map = null; }
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) return;

      this.map = L.map('map-container').setView([startLat, startLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

      // Marqueur véhicule
      L.marker([startLat, startLng])
        .addTo(this.map)
        .bindPopup(`Véhicule: ${this.missionSelectionnee.vehicule?.immatriculation || 'Inconnu'}`)
        .openPopup();

      if (this.positionVehicule.accuracy) {
        L.circle([startLat, startLng], {
          radius: this.positionVehicule.accuracy,
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2
        }).addTo(this.map);
      }

      try {
        // Géocodage destination via Nominatim
        const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: this.missionSelectionnee.demande.destination, format: 'json', limit: 1 }
        });
        if (!geoRes.data.length) return;

        const destLat = parseFloat(geoRes.data[0].lat);
        const destLng = parseFloat(geoRes.data[0].lon);
        if (!isFinite(destLat) || !isFinite(destLng)) return;

        // Marqueur destination
        L.marker([destLat, destLng], {
          icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })
        }).addTo(this.map)
          .bindPopup(`Destination: ${this.missionSelectionnee.demande.destination}`);

        // --- TRACER LA ROUTE AVEC LEAFLET ROUTING MACHINE ---
        require('leaflet-routing-machine');
        L.Routing.control({
          waypoints: [
            L.latLng(startLat, startLng),
            L.latLng(destLat, destLng)
          ],
          lineOptions: {
            styles: [{ color: 'red', weight: 4 }]
          },
          createMarker: (i, wp) => {
            return L.marker(wp.latLng);
          },
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true
        }).addTo(this.map);

      } catch (err) {
        console.error('Erreur calcul route :', err);
      }
    },
    async genererFeuilleRoute(missionId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/missions/${missionId}/feuille-route`, { 
          headers: { Authorization: `Bearer ${token}` }, 
          responseType: 'blob' 
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `feuille_route_${missionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error("Erreur génération feuille de route :", err);
      }
    },
    async terminerMission(mission) { 
      if (!mission?.id) return;
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/api/missions/${mission.id}/terminer`, {}, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        this.fetchMissions();
        this.missionDetailsVisible = false;
      } catch (err) { 
        console.error("Erreur terminer mission :", err); 
      }
    },
    async annulerMission(mission) { 
      if (!mission?.id) return;
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/api/missions/${mission.id}/annuler`, {}, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        this.fetchMissions();
        this.missionDetailsVisible = false;
      } catch (err) { 
        console.error("Erreur annuler mission :", err); 
      }
    },
    ouvrirDetails(mission) {
      this.missionSelectionnee = { ...mission };
      this.positionVehicule = null;
      if (mission.etat === 'en cours' && mission.vehicule) this.getPositionVehicule(mission.id);
      this.missionDetailsVisible = true;
    },
    ouvrirModifier(mission) {
      this.missionSelectionnee = mission.id ? { 
        ...mission, 
        vehicule_id: mission.vehicule?.id, 
        chauffeur_id: mission.chauffeur?.id 
      } : this.getMissionVide();
      this.missionModifierVisible = true;
    },
    ouvrirNouvelleMission() { 
      this.missionSelectionnee = this.getMissionVide(); 
      this.missionModifierVisible = true; 
    },
    fermerModaleModification() { 
      this.missionModifierVisible = false; 
      this.missionSelectionnee = this.getMissionVide(); 
    },
    async enregistrerModification() {
      try {
        const token = localStorage.getItem('token');
        const url = this.missionSelectionnee.id 
          ? `http://localhost:3000/api/missions/${this.missionSelectionnee.id}` 
          : "http://localhost:3000/api/missions";
        const method = this.missionSelectionnee.id ? 'put' : 'post';
        
        const payload = {
          type_mission: this.missionSelectionnee.type_mission,
          vehicule_id: this.missionSelectionnee.vehicule_id,
          chauffeur_id: this.missionSelectionnee.chauffeur_id,
          etat: this.missionSelectionnee.etat,
          date_depart: this.missionSelectionnee.date_depart,
          date_routour: this.missionSelectionnee.type_mission === 'aller' ? null : this.missionSelectionnee.date_routour,
          intervention: this.missionSelectionnee.intervention,
          demande_id: this.missionSelectionnee.demande_id,
          demande: this.missionSelectionnee.demande
        };

        await axios[method](url, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        this.fermerModaleModification();
        this.fetchMissions();
      } catch (err) { 
        console.error("Erreur modification mission :", err); 
      }
    },
    confirmerSuppression(id) { 
      this.missionASupprimer = id; 
      this.confirmationVisible = true; 
    },
    
    async afficherHistorique() { 
      this.historiqueVisible = true; 
      await this.filtrerHistorique(); 
    },
    async filtrerHistorique() {
      try {
        let dateDebut, dateFin;
        switch(this.periodeHistorique) {
          case 'mois_en_cours': 
            dateDebut = dayjs().startOf('month').format('YYYY-MM-DD'); 
            dateFin = dayjs().endOf('month').format('YYYY-MM-DD'); 
            break;
          case 'mois_precedent': 
            dateDebut = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'); 
            dateFin = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'); 
            break;
          case 'trimestre': 
            dateDebut = dayjs().startOf('quarter').format('YYYY-MM-DD'); 
            dateFin = dayjs().endOf('quarter').format('YYYY-MM-DD'); 
            break;
          case 'annee': 
            dateDebut = dayjs().startOf('year').format('YYYY-MM-DD'); 
            dateFin = dayjs().endOf('year').format('YYYY-MM-DD'); 
            break;
          case 'personnalise': 
            dateDebut = this.dateDebutHistorique; 
            dateFin = this.dateFinHistorique; 
            break;
        }
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:3000/api/missions/historique`, { 
          headers: { Authorization: `Bearer ${token}` }, 
          params: { dateDebut, dateFin, withDemande: true, withVehicule: true, withChauffeur: true } 
        });
        this.missionsHistorique = data;
      } catch (err) { 
        console.error("Erreur chargement historique :", err); 
      }
    },
    exporterHistoriqueExcel() {
      const data = this.missionsHistorique.map(m => ({
        'N° Ordre': m.demande?.n_ordre || '',
        'Type': this.getTypeMissionText(m.type_mission),
        'Date Départ': this.formatDate(m.date_depart),
        'Date Retour': this.formatDate(m.date_routour),
        'Véhicule': m.vehicule?.immatriculation || '',
        'Marque': m.vehicule?.marque || '',
        'Modèle': m.vehicule?.modele || '',
        'Chauffeur': m.chauffeur?.utilisateur ? `${m.chauffeur.utilisateur.nom} ${m.chauffeur.utilisateur.prenom}` : '',
        'Matricule': m.chauffeur?.utilisateur?.matricule || '',
        'Destination': m.demande?.destination || '',
        'Itinéraire': m.demande?.itineraire || '',
        'Observation': m.demande?.observation || '',
        'Intervention': m.intervention === 'oui' ? 'Oui' : 'Non',
        'État': this.getEtatText(m.etat)
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historique Missions");
      XLSX.writeFile(workbook, `historique_missions_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    },
    formatDate(dt) { return dt ? dayjs(dt).format('DD/MM/YYYY') : '—'; },
    formatDateTime(dt) { return dt ? dayjs(dt).format('DD/MM/YYYY HH:mm') : '—'; },
    getClasseEtat(etat) {
      const classes = { 
        "en attente": "bg-warning bg-opacity-10 text-warning", 
        "en cours": "bg-primary bg-opacity-10 text-primary", 
        "terminer": "bg-success bg-opacity-10 text-success", 
        "annuler": "bg-danger bg-opacity-10 text-danger" 
      };
      return classes[etat?.toLowerCase()] || "bg-light text-dark";
    },
    getEtatText(etat) { 
      const etats = { 
        "en attente": "En attente", 
        "en cours": "En cours", 
        "terminer": "Terminée", 
        "annuler": "Annulée" 
      }; 
      return etats[etat] || etat; 
    },
    getTypeMissionText(type) {
      const types = {
        "aller": "Aller",
        "retour": "Retour",
        "aller-retour": "Aller-retour"
      };
      return types[type] || type;
    },
    getStatusText(etat) { 
      const status = { 
        'DISPO': 'Disponible', 
        'EN_MISSION': 'En mission', 
        'MAINTENANCE': 'Maintenance', 
        'HORS_SERVICE': 'Hors service' 
      }; 
      return status[etat] || etat; 
    }
  },
  mounted() {
    this.fetchMissions();
    this.fetchVehicules();
    this.fetchChauffeurs();
  },
  beforeUnmount() {
    if (this.map) this.map.remove();
    this.map = null;
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.233);
  z-index: 1050;
  backdrop-filter: blur(5px) brightness(0.7);
  transition: background 0.3s ease;
  will-change: background;
}

.modal-backdrop:hover {
  background: rgba(0, 0, 0, 0.459);
}

.modal-content {
  animation: fadeIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  transition: all 0.3s ease;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-top: none;
  border-bottom: 1px solid #dee2e6;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}

.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.calendar-container {
  border: 1px solid rgba(0, 0, 0, 0.075);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.03);
}

.calendar-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.075);
}

.day-view, .week-view {
  background-color: #fff;
}

.month-view {
  background-color: #fff;
}

.time-column {
  background-color: #f8f9fa;
}

.calendar-event {
  font-size: 0.75rem;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.calendar-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.event-en-attente {
  background-color: rgba(255, 193, 7, 0.1);
  border-left-color: #ffc107;
}

.event-en-cours {
  background-color: rgba(13, 110, 253, 0.1);
  border-left-color: #0d6efd;
}

.event-terminer {
  background-color: rgba(25, 135, 84, 0.1);
  border-left-color: #198754;
}

.event-annuler {
  background-color: rgba(220, 53, 69, 0.1);
  border-left-color: #dc3545;
}

.month-day {
  min-height: 100px;
  transition: all 0.2s ease;
}

.month-day:hover {
  background-color: #f8f9fa;
}

.month-day.has-events {
  background-color: rgba(13, 110, 253, 0.05);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.bg-warning {
  background-color: #ffc107;
}

.ligne-probleme {
  background-color: #f8d7da !important; /* rouge clair */
}

.ligne-probleme td {
  background-color: #f8d7da !important; /* fond appliqué aussi aux cellules */
  color: #000 !important;               /* texte bien lisible */
  border-color: #f5c2c7 !important;     /* bordures assorties */
}
.bg-primary {
  background-color: #0d6efd;
}

.bg-success {
  background-color: #198754;
}

.bg-danger {
  background-color: #dc3545;
}

.btn-close-calendar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-close-calendar:hover {
  background-color: #f1f1f1;
}

.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input-group-text {
  transition: all 0.3s ease;
}

.input-group:focus-within .input-group-text {
  color: #0d6efd;
  background-color: #e7f1ff;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.btn-outline-info:hover {
  background-color: #0dcaf0;
  color: white;
}

.btn-toggle-calendar {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.375rem 0.75rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.btn-toggle-calendar:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.btn-toggle-calendar i {
  margin-right: 0.5rem;
}

/* Style pour les lignes groupées */
.border-bottom-0 {
  border-bottom: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
  
  .modal-content {
    width: 95% !important;
  }
  
  .btn-group-responsive {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-group-responsive .btn {
    width: 100%;
  }
}

/* Custom scrollbar for modal */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}


/* Style pour la carte */
#map-container {
  min-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>