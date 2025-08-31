// controllers/intervention.controller.js
const db = require("../models");
const Achat = db.Achat;
const Piece = db.Piece;
const Maintenance = db.maintenance;
const Intervention = db.Intervention;
const Vehicule = db.vehicules; // ✅ Important : importer Vehicule
exports.createIntervention = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      vehicule_id,
      priorite,
      type_demande,
      cout,
      delai,
      description,
      fournisseur,
      pieces,
      type_principal,
      categorie,
      duree,
      observation
    } = req.body;

    // Vérifications simples (exemple)
    if (!vehicule_id || !priorite || !type_demande) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const intervention = await Intervention.create({
      vehicule_id,
      priorite,
      type_demande,
      cout,
      statut: "En attente",
    }, { transaction: t });

    if(type_demande === "achat") {
      const achat = await Achat.create({
        intervention_id: intervention.id,
        delai,
        description,
        fournisseur,
      }, { transaction: t });

      if(pieces && pieces.length > 0){
        for(const p of pieces){
          await Piece.create({
            achat_id: achat.id,
            nom_piece: p.nom_piece,
            quantite: p.quantite,
            prix_unitaire: p.prix_unitaire,
            observation: p.observation || null,
          }, { transaction: t });
        }
      }
    } else if(type_demande === "maintenance") {
      await Maintenance.create({
        intervention_id: intervention.id,
        type_principal,
        categorie,
        duree,
        observation,
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Intervention créée avec succès", intervention_id: intervention.id });
  } catch (error) {
    await t.rollback();
    console.error("Erreur création intervention :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création", details: error.message });
  }
};


// ✅ Récupérer toutes les interventions avec le véhicule
exports.findAll = async (req, res) => {
  try {
    const interventions = await Intervention.findAll({
      include: [
        {
          model: Vehicule,
          as: "vehicule",   // Assure-toi que l'alias correspond à ton association
          attributes: ["marque", "modele", "type"] // Champs que tu veux récupérer
        }
      ]
    });
    res.json(interventions);
  } catch (error) {
    console.error("Erreur findAll interventions :", error);
    res.status(500).json({ message: error.message });
  }
};
// Détails d'une intervention (debug)
exports.getInterventionDetailsDebug = async (req, res) => {
  const { id } = req.params;
  console.log("➡️ getInterventionDetailsDebug appelé pour id =", id);

  try {
    const intervention = await Intervention.findByPk(id, {
      include: [
        {
          model: Achat,
          as: "achat",
          include: [{ model: Piece, as: "pieces" }]
        },
        { 
          model: Maintenance, 
          as: "maintenance" 
        },
        { 
          model: Vehicule, 
          as: "vehicule",
          attributes: ["marque", "modele", "type"]
        }
      ]
    });

    if (!intervention) {
      console.log("❌ Intervention non trouvée");
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    const json = intervention.toJSON();
    console.log("✅ Intervention récupérée :", JSON.stringify(json, null, 2));

    res.json(json);
  } catch (error) {
    console.error("❌ Erreur getInterventionDetailsDebug :", error);
    res.status(500).json({ message: "Erreur serveur", details: error.message });
  }
};