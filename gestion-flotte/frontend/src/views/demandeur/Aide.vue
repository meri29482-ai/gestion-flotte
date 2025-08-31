<template>
  <div class="aide-demandeur">
    <h1>📘 Aide - Demandeur</h1>

    <section>
      <h2>1️⃣ Créer une nouvelle demande</h2>
      <p>
        Pour soumettre une nouvelle mission :
      </p>
      <ul>
        <li>Cliquez sur <strong>➕ Nouvelle Demande</strong> dans le tableau de bord.</li>
        <li>Remplissez le formulaire avec les informations demandées (numéro d’ordre, dates, destination, etc.).</li>
        <li>Cliquez sur <strong>Soumettre</strong> pour envoyer la demande au responsable.</li>
      </ul>
    </section>

    <section>
      <h2>2️⃣ Suivre vos demandes</h2>
      <p>
        Sur votre tableau de bord, vous pouvez voir :
      </p>
      <ul>
        <li>Le nombre total de vos demandes.</li>
        <li>Les demandes en attente, validées ou rejetées.</li>
        <li>Les détails des dernières demandes dans un tableau.</li>
      </ul>
    </section>

    <section>
      <h2>3️⃣ Statuts des demandes</h2>
      <p>Les demandes peuvent avoir l’un des statuts suivants :</p>
      <ul>
        <li><span class="badge en">En cours</span> : En cours de validation.</li>
        <li><span class="badge validée">Planifier</span> : Acceptée par le responsable.</li>
        <li><span class="badge rejetée">Rejetée</span> : Refusée (voir l’observation si disponible).</li>
      </ul>
    </section>

    <section>
      <h2>4️⃣ Assistance</h2>
      <p>
        Si vous rencontrez un problème technique ou si vous avez des questions, veuillez contacter le service informatique ou envoyer un e-mail à : <a href="mailto:support@iap.dz">support@iap.dz</a>.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: "DemandeurAide"
};
</script>

<style scoped>
.aide-demandeur {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  color: #ff7a00;
  margin-bottom: 2rem;
  text-align: center;
}

h2 {
  font-size: 1.4rem;
  color: #333;
  margin-top: 1.5rem;
}

ul {
  padding-left: 1.5rem;
  list-style: disc;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: #0077cc;
  text-decoration: underline;
}

.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
}

.badge.en {
  background-color: #ff9800;
}
.badge.validée {
  background-color: #4caf50;
}
.badge.rejetée {
  background-color: #f44336;
}
</style>


