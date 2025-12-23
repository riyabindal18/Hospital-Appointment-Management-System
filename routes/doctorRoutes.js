const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/add', isAuthenticated, (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'doctor')) {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
}, doctorController.getAddDoctor);

router.post('/add', isAuthenticated, (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'doctor')) {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
}, doctorController.postAddDoctor);

router.get('/', isAuthenticated, doctorController.getAllDoctors);

router.get('/schedule', isAuthenticated, (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
}, doctorController.getSchedule);

router.post('/set-availability', isAuthenticated, (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
}, doctorController.setAvailability);

router.post('/update-appointment', isAuthenticated, (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
}, doctorController.updateAppointmentStatus);

router.get('/patients', isAuthenticated, (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).send('Access Denied');
  }
}, doctorController.getMyPatients);

module.exports = router;
