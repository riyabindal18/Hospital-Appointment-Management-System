const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/patient/:patientId', isAuthenticated, medicalRecordController.getRecords);
router.get('/add/:patientId', isAuthenticated, medicalRecordController.getAddRecordForm);
router.post('/add/:patientId', isAuthenticated, medicalRecordController.createRecord);
router.get('/edit/:id', isAuthenticated, medicalRecordController.getEditRecordForm);
router.post('/edit/:id', isAuthenticated, medicalRecordController.updateRecord);
router.post('/delete/:id', isAuthenticated, medicalRecordController.deleteRecord);

module.exports = router;