const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/book', isAuthenticated, appointmentController.getBookingPage);
router.post('/book', isAuthenticated, appointmentController.bookAppointment);

module.exports = router;
