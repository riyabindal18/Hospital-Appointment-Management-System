const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.getBookingPage = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name')
      .select('specialization user');
    
    let selectedDoctor = null;
    if (req.query.doctorId) {
      selectedDoctor = await Doctor.findById(req.query.doctorId)
        .populate('user', 'name');
    }

    const formattedDoctors = doctors.map(doc => ({
      id: doc._id,
      name: doc.user.name,
      specialization: doc.specialization
    }));

    res.render('appointments/book', { 
      doctors: formattedDoctors,
      user: req.user,
      selectedDoctor: selectedDoctor
    });
  } catch (err) {
    console.error(err);
    res.render('appointments/book', { 
      doctors: [], 
      error: 'Error fetching doctors',
      user: req.user,
      selectedDoctor: null
    });
  }
};

exports.bookAppointment = async (req, res) => {
  const { patientName, doctorId, date } = req.body;
  await Appointment.create({ patientName, doctorId, date });
  res.redirect('/appointments/book');
};


