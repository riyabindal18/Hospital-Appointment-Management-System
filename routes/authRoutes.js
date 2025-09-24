const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  res.render('auth/login');
});

router.get('/register', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  res.render('auth/register');
});

router.post('/login', authController.login);
router.post('/register', authController.register);

router.get('/logout', isAuthenticated, authController.logout);

router.get('/test-auth', isAuthenticated, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: req.user
  });
});

router.get('/debug-token', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: 'No token found' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      message: 'Token is valid',
      decoded
    });
  } catch (err) {
    res.json({
      message: 'Token is invalid',
      error: err.message
    });
  }
});

module.exports = router;
