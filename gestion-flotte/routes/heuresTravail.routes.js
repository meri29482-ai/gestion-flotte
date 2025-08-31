const express = require('express');
const router = express.Router();
const heuresTravailController = require('../controllers/heuresTravail.controller');

router.post('/', heuresTravailController.create);
router.get('/', heuresTravailController.findAll);
router.get('/:id', heuresTravailController.findOne);
router.get('/chauffeur/:chauffeur_id', heuresTravailController.findByChauffeurId);
router.put('/:id', heuresTravailController.update);
router.delete('/:id', heuresTravailController.delete);



module.exports = router;
