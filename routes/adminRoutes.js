const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
};

router.get('/dashboard', isAuthenticated, adminOnly, adminController.getDashboard);
router.get('/users', isAuthenticated, adminOnly, adminController.manageUsers);
router.post('/users', isAuthenticated, adminOnly, adminController.createUser);
router.post('/users/:userId/toggle', isAuthenticated, adminOnly, adminController.toggleUserStatus);
router.get('/appointments', isAuthenticated, adminOnly, adminController.manageAppointments);
router.post('/appointments/update', isAuthenticated, adminOnly, adminController.updateAppointmentStatus);
router.get('/medical-records', isAuthenticated, adminOnly, adminController.manageMedicalRecords);
router.post('/medical-records/:recordId/delete', isAuthenticated, adminOnly, adminController.deleteMedicalRecord);
router.get('/doctors', isAuthenticated, adminOnly, adminController.manageDoctors);
router.post('/doctors', isAuthenticated, adminOnly, adminController.createDoctor);
router.get('/reports', isAuthenticated, adminOnly, adminController.getReports);
router.get('/feedback', isAuthenticated, adminOnly, adminController.viewFeedback);

module.exports = router;