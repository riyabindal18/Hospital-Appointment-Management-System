const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'user',
          select: 'name'
        },
        select: 'specialization'
      })
      .sort({ date: -1 });

    const formattedAppointments = appointments
      .filter(apt => apt.doctorId && apt.doctorId.user && apt.doctorId.user.name)
      .map(apt => ({
        id: apt._id,
        doctorName: apt.doctorId.user.name,
        specialization: apt.doctorId.specialization,
        date: apt.date.toDateString(),
        status: apt.status
      }));

    res.render('patient/dashboard', { user, appointments: formattedAppointments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.user.id, { name, email });

    const updatedUser = await User.findById(req.user.id);
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.redirect('/patient/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating profile');
  }
};