const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/dashboard', isAuthenticated, patientController.getDashboard);
router.post('/update-profile', isAuthenticated, patientController.updateProfile);

module.exports = router;