const Feedback = require('../models/Feedback');
const Doctor = require('../models/Doctor');

exports.getSubmitFeedback = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name')
      .select('user');

    const formattedDoctors = doctors.map(doc => ({
      id: doc._id,
      name: doc.user.name
    }));

    res.render('feedback/submit', {
      doctors: formattedDoctors,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading feedback form');
  }
};

exports.postSubmitFeedback = async (req, res) => {
  const { type, doctorId, rating, comment } = req.body;
  try {
    const feedback = new Feedback({
      patient: req.user.id,
      type,
      doctor: type === 'doctor' ? doctorId : null,
      rating: parseInt(rating),
      comment
    });
    await feedback.save();
    res.redirect('/patient/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting feedback');
  }
};