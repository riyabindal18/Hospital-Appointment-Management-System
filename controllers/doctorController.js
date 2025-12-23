const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.getAddDoctor = (req, res) => {
  res.render('doctors/add', { user: req.user });
};

exports.postAddDoctor = async (req, res) => {
  const { name, specialization, experience, contact, photo } = req.body;
  console.log('Received photo from req.body:', photo);
  try {
    const doctor = new Doctor({
      user: req.user.id,
      name,
      specialization,
      experience,
      contact,
      photo: photo || null
    });
    await doctor.save();
    console.log('Saved doctor photo:', doctor.photo);
    res.redirect('/doctors');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding doctor');
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name')
      .exec();

    const formattedDoctors = doctors.map(doc => {
      console.log('Doctor photo in DB:', doc.photo);
      return {
        _id: doc._id,
        name: doc.name || (doc.user ? doc.user.name : 'Dr. Unknown'),
        specialization: doc.specialization,
        experience: doc.experience,
        contact: doc.contact,
        photo: doc.photo,
        availability: doc.availability
      };
    });

    res.render('doctors/list', {
      doctors: formattedDoctors,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching doctors');
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patient', 'name')
      .sort({ date: 1 });

    res.render('doctors/schedule', { doctor, appointments, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading schedule');
  }
};

exports.setAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;
    const doctor = await Doctor.findOne({ user: req.user.id });
    doctor.availability.push({ day, startTime, endTime });
    await doctor.save();
    res.redirect('/doctors/schedule');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error setting availability');
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    await Appointment.findByIdAndUpdate(appointmentId, { status });
    res.redirect('/doctors/schedule');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating appointment');
  }
};

exports.getMyPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).send('Doctor not found');
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patient', 'name email')
      .sort({ date: -1 });

    const patientMap = new Map();
    appointments.forEach(apt => {
      if (!patientMap.has(apt.patient._id.toString())) {
        patientMap.set(apt.patient._id.toString(), {
          _id: apt.patient._id,
          name: apt.patient.name,
          email: apt.patient.email,
          lastAppointment: apt.date
        });
      }
    });

    const patients = Array.from(patientMap.values());

    res.render('doctors/patients', { patients, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching patients');
  }
};
