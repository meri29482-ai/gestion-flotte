<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100">
    <div class="card login-card shadow p-4">
      <div class="text-center mb-4">
        <img src="@/assets/logo.png" alt="Logo Sonatrach" class="logo mb-3" />
        <h2 class="login-title text-sonatrach">Connexion Sonatrach</h2>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group mb-3">
          <label for="email" class="form-label">Adresse Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            class="form-control"
            placeholder="prenom.nom@sonatrach.dz"
            required
          />
        </div>

        <div class="form-group mb-2">
          <label for="password" class="form-label">Mot de passe</label>
          <input
            id="password"
            type="password"
            v-model="password"
            class="form-control"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Lien mot de passe oublié -->
        <div class="text-end mb-3">
          <router-link to="/mot-de-passe-oublie" class="link-forgot">Mot de passe oublié ?</router-link>
        </div>

        <div v-if="error" class="alert alert-danger py-2 text-center">{{ error }}</div>

        <button type="submit" class="btn btn-sonatrach w-100">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async handleLogin() {
      this.error = ""; // reset l'erreur

      try {
        const response = await axios.post("http://localhost:3000/api/utilisateurs/login", {
          email: this.email,
          mot_de_passe: this.password, // ce nom doit être identique à ton backend
        });

        const { user, token } = response.data;

        // Stockage local
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        // Redirection par rôle
        switch (user.role) {
          case "ADMIN":
            this.$router.push("/admin/dashboard");
            break;
          case "RESPONSABLE_PARC":
            this.$router.push("/responsable/dashboard");
            break;
          case "CHAUFFEUR":
            this.$router.push("/chauffeur/dashboard");
            break;
          case "DEMANDEUR":
            this.$router.push("/demandeur/dashboard");
            break;
            case "RESPONSABLE_HSE":
            this.$router.push("/responsableHSE/dashboard");
            break;
            case "MANAGER":
            this.$router.push("/chefDepartement/dashboard");
            break;  
          default:
            this.error = "Rôle non reconnu.";
        }
      } catch (err) {
        console.error("Erreur login:", err.response?.data);
        this.error = err.response?.data?.message || "Erreur lors de la connexion.";
      }
    }
  },
};
</script>

<style scoped>
.login-container {
  background: url("@/assets/arrière-plan.jpg") no-repeat center center fixed;
  background-size: cover;
}
.logo {
  max-width: 80px;
}
.login-card {
  max-width: 400px;
  width: 100%;
  border-radius: 10px;
}
.text-sonatrach {
  color: #f7941e;
}
.btn-sonatrach {
  background-color: #f7941e;
  color: white;
  border: none;
}
.btn-sonatrach:hover {
  background-color: #e67c0e;
  color: white;
}
.link-forgot {
  font-size: 0.9rem;
  color: #f7941e;
  text-decoration: none;
}
.link-forgot:hover {
  text-decoration: underline;
  color: #e67c0e;
}
</style>
