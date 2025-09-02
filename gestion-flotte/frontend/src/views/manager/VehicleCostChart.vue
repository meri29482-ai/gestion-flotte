<template>
  <div style="height: 400px;">
    <h3>💰 Coût total par véhicule</h3>
    <!-- ✅ Affichage conditionnel -->
    <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
    <p v-else>Aucune donnée de coût disponible</p>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";

// ✅ Enregistrement des composants Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default defineComponent({
  name: "VehicleCostChart",
  components: { Bar },
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const chartData = ref({
      labels: [],
      datasets: [
        {
          label: "Coût total (€)",
          backgroundColor: "#FFA500", // orange
          borderRadius: 6,
          data: [],
        },
      ],
    });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (context) => `💰 ${context.raw} €`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value} €`,
          },
        },
      },
    };

    // ✅ Met à jour le graphe quand `props.data` change
    watch(
      () => props.data,
      (newData) => {
        if (Array.isArray(newData)) {
          chartData.value.labels = newData.map((item) =>
            typeof item.vehicule === "string"
              ? item.vehicule
              : `Véhicule #${item.id || "?"}`
          );
          chartData.value.datasets[0].data = newData.map((item) =>
            parseFloat(item.total_cout || 0)
          );
        }
      },
      { immediate: true }
    );

    return { chartData, chartOptions };
  },
});
</script>
