<template>
  <div class="container demandeur-form-sonatrach py-5">
    <h3 class="text-center text-orange fw-bold mb-4">
      <i class="bi bi-truck-front me-2"></i> Nouvelle Demande de Véhicule
    </h3>

    <form @submit.prevent="submitForm" class="form-box p-4 bg-white rounded shadow-sm">
      <div class="mb-3">
        <label class="form-label">Numéro d'ordre</label>
        <input
          type="text"
          class="form-control"
          v-model="form.n_ordre"
          placeholder="Ex: D123"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Type de trajet</label>
        <div class="d-flex gap-4">
          <div class="form-check">
            <input class="form-check-input" type="radio" id="aller" value="ALLER_SIMPLE" v-model="form.type_trajet" />
            <label class="form-check-label" for="aller">Aller simple</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="allerRetour" value="ALLER_RETOUR" v-model="form.type_trajet" />
            <label class="form-check-label" for="allerRetour">Aller & Retour</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Date et heure de départ</label>
        <input
          type="datetime-local"
          class="form-control"
          v-model="form.date_heure_debut"
          required
        />
      </div>

      <div class="mb-3" v-if="form.type_trajet === 'ALLER_RETOUR'">
        <label class="form-label">Date et heure de retour</label>
        <input
          type="datetime-local"
          class="form-control"
          v-model="form.date_heure_fin"
          :required="form.type_trajet === 'ALLER_RETOUR'"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Destination</label>
        <input
          type="text"
          class="form-control"
          v-model="form.destination"
          placeholder="Lieu d'arrivée"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Itinéraire</label>
        <textarea
          class="form-control"
          v-model="form.itineraire"
          placeholder="Ex: Hassi Messaoud → In Amenas"
          rows="2"
        ></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Observation</label>
        <textarea
          class="form-control"
          v-model="form.observation"
          placeholder="Informations supplémentaires (facultatif)"
          rows="3"
        ></textarea>
      </div>

      <div class="text-center mt-4">
        <button type="submit" class="btn btn-orange px-5 py-2" :disabled="isSubmitting">
          <i class="bi bi-send-fill me-2"></i> Envoyer
        </button>
      </div>

      <div v-if="error" class="alert alert-danger text-center mt-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NouvelleDemandeVehicule",
  data() {
    return {
      form: {
        n_ordre: "",
        type_trajet: "ALLER_SIMPLE",
        date_heure_debut: "",
        date_heure_fin: "",
        destination: "",
        itineraire: "",
        observation: "",
        etat: "EN COURS"
      },
      utilisateur: null,
      isSubmitting: false,
      error: null
    };
  },
  methods: {
    validateForm() {
      const { n_ordre, date_heure_debut, destination, type_trajet, date_heure_fin } = this.form;

      if (!n_ordre || !date_heure_debut || !destination) {
        this.error = "Veuillez remplir tous les champs obligatoires.";
        return false;
      }

      const debut = new Date(date_heure_debut);
      if (isNaN(debut.getTime())) {
        this.error = "Date de départ invalide.";
        return false;
      }

      if (type_trajet === "ALLER_RETOUR") {
        const fin = new Date(date_heure_fin);
        if (isNaN(fin.getTime())) {
          this.error = "Date de retour invalide.";
          return false;
        }
        if (fin <= debut) {
          this.error = "Le retour doit être après le départ.";
          return false;
        }
      }

      this.error = null;
      return true;
    },

    async submitForm() {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        this.error = "⚠️ Utilisateur non identifié.";
        return;
      }

      try {
        this.utilisateur = JSON.parse(userData);
      } catch (e) {
        this.error = "Erreur utilisateur.";
        return;
      }

      if (!this.validateForm()) return;

      this.isSubmitting = true;

      try {
        await axios.post("http://localhost:3000/api/demandes", {
          ...this.form,
          utilisateur_id: this.utilisateur.id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.resetForm();
        alert("✅ Demande envoyée avec succès !");
      } catch (error) {
        this.error = "❌ Une erreur est survenue lors de l'envoi.";
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.form = {
        n_ordre: "",
        type_trajet: "ALLER_SIMPLE",
        date_heure_debut: "",
        date_heure_fin: "",
        destination: "",
        itineraire: "",
        observation: "",
        etat: "EN COURS"
      };
      this.error = null;
    }
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (!userData) {
      this.error = "⚠️ Utilisateur non identifié.";
      return;
    }

    try {
      this.utilisateur = JSON.parse(userData);
    } catch (err) {
      this.error = "⚠️ Erreur lors du chargement de l'utilisateur.";
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');

.demandeur-form-sonatrach {
  font-family: 'Poppins', sans-serif;
  max-width: 850px;
  margin: auto;
}

.text-orange {
  color: #ff7a00;
}

.btn-orange {
  background-color: #ff7a00;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  transition: background 0.3s ease, transform 0.2s ease;
  border: none;
}
.btn-orange:hover {
  background-color: #e86c00;
  transform: scale(1.03);
}

.form-control {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  background-color: #fdfdfd;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}
.form-control:focus {
  border-color: #ff7a00;
  box-shadow: none;
}

label.form-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.4rem;
}

.form-check-input {
  margin-top: 0.3rem;
}
</style>