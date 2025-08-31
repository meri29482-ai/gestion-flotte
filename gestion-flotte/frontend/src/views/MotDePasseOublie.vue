<template>
  <div class="container mt-5" style="max-width: 500px;">
    <h2 class="text-sonatrach mb-3">🔐 Mot de passe oublié</h2>

    <!-- Étape 1 : Entrer l'email -->
    <div v-if="etape === 1">
      <p class="text-muted">Entrez votre adresse e-mail pour recevoir un code de réinitialisation.</p>
      <div class="mb-3">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          placeholder="prenom.nom@sonatrach.dz"
        />
      </div>
      <button
        class="btn btn-sonatrach w-100"
        @click="envoyerCode"
        :disabled="isCooldown || isSending"
      >
        <span v-if="isCooldown">⏳ Attendez {{ cooldown }}s</span>
        <span v-else-if="isSending">📤 Envoi...</span>
        <span v-else>📨 Envoyer le code</span>
      </button>
    </div>

    <!-- Étape 2 : Entrer le code reçu -->
    <div v-if="etape === 2">
      <p class="text-muted">
        Un code a été envoyé à votre email.
        <br />
        Temps restant : <strong>{{ tempsRestantAffichage }}</strong>
      </p>
      <div class="mb-3">
        <label>Code de vérification</label>
        <input
          v-model="code"
          type="text"
          class="form-control"
          placeholder="Ex: 123456"
        />
      </div>
      <button class="btn btn-sonatrach w-100" @click="verifierCode">✅ Vérifier le code</button>
    </div>

    <!-- Étape 3 : Saisir le nouveau mot de passe -->
    <div v-if="etape === 3">
      <p class="text-muted">Choisissez un nouveau mot de passe.</p>
      <div class="mb-3">
        <label>Nouveau mot de passe</label>
        <input
          v-model="nouveauMotDePasse"
          type="password"
          class="form-control"
          placeholder="********"
        />
      </div>
      <button class="btn btn-sonatrach w-100" @click="changerMotDePasse">💾 Modifier</button>
    </div>

    <!-- Alertes -->
    <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>
    <div v-if="erreur" class="alert alert-danger mt-3">{{ erreur }}</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MotDePasseOublie",
  data() {
    return {
      email: "",
      code: "",
      nouveauMotDePasse: "",
      etape: 1,
      message: "",
      erreur: "",
      isSending: false,
      isCooldown: false,
      cooldown: 0,
      cooldownTimer: null,
      tempsRestant: 0,
      timerInterval: null
    };
  },
  computed: {
    tempsRestantAffichage() {
      const minutes = Math.floor(this.tempsRestant / 60);
      const secondes = this.tempsRestant % 60;
      return `${minutes}:${secondes < 10 ? "0" : ""}${secondes}`;
    }
  },
  methods: {
    async envoyerCode() {
      this.message = "";
      this.erreur = "";

      if (this.isCooldown || this.isSending) return;

      if (!this.email) {
        this.erreur = "Veuillez saisir votre adresse e-mail.";
        return;
      }

      this.isSending = true;

      try {
        await axios.post("http://localhost:3000/api/utilisateurs/envoyer-code", {
          email: this.email
        });

        this.message = "📩 Code envoyé à votre adresse e-mail.";
        this.etape = 2;
        this.startCooldown(60); // 1 minute pour bloquer le bouton
        this.startTimer(40); // 5 minutes pour saisir le code
      } catch (err) {
        this.erreur = err.response?.data?.message || "❌ Erreur lors de l'envoi du code.";
      } finally {
        this.isSending = false;
      }
    },

    async verifierCode() {
      this.message = "";
      this.erreur = "";

      if (!this.code) {
        this.erreur = "Veuillez entrer le code reçu.";
        return;
      }

      try {
        await axios.post("http://localhost:3000/api/utilisateurs/verifier-code", {
          email: this.email,
          code: this.code
        });

        this.etape = 3;
        this.message = "✅ Code vérifié. Vous pouvez maintenant saisir un nouveau mot de passe.";
        this.clearTimer();
      } catch (err) {
        this.erreur = err.response?.data?.message || "❌ Code incorrect.";
      }
    },

    async changerMotDePasse() {
      this.message = "";
      this.erreur = "";

      if (!this.nouveauMotDePasse) {
        this.erreur = "Veuillez saisir un nouveau mot de passe.";
        return;
      }

      try {
        await axios.post("http://localhost:3000/api/utilisateurs/modifier-mot-de-passe", {
          email: this.email,
          nouveauMotDePasse: this.nouveauMotDePasse
        });

        this.message = "🔐 Mot de passe modifié avec succès.";
        this.resetAll();
      } catch (err) {
        this.erreur = err.response?.data?.message || "❌ Erreur lors de la modification.";
      }
    },

    startCooldown(seconds) {
      this.isCooldown = true;
      this.cooldown = seconds;

      this.cooldownTimer = setInterval(() => {
        this.cooldown--;
        if (this.cooldown <= 0) {
          clearInterval(this.cooldownTimer);
          this.isCooldown = false;
        }
      }, 1000);
    },

    startTimer(seconds) {
      this.tempsRestant = seconds;

      this.timerInterval = setInterval(() => {
        this.tempsRestant--;
        if (this.tempsRestant <= 0) {
          clearInterval(this.timerInterval);
          this.message = "";
          this.erreur = "⏱️ Temps expiré. Veuillez recommencer.";
          this.resetAll();
        }
      }, 1000);
    },

    clearTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    resetAll() {
      this.email = "";
      this.code = "";
      this.nouveauMotDePasse = "";
      this.etape = 1;
      this.clearTimer();
    }
  },
  beforeUnmount() {
    this.clearTimer();
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }
};
</script>

<style scoped>
.text-sonatrach {
  color: #f7941e;
}

.btn-sonatrach {
  background-color: #f7941e;
  color: white;
  border: none;
  font-weight: bold;
}

.btn-sonatrach:hover {
  background-color: #e67e00;
}

.alert {
  font-size: 0.95rem;
  padding: 10px;
}
</style>


<style scoped>
.text-sonatrach {
  color: #f7941e;
}

.btn-sonatrach {
  background-color: #f7941e;
  color: white;
  border: none;
  font-weight: bold;
}

.btn-sonatrach:hover {
  background-color: #e67e00;
}

.alert {
  font-size: 0.95rem;
  padding: 10px;
}
</style>
