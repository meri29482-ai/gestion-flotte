const db = require("../models");
const Checklist = db.checklists;
const Notifications = db.Notification;
const Vehicule = db.vehicules;
const Chauffeur = db.chauffeurs;
const Demande = db.demandes;
const Utilisateur = db.utilisateurs;
const Mission = db.missions;
const HeuresTravail = db.HeuresTravail; // ✅ ajout

exports.create = async (req, res) => {
  try {
    const {
      mission_id,
      vehicule_id,
      chauffeur_id,
      type_controle,
      kilometrage,
      remarques,
      niveau_huile,
      pression_pneus,
      phares,
      niveau_carburant,
      freins,
      ceintures
    } = req.body;

    // 🔍 récupérer mission + chauffeur + véhicule
    const mission = await Mission.findByPk(mission_id, {
      include: [{ model: Demande, as: "demande", attributes: ["n_ordre"] }]
    });
    const chauffeur = await Chauffeur.findByPk(chauffeur_id, {
      include: [{ model: Utilisateur, as: "utilisateur", attributes: ["nom", "prenom"] }]
    });
    const vehicule = await Vehicule.findByPk(vehicule_id);

    if (!mission || !chauffeur || !vehicule) {
      return res.status(404).json({ message: "Mission, chauffeur ou véhicule introuvable" });
    }

    const missionOrdre = mission.demande?.n_ordre || mission_id;
    const chauffeurNom = chauffeur.utilisateur?.nom || `Chauffeur#${chauffeur_id}`;

    // ➤ Détection d'anomalies
    const valeursAnormales = ["VIDE", "BASSE", "INEFFICACES", "DEFAILLANTS", "A_PLAT", "NON_CONFORMES"];
    const champValeurs = [niveau_huile, pression_pneus, phares, niveau_carburant, freins, ceintures];
    const valide = !champValeurs.some(val => valeursAnormales.includes(val));

    // ➤ Création de la checklist
    const checklist = await Checklist.create({
      mission_id,
      vehicule_id,
      chauffeur_id,
      type_controle,
      kilometrage,
      remarques,
      niveau_huile,
      pression_pneus,
      phares,
      niveau_carburant,
      freins,
      ceintures,
      valide
    });

    // ➤ Gestion des heures de travail + états chauffeur/vehicule
    let heureActuelle = new Date();

    if (type_controle === "AVANT_MISSION") {
      // Création d’un enregistrement avec heure de départ
      await HeuresTravail.create({
        mission_id,
        chauffeur_id,
        heure_depart: heureActuelle
      });

      // 🔄 Maj chauffeur et véhicule
      await chauffeur.update({ etat: "en mission" });
      await vehicule.update({ etat: "EN_MISSION" });

      // 🔔 Notification démarrage
      await Notifications.create({
        type: "INFO",
        titre: "🚗 Mission démarrée",
        message: `La mission ${missionOrdre} a démarré (chauffeur: ${chauffeurNom}).`,
        utilisateur_id: req.user?.id || null,
        recepteur_id: 22, // Responsable
        lu: 0,
        date_envoi: new Date()
      });

    } else if (type_controle === "APRES_MISSION") {
      // Récupérer l’entrée heures_travail correspondante
      const heuresTravail = await HeuresTravail.findOne({ where: { mission_id, chauffeur_id } });

      if (heuresTravail) {
        // Calcul de la durée
        const heureDepart = new Date(heuresTravail.heure_depart);
        const dureeMs = Math.max(0, heureActuelle - heureDepart); // sécurité
        const heures = Math.floor(dureeMs / (1000 * 60 * 60));
        const minutes = Math.floor((dureeMs % (1000 * 60 * 60)) / (1000 * 60));
        const secondes = Math.floor((dureeMs % (1000 * 60)) / 1000);

        const duree_total = `${heures.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${secondes.toString().padStart(2, "0")}`;

        await heuresTravail.update({
          heure_arrivee: heureActuelle,
          duree_total
        });
      }

      // 🔄 Maj chauffeur et véhicule
      await chauffeur.update({ etat: "Dispo" });
      await vehicule.update({ etat: "DISPO" });

      // 🔔 Notification fin
      await Notifications.create({
        type: "INFO",
        titre: "✅ Mission terminée",
        message: `La mission ${missionOrdre} est terminée (chauffeur: ${chauffeurNom}).`,
        utilisateur_id: req.user?.id || null,
        recepteur_id: 22,
        lu: 0,
        date_envoi: new Date()
      });
    }

    // ➤ Si checklist invalide → notifier le responsable
    if (!valide) {
      await Notifications.create({
        type: "ALERTE",
        titre: "🚨 Anomalie détectée",
        message: `⚠️ Une anomalie a été détectée lors du contrôle ${type_controle === 'AVANT_MISSION' ? 'avant mission' : 'après mission'} (mission ${missionOrdre}, chauffeur: ${chauffeurNom}).`,
        utilisateur_id: req.user?.id || null,
        recepteur_id: 22,
        lu: 0,
        date_envoi: new Date()
      });
    }

    res.status(201).json({ message: "Checklist enregistrée avec succès", checklist });
  } catch (err) {
    console.error("❌ Erreur lors de la création de checklist :", err);
    res.status(500).json({ message: "Erreur lors de la création", error: err.message });
  }
};



exports.findAll = async (req, res) => {

  try {
    const checklists = await Checklist.findAll({
      include: [
        {
          model: Mission,
          as: 'mission',
          attributes: ["id"],
          include: [
            {
              model: Vehicule,
              as: "vehicule",
              attributes: ["immatriculation", "marque", "modele"]
            },
            {
              model: Chauffeur,
              as: "chauffeur",
              attributes: ["id"],
              include: [
                {
                  model: Utilisateur,
                  as: "utilisateur",
                  attributes: ["nom", "prenom"]
                }
              ]
            },
            {
              model: Demande,
              as: "demande",
              attributes: ["n_ordre"]
            }
          ]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json(checklists);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération des checklists",
      error: err.message
    });
  }
};



exports.findOne = async (req, res) => {
  try {
    const data = await Checklist.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Checklist introuvable" });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Checklist.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ message: "Checklist non trouvée" });
    }

    const updatedChecklist = await Checklist.findByPk(req.params.id);
    res.status(200).json(updatedChecklist);
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour", error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Checklist.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Checklist non trouvée" });
    }

    res.status(200).json({ message: "Checklist supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
};
