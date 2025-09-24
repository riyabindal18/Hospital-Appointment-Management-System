const Doctor = require('../models/Doctor');

exports.getAddDoctor = (req, res) => {
  res.render('doctors/add', { user: req.user });
};

exports.postAddDoctor = async (req, res) => {
  const { name, specialization, experience, contact } = req.body;
  try {
    const doctor = new Doctor({
      user: req.user.id,  // Use JWT user id
      name,
      specialization,
      experience,
      contact
    });
    await doctor.save();
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

    const formattedDoctors = doctors.map(doc => ({
      _id: doc._id,
      name: doc.name || (doc.user ? doc.user.name : 'Dr. Unknown'), // Fallback if user not populated
      specialization: doc.specialization,
      experience: doc.experience,
      contact: doc.contact
    }));

    res.render('doctors/list', {
      doctors: formattedDoctors,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching doctors');
  }
};
