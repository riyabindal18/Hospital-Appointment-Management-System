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
  try {
    const doctor = await Doctor.findById(doctorId);
    console.log('Doctor availability:', doctor.availability);
    console.log('Requested date:', date);

    
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleString('en-US', { weekday: 'long' });
    const time = appointmentDate.toTimeString().slice(0, 5); 

    console.log('Day of week:', dayOfWeek, 'Time:', time);

    
    const availableSlot = doctor.availability.find(slot => slot.day === dayOfWeek);
    if (!availableSlot) {
      return res.status(400).send('Doctor is not available on this day.');
    }

    if (time < availableSlot.startTime || time > availableSlot.endTime) {
      return res.status(400).send('Appointment time is outside doctor\'s availability.');
    }

    await Appointment.create({ patient: req.user.id, patientName, doctorId, date });
    res.redirect('/appointments/book');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error booking appointment');
  }
};


