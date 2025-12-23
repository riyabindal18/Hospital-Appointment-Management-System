const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const doctorRoutes = require('./routes/doctorRoutes');
const Doctor = require('./models/Doctor');
const jwt = require('jsonwebtoken');

require('dotenv').config();
require('./config/db'); 

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;
      req.user = decoded;
    } catch (err) {
      res.locals.user = null;
      res.clearCookie('token');
    }
  } else {
    res.locals.user = null;
  }
  next();
});


app.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name')
      .limit(3);

    const formattedDoctors = doctors.map(doc => ({
      _id: doc._id,
      name: doc.name || (doc.user ? doc.user.name : 'Dr. Unknown'),
      specialization: doc.specialization,
      experience: doc.experience,
      contact: doc.contact
    }));

    res.render('home', { doctors: formattedDoctors });
  } catch (err) {
    console.error(err);
    res.render('home', { doctors: [] });
  }
});


app.use('/', require('./routes/authRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/doctors', doctorRoutes);
app.use('/patient', require('./routes/patientRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/feedback', require('./routes/feedbackRoutes'));
app.use('/medical-records', require('./routes/medicalRecordRoutes'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
