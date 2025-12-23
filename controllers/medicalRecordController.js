const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

exports.getRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    if (user.role === 'patient' && user.id !== patientId) {
      return res.status(403).send('Access denied');
    }

    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    const patient = await User.findById(patientId).select('name');

    let canEdit = false;
    if (user.role === 'admin') {
      canEdit = true;
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user.id });
      canEdit = doctor ? true : false; 
    }

    res.render('medicalRecords/list', {
      records,
      patient,
      user,
      canEdit
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching medical records');
  }
};

exports.getAddRecordForm = async (req, res) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    if (user.role !== 'doctor' && user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    const patient = await User.findById(patientId).select('name');
    const doctors = await Doctor.find().populate('user', 'name');

    res.render('medicalRecords/add', {
      patient,
      doctors,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading form');
  }
};

exports.createRecord = async (req, res) => {
  const { patientId } = req.params;
  const { doctorId, diagnosis, treatment, notes } = req.body;
  try {
    const user = req.user;
    if (user.role !== 'doctor' && user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      diagnosis,
      treatment,
      notes
    });

    res.redirect(`/medical-records/patient/${patientId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating medical record');
  }
};

exports.getEditRecordForm = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const record = await MedicalRecord.findById(id).populate('patient', 'name').populate('doctor', 'name');
    if (!record) {
      return res.status(404).send('Record not found');
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user.id });
      if (!doctor || record.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).send('Access denied');
      }
    } else if (user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    const doctors = await Doctor.find().populate('user', 'name');

    res.render('medicalRecords/edit', {
      record,
      doctors,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading form');
  }
};

exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  const { diagnosis, treatment, notes } = req.body;
  try {
    const user = req.user;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).send('Record not found');
    }
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user.id });
      if (!doctor || record.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).send('Access denied');
      }
    } else if (user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    await MedicalRecord.findByIdAndUpdate(id, {
      diagnosis,
      treatment,
      notes,
      updatedAt: Date.now()
    });

    res.redirect(`/medical-records/patient/${record.patient}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating medical record');
  }
};

exports.deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const user = req.user;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).send('Record not found');
    }
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user.id });
      if (!doctor || record.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).send('Access denied');
      }
    } else if (user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    await MedicalRecord.findByIdAndDelete(id);
    res.redirect(`/medical-records/patient/${record.patient}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting medical record');
  }
};