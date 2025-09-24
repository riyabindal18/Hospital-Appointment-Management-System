const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  specialization: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: Number, 
    required: true 
  },
  contact: { 
    type: String, 
    required: true 
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
