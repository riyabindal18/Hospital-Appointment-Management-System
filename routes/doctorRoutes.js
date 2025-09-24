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

module.exports = router;
