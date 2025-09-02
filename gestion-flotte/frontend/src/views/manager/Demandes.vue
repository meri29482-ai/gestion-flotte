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
              <td class="flex flex-col gap-1">
                <button class="sh-btn sh-btn-primary" @click="viewDetails(it)">
                  <i class="fas fa-eye"></i> Détails
                </button>
                <button class="sh-btn sh-btn-outline" @click="exportPDF(it)">
                  <i class="fas fa-file-pdf"></i> Exporter
                </button>
                <button class="sh-btn sh-btn-success" @click="updateStatus(it, 'valider')">
                  ✅ Valider
                </button>
                <button class="sh-btn sh-btn-danger" @click="updateStatus(it, 'rejeter')">
                  ❌ Refuser
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
      vehicules: [],
      interventions: [],
      selectedIntervention: null,
    };
  },
  methods: {
    async updateStatus(intervention, action) {
  try {
    const url = `http://localhost:3000/api/interventions/${intervention.id}/${action}`;
    await axios.put(url);


    // ✅ Appeler l’API notification
    await axios.post("http://localhost:3000/api/notifications/intervention", {
      intervention_id: intervention.id,
      statut: intervention.statut
    });

    alert(`Intervention ${intervention.statut} et notification envoyée ✅`);

    this.interventions = this.interventions.filter(i => i.id !== intervention.id);


  } catch (err) {
    console.error("Erreur updateStatus :", err);
    alert("Erreur lors de la mise à jour ❌");
  }
}
,
    async fetchVehicules() {
      try {
        const res = await axios.get("http://localhost:3000/api/vehicules");
        this.vehicules = res.data;
      } catch (error) {
        console.error("Erreur récupération véhicules :", error);
      }
    },

   async fetchInterventions() {
  try {
    const res = await axios.get("http://localhost:3000/api/interventions");
    this.interventions = res.data.filter(it => 
      (it.statut || "").toLowerCase().includes("attente")
    );
  } catch (err) {
    console.error("Erreur récupération interventions :", err);
  }

    },

    async viewDetails(intervention) {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/interventions/${intervention.id}/details-debug`
        );
        this.selectedIntervention = res.data;
      } catch (err) {
        console.error("Erreur détails intervention :", err);
      }
    },
    
    
    
    


    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("fr-FR") : "-";
    },

    statusClass(statut) {
      const s = (statut || "").toLowerCase();
      return {
        "sh-badge--status-await": s.includes("attente"),
        "sh-badge--status-run": s.includes("cours"),
        "sh-badge--status-done": s.includes("validée"),
        "sh-badge--status-refused": s.includes("refusée"),
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

    calculateTotalParts(pieces) {
      return pieces.reduce((total, piece) => {
        return total + (piece.quantite * parseFloat(piece.prix_unitaire));
      }, 0);
    },

    async exportPDF(intervention) {
      try {
        if (!intervention || !intervention.id) return;

        const type = intervention.type_demande;
        if (!type) return;

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

        await axios.post("http://localhost:3000/api/documents/from-intervention", {
          intervention_id: intervention.id,
          type,
        });
      } catch (err) {
        console.error("Erreur export PDF :", err);
      }
    },
  },
  mounted() {
    this.fetchInterventions();
    this.fetchVehicules();
  },
};
</script>
 <style>
        :root {
            /* Palette de couleurs professionnelle */
            --primary: #FF7700;
            --primary-light: #FF9838;
            --primary-dark: #E06A00;
            --primary-soft: #FFF4EA;
            
            --dark: #2D3748;
            --dark-light: #4A5568;
            --gray: #A0AEC0;
            --gray-light: #EDF2F7;
            --white: #FFFFFF;
            
            --success: #38A169;
            --danger: #E53E3E;
            --warning: #DD6B20;
            --info: #3182CE;
            
            /* Variables de design */
            --border-radius: 8px;
            --border-radius-lg: 12px;
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --transition: all 0.2s ease-in-out;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background-color: #F7FAFC;
            color: var(--dark);
            line-height: 1.6;
            padding: 0;
            margin: 0;
        }

        /* Layout principal */
        .sh-page {
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* En-tête */
        .sh-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
            flex-wrap: wrap;
            gap: 16px;
            padding: 16px 24px;
            background: var(--white);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
        }

        .sh-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--dark);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .sh-title i {
            color: var(--primary);
        }

        /* Boutons */
        .sh-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
            border: none;
            gap: 8px;
            font-size: 14px;
        }

        .sh-btn-primary {
            background-color: var(--primary);
            color: var(--white);
            box-shadow: var(--shadow-md);
        }

        .sh-btn-primary:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .sh-btn-outline {
            background-color: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
        }

        .sh-btn-outline:hover {
            background-color: var(--primary);
            color: var(--white);
        }

        /* Filtres et recherche */
        .sh-filter {
            margin: 24px 0;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }

        .sh-input {
            padding: 12px 16px;
            border: 1px solid var(--gray-light);
            border-radius: var(--border-radius);
            font-size: 14px;
            transition: var(--transition);
            background-color: var(--white);
            box-shadow: var(--shadow-sm);
        }

        .sh-input:focus {
            outline: none;
            border-color: var(--primary-light);
            box-shadow: 0 0 0 3px rgba(255, 119, 0, 0.15);
        }

        /* Cartes */
        .sh-card {
            background: var(--white);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 0;
            transition: var(--transition);
            margin-bottom: 24px;
            overflow: hidden;
        }

        .sh-card:hover {
            box-shadow: var(--shadow-md);
        }

        .sh-card__header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--gray-light);
            background-color: var(--white);
        }

        .sh-card__title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            color: var(--dark);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sh-card__body {
            padding: 24px;
        }

        /* Tableaux */
        .sh-table-wrapper {
            overflow-x: auto;
            border-radius: var(--border-radius);
        }

        .sh-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
        }

        .sh-table th {
            background-color: var(--gray-light);
            color: var(--dark);
            padding: 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid var(--gray-light);
        }

        .sh-table td {
            padding: 16px;
            border-bottom: 1px solid var(--gray-light);
            font-size: 14px;
        }

        .sh-table tr:last-child td {
            border-bottom: none;
        }

        .sh-table tr {
            transition: var(--transition);
            background-color: var(--white);
        }

        .sh-table tr:hover {
            background-color: var(--primary-soft);
        }

        /* Badges */
        .sh-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 600;
            gap: 4px;
        }

        .sh-badge--status-done {
            background-color: rgba(56, 161, 105, 0.15);
            color: var(--success);
        }

        .sh-badge--status-refused {
            background-color: rgba(229, 62, 62, 0.15);
            color: var(--danger);
        }

        .sh-badge--prio-high {
            background-color: rgba(229, 62, 62, 0.15);
            color: var(--danger);
        }

        .sh-badge--prio-mid {
            background-color: rgba(221, 107, 32, 0.15);
            color: var(--warning);
        }

        .sh-badge--prio-low {
            background-color: rgba(49, 130, 206, 0.15);
            color: var(--info);
        }

        /* Modal */
        .sh-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            backdrop-filter: blur(4px);
            animation: fadeIn 0.3s ease;
        }

        .sh-modal__content {
            background-color: var(--white);
            border-radius: var(--border-radius-lg);
            width: 100%;
            max-width: 700px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
            animation: scaleIn 0.3s ease;
        }

        .sh-modal__header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 24px;
            border-bottom: 1px solid var(--gray-light);
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: var(--white);
        }

        .sh-modal__titleblock {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .sh-modal__title {
            margin: 0;
            color: var(--white);
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sh-modal__close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            font-size: 1.5rem;
            color: var(--white);
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: var(--transition);
        }

        .sh-modal__close:hover {
            background-color: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }

        .sh-modal__body {
            padding: 24px;
        }

        .sh-modal__footer {
            padding: 24px;
            border-top: 1px solid var(--gray-light);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        /* Véhicule Card */
        .sh-vehcard {
            display: flex;
            align-items: center;
            padding: 20px;
            background: linear-gradient(to right, var(--primary-soft) 0%, var(--gray-light) 100%);
            border-radius: var(--border-radius);
            margin: 16px 0;
            transition: var(--transition);
        }

        .sh-vehcard:hover {
            transform: translateX(5px);
        }

        .sh-vehcard__icon {
            font-size: 2.5rem;
            margin-right: 20px;
            color: var(--primary);
        }

        .sh-vehcard__title {
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--dark);
        }

        .sh-vehcard__meta {
            display: flex;
            gap: 16px;
        }

        .sh-vehcard__meta span {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--dark-light);
            font-size: 14px;
        }

        /* Info Cards */
        .sh-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 24px;
        }

        .sh-infocard {
            background-color: var(--white);
            border-radius: var(--border-radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
        }

        .sh-infocard:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
        }

        .sh-infocard__head {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: var(--white);
        }

        .sh-infocard__head h4 {
            margin: 0;
            font-weight: 600;
        }

        .sh-infocard__body {
            padding: 20px;
        }

        .sh-kv {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--gray-light);
        }

        .sh-kv:last-child {
            border-bottom: none;
        }

        /* Utilitaires */
        .text-center {
            text-align: center;
        }

        .text-muted {
            color: var(--gray);
        }

        .mono {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 13px;
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sh-page {
                padding: 16px;
            }
            
            .sh-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .sh-grid {
                grid-template-columns: 1fr;
            }
            
            .sh-modal__content {
                margin: 0 16px;
            }
            
            .sh-vehcard {
                flex-direction: column;
                text-align: center;
            }
            
            .sh-vehcard__icon {
                margin-right: 0;
                margin-bottom: 16px;
            }
            
            .sh-vehcard__meta {
                flex-direction: column;
                gap: 8px;
            }
            
            .sh-table th, 
            .sh-table td {
                padding: 12px 8px;
            }
        }
    </style>