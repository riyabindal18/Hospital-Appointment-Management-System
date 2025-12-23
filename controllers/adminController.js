const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Feedback = require('../models/Feedback');
const MedicalRecord = require('../models/MedicalRecord');
const bcrypt = require('bcrypt');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const totalMedicalRecords = await MedicalRecord.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    res.render('admin/dashboard', {
      stats: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        totalMedicalRecords,
        totalFeedback
      },
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading admin dashboard');
  }
};

exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role isActive');
    res.render('admin/users', { users, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading users');
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    user.isActive = !user.isActive;
    await user.save();
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating user');
  }
};

exports.manageAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name')
      .populate('doctorId')
      .sort({ date: -1 });

    
    console.log('Total appointments found:', appointments.length);
    if (appointments.length > 0) {
      console.log('First appointment:', {
        patientName: appointments[0].patientName,
        doctorId: appointments[0].doctorId,
        doctorId_type: typeof appointments[0].doctorId,
        doctorId_populated: appointments[0].doctorId ? 'YES' : 'NO',
        doctor_name: appointments[0].doctorId ? appointments[0].doctorId.name : 'NO NAME'
      });
    }

    res.render('admin/appointments', { appointments, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading appointments');
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    await Appointment.findByIdAndUpdate(appointmentId, { status });
    res.redirect('/admin/appointments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating appointment');
  }
};

exports.viewFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('patient', 'name')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ date: -1 });

    res.render('admin/feedback', { feedbacks, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading feedback');
  }
};

exports.manageMedicalRecords = async (req, res) => {
  try {
    const medicalRecords = await MedicalRecord.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    res.render('admin/medicalRecords', { medicalRecords, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading medical records');
  }
};

exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    await MedicalRecord.findByIdAndDelete(recordId);
    res.redirect('/admin/medical-records');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting medical record');
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    await user.save();

    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
};

exports.manageDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email isActive')
      .sort({ name: 1 });

    res.render('admin/doctors', { doctors, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading doctors');
  }
};

exports.createDoctor = async (req, res) => {
  const { name, email, password, specialization, experience, contact, photo } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: `Dr. ${name}`,
      email,
      password: hashedPassword,
      role: 'doctor'
    });
    await user.save();

    const doctor = new Doctor({
      user: user._id,
      name: `Dr. ${name}`,
      specialization,
      experience,
      contact,
      photo: photo || null
    });
    await doctor.save();

    res.redirect('/admin/doctors');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating doctor');
  }
};

exports.getReports = async (req, res) => {
  try {

    const totalAppointments = await Appointment.countDocuments();
    const confirmedAppointments = await Appointment.countDocuments({ status: 'Confirmed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });

    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    
    const doctorStats = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctorId',
          doctorName: { $first: '$doctor.name' },
          totalAppointments: { $sum: 1 },
          confirmedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    res.render('admin/reports', {
      stats: {
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        cancelledAppointments
      },
      monthlyAppointments,
      doctorStats,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating reports');
  }
};