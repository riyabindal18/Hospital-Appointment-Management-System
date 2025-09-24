const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, experience, contact } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', { 
        error: 'Email already registered' 
      });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient'
    });
    await user.save();

    if (role === 'doctor') {
      const doctor = new Doctor({
        user: user._id,
        name,
        specialization,
        experience: parseInt(experience),
        contact
      });
      await doctor.save();
    }

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { 
      error: 'Registration failed' 
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('auth/login', { error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
