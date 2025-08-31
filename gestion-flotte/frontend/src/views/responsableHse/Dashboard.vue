<template>
  <div class="dashboard-modern container-fluid py-4">
    <h2 class="mb-4 dashboard-title">
      <i class="bi bi-speedometer2 me-2"></i>Statistiques Parc & HSE
    </h2>

    <!-- KPI Cards -->
    <div class="row g-4 mb-4">
      <div
        class="col-sm-6 col-md-3"
        v-for="kpi in kpis"
        :key="kpi.label"
      >
        <div class="card kpi-card shadow-sm rounded-4 p-3 text-center">
          <div
            class="kpi-icon mb-2"
            :style="{ background: kpi.color + '15', color: kpi.color }"
          >
            <i :class="kpi.icon"></i>
          </div>
          <h3 class="kpi-value">{{ kpi.value }}</h3>
          <p class="kpi-label text-muted mb-0">{{ kpi.label }}</p>
        </div>
      </div>
    </div>

    <!-- Graphiques statistiques -->
    <div class="row g-4 mb-4">
      <!-- Missions par statut -->
      <div class="col-lg-6">
        <div class="card shadow-sm rounded-4 p-3">
          <h5 class="mb-6">Missions par statut</h5>
          <div
            v-for="(count, status) in missionsStats"
            :key="status"
            class="bar-row"
          >
            <span class="bar-label">{{ status }}</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                :style="{
                  width: (count / missionsTotal * 100) + '%',
                  background: missionsColors[status]
                }"
              ></div>
            </div>
            <span class="bar-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Incidents récents (Donut Chart + Légende) -->
      <div class="col-lg-6 text-center">
        <div class="card shadow-sm rounded-4 p-3 d-flex flex-column align-items-center">
          <h5 class="mb-3">Incidents récents</h5>
          <!-- Canvas fixe 5cm -->
          <canvas id="incidentsChart" width="188" height="188"></canvas>

          <!-- Légende personnalisée -->
          <div class="legend mt-3 justify-content-center">
            <div class="legend-item" v-for="(color, type) in incidentsColors" :key="type">
              <span class="legend-circle" :style="{ backgroundColor: color }"></span>
              <span class="legend-label">{{ type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Checklists et normes HSE -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card shadow-sm rounded-4 p-3 text-center progress-card">
          <h5>Checklists validées</h5>
          <h2>{{ checklistsValidCount }}/{{ checklists.length }}</h2>
          <div class="progress mt-2">
            <div
              class="progress-bar"
              :style="{ width: (checklistsValidCount / checklists.length * 100) + '%' }"
            ></div>
          </div>
          <p class="mt-2 text-muted">
            {{ Math.round((checklistsValidCount / checklists.length) * 100) }}%
          </p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card shadow-sm rounded-4 p-3 text-center progress-card">
          <h5>Normes HSE disponibles</h5>
          <h2>{{ normesHSE.length }}</h2>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-secondary" role="status"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default {
  name: "hseDashbord",
  data() {
    return {
      isLoading: false,
      missions: [],
      checklists: [],
      signalements: [],
      normesHSE: [],
      incidentsChart: null,
      missionsColors: {
        "en attente": "#adb5bd",
        "en cours": "#0d6efd",
        "terminer": "#198754",
        "annuler": "#fd7e14",
        "bloquer": "#dc3545"
      },
      incidentsColors: {
        "Panne": "#0d6efd",
        "Retard": "#ffc107",
        "Accident": "#dc3545",
        "Autre": "#6c757d"
      }
    };
  },
  computed: {
    kpis() {
      return [
        { label: "Missions", value: this.missions.length, icon: "bi bi-truck", color: "#0d6efd" },
        { label: "Incidents", value: this.signalements.length, icon: "bi bi-exclamation-triangle-fill", color: "#dc3545" },
        { label: "Checklists", value: this.checklists.length, icon: "bi bi-ui-checks-grid", color: "#198754" },
        { label: "Normes HSE", value: this.normesHSE.length, icon: "bi bi-journal-text", color: "#6c757d" }
      ];
    },
    missionsStats() {
      const stats = {};
      ["en attente", "en cours", "terminer", "annuler", "bloquer"].forEach(s => {
        stats[s] = this.missions.filter(m => m.etat === s).length;
      });
      return stats;
    },
    missionsTotal() {
      return this.missions.length || 1;
    },
    incidentsByType() {
      const stats = { Panne: 0, Retard: 0, Accident: 0, Autre: 0 };
      this.signalements.forEach(s => {
        if (stats[s.type] !== undefined) stats[s.type]++;
        else stats.Autre++;
      });
      return stats;
    },
    checklistsValidCount() {
      return this.checklists.filter(c => c.valide).length;
    }
  },
  methods: {
    async fetchDashboardData() {
      this.isLoading = true;
      try {
        const [missionsRes, checklistsRes, signalementsRes, normesRes] =
          await Promise.all([
            axios.get("http://localhost:3000/api/missions"),
            axios.get("http://localhost:3000/api/checklists"),
            axios.get("http://localhost:3000/api/signalements"),
            axios.get("http://localhost:3000/api/normes-hse")
          ]);
        this.missions = missionsRes.data;
        this.checklists = checklistsRes.data;
        this.signalements = signalementsRes.data;
        this.normesHSE = normesRes.data;
        this.renderIncidentsChart();
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    renderIncidentsChart() {
  if (this.incidentsChart) this.incidentsChart.destroy();
  const ctx = document.getElementById("incidentsChart");

  const total = this.totalIncidents;

  this.incidentsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(this.incidentsColors),
      datasets: [
        {
          data: Object.values(this.incidentsByType),
          backgroundColor: Object.values(this.incidentsColors),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutout: "50%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        // Plugin pour le texte central
        beforeDraw: function(chart) {
          const width = chart.width,
                height = chart.height,
                ctx = chart.ctx;
          ctx.restore();
          const fontSize = (height / 6).toFixed(2);
          ctx.font = fontSize + "px Arial";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          const text = total.toString(),
                x = width / 2,
                y = height / 2;
          ctx.fillText(text, x, y);
          ctx.save();
        }
      }
    }
  });
}

  },
  mounted() {
    this.fetchDashboardData();
  }
};
</script>

<style scoped>
.dashboard-modern {
  font-family: "Segoe UI", Roboto, sans-serif;
  background: #f8f9fa;
  color: #212529;
  min-height: 100vh;
  padding: 20px;
}
.dashboard-title {
  font-weight: 700;
  font-size: 1.8rem;
  color: #212529;
}

.card {
  background: #fff;
  border: none;
  color: #212529;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  font-size: 1.8rem;
  margin: auto;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: bold;
}

.bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.bar-label {
  width: 120px;
  font-weight: 500;
}
.bar-container {
  flex: 1;
  height: 14px;
  background: #e9ecef;
  border-radius: 8px;
  margin: 0 10px;
  overflow: hidden;
}
.bar-fill {
  height: 14px;
  border-radius: 8px;
  transition: width 0.6s ease;
}
.bar-count {
  width: 30px;
  text-align: right;
  font-weight: 600;
}

.progress {
  height: 16px;
  border-radius: 10px;
  overflow: hidden;
  background: #e9ecef;
}
.progress-bar {
  background: #6c757d;
}

/* Légende personnalisée */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  justify-content: center; 
}
.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #495057;
}
.legend-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}
</style>
