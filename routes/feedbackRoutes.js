const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/submit', isAuthenticated, feedbackController.getSubmitFeedback);
router.post('/submit', isAuthenticated, feedbackController.postSubmitFeedback);

module.exports = router;