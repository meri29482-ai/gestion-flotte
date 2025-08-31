<template>
  <div class="container-fluid py-4 dashboard">
    <!-- ========== HEADER ========== -->
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-2">
        <h2 class="fw-bold text-primary m-0">
          <i class="bi bi-speedometer2 me-2"></i>Tableau de bord
        </h2>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <div class="input-group shadow-sm">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input v-model="query" type="text" class="form-control" placeholder="Rechercher..." />
        <button class="btn btn-outline-primary" :disabled="isLoading" @click="fetchDashboardData">
          <i class="bi bi-arrow-clockwise me-1" :class="{ 'spin': isLoading }"></i> Rafraîchir
        </button>
        </div>
      </div>
    </div>

  

    

    <!-- ========== KPI CARDS ========== -->
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-lg-3" v-for="kpi in kpis" :key="kpi.label">
        <div class="card kpi-card shadow-sm border-0 rounded-4 h-100">
          <div class="card-body d-flex align-items-center">
            <div class="kpi-icon me-3" :class="kpi.color">
              <i :class="kpi.icon"></i>
            </div>
            <div>
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="text-muted small">{{ kpi.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
 
    <!-- ========== CHARTS ========== -->
    <div class="row g-3 mt-1">
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 rounded-4 h-100">
          <div class="card-header bg-light fw-semibold">Répartition des véhicules par état</div>
          <div class="card-body chart-holder">
            <Pie :data="pieVehicules" :options="chartOptions" />
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 rounded-4 h-100">
          <div class="card-header bg-light fw-semibold">Missions par statut</div>
          <div class="card-body chart-holder">
            <Bar :data="barMissionsByStatut" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
    

    <div class="row g-3 mt-3">
  <div class="col-12">
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-header bg-light fw-semibold">
        Localisation des missions
      </div>
      <div class="card-body p-0">
        <div id="missions-map" style="height: 450px; border-radius: 0 0 1rem 1rem;"></div>
      </div>
    </div>
  </div>
</div>

   

    

    <!-- ========== LOADER ========= -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

import axios from "axios";
import { Pie, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default {
  name: "DashboardResponsableParc",
  components: { Pie, Bar },
  data() {
    return {
      vehicules: [],
      utilisateurs: [],
      missions: [],
      demandes: [],
      signalements: [],
      documents: [],
      checklists: [],
      maintenance: [],
       map: null,
      missionMarkers: [],
      isLoading: false,
      query: "",
      activeTab: "vehicules",
      vehiculeEtatFilter: "",
      missionStatutFilter: "",
      missionTypeFilter: "",
      docTypeFilter: "",

      missionStatuts: ["en attente", "en cours", "terminer", "annuler", "bloquer"],
      vehiculeEtats: [
        { value: "DISPO", label: "Disponible" },
        { value: "EN_MISSION", label: "En mission" },
        { value: "MAINTENANCE", label: "Maintenance" },
        { value: "HORS_SERVICE", label: "Hors service" },
      ],

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    };
  },

  computed: {
    vehiculeById() {
      const idx = {};
      this.vehicules.forEach(v => { idx[v.id] = v; });
      return idx;
    },
    utilisateurById() {
      const idx = {};
      this.utilisateurs.forEach(u => { idx[u.id] = u; });
      return idx;
    },
    chauffeurs() {
      return this.utilisateurs.filter(u => u.role === "CHAUFFEUR");
    },

    kpis() {
      const docsCritiques = this.documentsAlerte.length;
      const missionsEnCours = this.missions.filter(m => m.etat === "en cours").length;

      return [
        { label: "Véhicules", value: this.vehicules.length, icon: "bi bi-truck", color: "bg-kpi-1" },
        { label: "Chauffeurs", value: this.chauffeurs.length, icon: "bi bi-person-badge", color: "bg-kpi-2" },
        { label: "Missions en cours", value: missionsEnCours, icon: "bi bi-geo-alt", color: "bg-kpi-3" },
        { label: "Docs critiques", value: docsCritiques, icon: "bi bi-file-earmark-excel", color: "bg-kpi-4" },
      ];
    },

    tabs() {
      return [
        { key: "vehicules", label: "Véhicules", icon: "bi bi-truck", count: this.vehicules.length },
        { key: "missions", label: "Missions", icon: "bi bi-geo-alt", count: this.missions.length },
        { key: "maintenance", label: "Maintenance", icon: "bi bi-tools", count: this.maintenance.length },
        { key: "documents", label: "Documents", icon: "bi bi-files", count: this.documentsAlerte.length },
        { key: "signalements", label: "Signalements", icon: "bi bi-flag", count: this.signalements.length },
        { key: "checklists", label: "Checklists", icon: "bi bi-ui-checks-grid", count: this.checklists.length },
      ];
    },

    q() {
      return (this.query || "").toLowerCase().trim();
    },

    vehiculesAffiches() {
      let list = [...this.vehicules];
      if (this.vehiculeEtatFilter) list = list.filter(v => v.etat === this.vehiculeEtatFilter);
      if (this.q) {
        list = list.filter(v =>
          (v.immatriculation || "").toLowerCase().includes(this.q) ||
          (v.marque || "").toLowerCase().includes(this.q) ||
          (v.modele || "").toLowerCase().includes(this.q)
        );
      }
      return list.slice(0, 100);
    },

    missionsEnrichies() {
      return this.missions.map(m => {
        const dem = this.demandes.find(d => d.id === m.demande_id);
        const veh = this.vehiculeById[m.vehicule_id];
        const chf = this.utilisateurById[m.chauffeur_id];
        return {
          ...m,
          destination: dem?.destination,
          vehicule: veh,
          chauffeurNom: chf ? `${chf.nom} ${chf.prenom}` : null,
        };
      });
    },
    missionsAffichees() {
      let list = [...this.missionsEnrichies];
      if (this.missionStatutFilter) list = list.filter(m => m.etat === this.missionStatutFilter);
      if (this.missionTypeFilter) list = list.filter(m => m.type_mission === this.missionTypeFilter);
      if (this.q) {
        list = list.filter(m =>
          (m.destination || "").toLowerCase().includes(this.q) ||
          (m.chauffeurNom || "").toLowerCase().includes(this.q) ||
          (m.vehicule?.immatriculation || "").toLowerCase().includes(this.q)
        );
      }
      list.sort((a, b) => new Date(b.date_depart || 0) - new Date(a.date_depart || 0));
      return list.slice(0, 100);
    },

    maintenanceAffichee() {
      let list = [...this.maintenance];
      if (this.q) {
        list = list.filter(m =>
          (m.categorie || "").toLowerCase().includes(this.q) ||
          (m.type_principal || "").toLowerCase().includes(this.q) ||
          (this.vehiculeById[m.id_vehicule]?.immatriculation || "").toLowerCase().includes(this.q)
        );
      }
      list.sort((a, b) => new Date(b.date_intervention) - new Date(a.date_intervention));
      return list.slice(0, 100);
    },

    documentsAlerte() {
      const now = new Date();
      return this.documents.filter(d => {
        if (!d.date_expiration) return false;
        const dt = new Date(d.date_expiration);
        const expired = dt < now;
        const soon = this.daysUntil(dt) <= 30;
        return expired || soon || d.statut === "expiré";
      });
    },
    documentsAlerteAffiches() {
      let list = [...this.documentsAlerte];
      if (this.docTypeFilter) list = list.filter(d => d.type_document === this.docTypeFilter);
      if (this.q) {
        list = list.filter(d =>
          (this.vehiculeById[d.vehicule_id]?.immatriculation || "").toLowerCase().includes(this.q) ||
          (this.utilisateurById[d.chauffeur_id]?.nom || "").toLowerCase().includes(this.q) ||
          (d.type_document || "").toLowerCase().includes(this.q)
        );
      }
      list.sort((a, b) => new Date(a.date_expiration || 0) - new Date(b.date_expiration || 0));
      return list.slice(0, 200);
    },
    documentTypes() {
      const set = new Set(this.documents.map(d => d.type_document));
      return Array.from(set);
    },

    signalementsAffiches() {
      let list = [...this.signalements];
      if (this.q) {
        list = list.filter(s =>
          (s.type || "").toLowerCase().includes(this.q) ||
          (s.description || "").toLowerCase().includes(this.q)
        );
      }
      list.sort((a, b) => new Date(b.date_signalement) - new Date(a.date_signalement));
      return list.slice(0, 100);
    },

    checklistsAffichees() {
      let list = [...this.checklists];
      if (this.q) {
        list = list.filter(c =>
          (c.type_controle || "").toLowerCase().includes(this.q) ||
          (this.vehiculeById[c.vehicule_id]?.immatriculation || "").toLowerCase().includes(this.q)
        );
      }
      list.sort((a, b) => new Date(b.date_controle || 0) - new Date(a.date_controle || 0));
      return list.slice(0, 100);
    },

    pieVehicules() {
      const states = ["DISPO", "EN_MISSION", "MAINTENANCE", "HORS_SERVICE"];
      const data = states.map(s => this.vehicules.filter(v => v.etat === s).length);
      return {
        labels: ["Disponible", "En mission", "Maintenance", "Hors service"],
        datasets: [{ data, backgroundColor: ["#28a745", "#0d6efd", "#ffc107", "#dc3545"] }],
      };
    },
    barMissionsByStatut() {
      const labs = this.missionStatuts;
      const data = labs.map(s => this.missions.filter(m => m.etat === s).length);
      return {
        labels: labs,
        datasets: [{ label: "Missions", data, backgroundColor: "#0d6efd" }],
      };
    },

    alertes() {
      const arr = [];
      this.documentsAlerte.forEach(d => {
        const res =
          d.vehicule_id
            ? `Véhicule ${this.vehiculeById[d.vehicule_id]?.immatriculation || '#'+d.vehicule_id}`
            : d.chauffeur_id
              ? `Chauffeur ${this.utilisateurById[d.chauffeur_id]?.nom} ${this.utilisateurById[d.chauffeur_id]?.prenom}`
              : `Document #${d.id}`;
        const dt = d.date_expiration ? this.formatDate(d.date_expiration) : 'N/A';
        arr.push(`${d.type_document} — ${res} · Échéance: ${dt} (${d.statut})`);
      });

      this.vehicules.filter(v => v.etat === "HORS_SERVICE").forEach(v => {
        arr.push(`Véhicule ${v.immatriculation} est HORS SERVICE`);
      });

      return arr.slice(0, 20);
    },
  },

  methods: {
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    },
    formatDateTime(date) {
      if (!date) return "";
      return new Date(date).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    },
    formatKm(val) {
      if (val === null || val === undefined || isNaN(val)) return "-";
      return new Intl.NumberFormat("fr-FR").format(Math.round(val)) + " km";
    },
    daysUntil(d) {
      const dt = new Date(d);
      const diff = dt - new Date();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },
    isExpired(d) {
      if (!d) return false;
      return new Date(d) < new Date();
    },
    isSoon(d) {
      if (!d) return false;
      return this.daysUntil(d) > 0 && this.daysUntil(d) <= 30;
    },

    formatEtatVehicule(etat) {
      switch (etat) {
        case "DISPO": return "Disponible";
        case "EN_MISSION": return "En mission";
        case "MAINTENANCE": return "Maintenance";
        case "HORS_SERVICE": return "Hors service";
        default: return etat || "-";
      }
    },
    vehiculeEtatBadge(etat) {
      return {
        DISPO: "bg-success",
        EN_MISSION: "bg-primary",
        MAINTENANCE: "bg-warning text-dark",
        HORS_SERVICE: "bg-danger",
      }[etat] || "bg-secondary";
    },
    missionStatutBadge(st) {
      return {
        "en attente": "bg-secondary",
        "en cours": "bg-primary",
        "terminer": "bg-success",
        "annuler": "bg-warning text-dark",
        "bloquer": "bg-danger",
      }[st] || "bg-secondary";
    },
    maintenanceStatutBadge(st) {
      return {
        "Prévu": "bg-secondary",
        "En attente de validation": "bg-warning text-dark",
        "En cours": "bg-primary",
        "Terminé": "bg-success",
        "Annulé": "bg-danger",
      }[st] || "bg-secondary";
    },
    documentStatutBadge(d) {
      if (this.isExpired(d.date_expiration) || d.statut === "expiré") return "bg-danger";
      if (this.isSoon(d.date_expiration)) return "bg-warning text-dark";
      return "bg-success";
    },

    exportVehiculesCSV() {
      const cols = ["id", "immatriculation", "marque", "modele", "etat", "kilometrage", "date_achat"];
      const header = cols.join(";");
      const rows = this.vehiculesAffiches.map(v => cols.map(c => (v[c] ?? "")).join(";"));
      const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vehicules_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },

    async initMissionsMap() {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map("missions-map").setView([31.63, -7.99], 6); // vue par défaut (Maroc)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(this.map);

      this.loadAllPositions();
    },

    async loadAllPositions() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/missions/all/positions", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const missions = res.data.missions || res.data;

        // Nettoyer anciens marqueurs
        this.missionMarkers.forEach(m => m.remove());
        this.missionMarkers = [];

        missions.forEach(m => {
          if (!m.latitude || !m.longitude) return;

          // couleur selon etat
          const color = m.etat === "bloquer" ? "red" : 
                        m.etat === "en cours" ? "blue" : "gray";

          const marker = L.marker([m.latitude, m.longitude], {
            icon: L.icon({
              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          }).addTo(this.map);

          marker.bindPopup(`
            <b>Mission #${m.id}</b><br>
            ${m.demande?.destination || "Destination inconnue"}<br>
            Chauffeur: ${m.chauffeur?.utilisateur?.nom || "-"} ${m.chauffeur?.utilisateur?.prenom || ""}
          `);

          marker.on("click", () => {
            this.$router.push(`/responsable/missions`);
          });

          this.missionMarkers.push(marker);
        });

        // ajuster la vue aux marqueurs
        if (this.missionMarkers.length) {
          const group = L.featureGroup(this.missionMarkers);
          this.map.fitBounds(group.getBounds().pad(0.2));
        }

      } catch (err) {
        console.error("Erreur chargement positions missions:", err);
      }
    },

    async fetchDashboardData() {
      this.isLoading = true;
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const base = "http://localhost:3000/api";

      const endpoints = [
        { key: "vehicules", url: `${base}/vehicules` },
        { key: "utilisateurs", url: `${base}/utilisateurs` },
        { key: "missions", url: `${base}/missions` },
        { key: "demandes", url: `${base}/demande` },
        { key: "signalements", url: `${base}/signalements` },
        { key: "documents", url: `${base}/documents` },
        { key: "checklists", url: `${base}/checklists` },
        { key: "maintenance", url: `${base}/maintenance` },
      ];

      try {
        const results = await Promise.allSettled(
          endpoints.map(ep => axios.get(ep.url, { headers }))
        );
        results.forEach((res, i) => {
          const key = endpoints[i].key;
          if (res.status === "fulfilled") {
            this[key] = res.value.data || [];
          } else {
            console.error(`Erreur chargement ${key}:`, res.reason);
          }
        });
      } catch (e) {
        console.error("Erreur dashboard:", e);
      } finally {
        this.isLoading = false;
      }
    },
  },

  async mounted() {
    this.fetchDashboardData(); // déjà présent j’imagine
    this.initMissionsMap();
  },
  beforeUnmount() {
    if (this.map) this.map.remove();
  },
};
</script>

<style scoped>
/* ===== Global ===== */
.dashboard {
  background: #f7f9fc;
  min-height: 100%;
}

/* ===== Brand badge ===== */
.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .4rem .7rem;
  border-radius: .8rem;
  background: linear-gradient(135deg, #0d6efd1a, #20c9971a);
  color: #0d6efd;
  font-weight: 700;
  letter-spacing: .5px;
}

/* ===== KPI ===== */
.kpi-card { transition: .2s ease; }
.kpi-card:hover { transform: translateY(-2px); }
.kpi-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display:flex; align-items:center; justify-content:center;
  color:#fff; font-size: 1.2rem;
}
.bg-kpi-1 { background: linear-gradient(135deg,#0d6efd,#6ea8fe); }
.bg-kpi-2 { background: linear-gradient(135deg,#20c997,#57d9b7); }
.bg-kpi-3 { background: linear-gradient(135deg,#6610f2,#9a6bff); }
.bg-kpi-4 { background: linear-gradient(135deg,#dc3545,#ff6b81); }
.kpi-value { font-size: 1.4rem; font-weight: 800; }

/* ===== Pills ===== */
.soft-pills .nav-link {
  border-radius: 999px;
  background: #fff;
  margin-right: .5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.04);
}
.soft-pills .nav-link.active {
  color: #0d6efd; background: #e7f1ff; font-weight: 600;
}

/* ===== Charts ===== */
.chart-holder { height: 320px; }

/* ===== Loader ===== */
.loading-overlay {
  position: fixed; inset: 0; background: rgba(255,255,255,.6);
  display:flex; align-items:center; justify-content:center; z-index: 1050;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(1turn); } }

/* ===== Tables ===== */
.table thead { background-color: #f2f5f9; }
.badge { font-weight: 600; }

/* Utility */
.text-bg-light { background: #f8f9fa; color:#333; }
</style>
