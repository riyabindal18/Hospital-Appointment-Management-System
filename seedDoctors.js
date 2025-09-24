require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const bcrypt = require('bcrypt');


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const doctors = [
  { name: "Rajesh Kumar", specialization: "Cardiologist", experience: 15, contact: "9876543210" },
  { name: "Neha Sharma", specialization: "Dermatologist", experience: 10, contact: "9876543211" },
  { name: "Aman Verma", specialization: "Neurologist", experience: 12, contact: "9876543212" },
  { name: "Priya Gupta", specialization: "Pediatrician", experience: 8, contact: "9876543213" },
  { name: "Rohit Singh", specialization: "Orthopedic", experience: 14, contact: "9876543214" },
  { name: "Meera Kapoor", specialization: "Gynecologist", experience: 11, contact: "9876543215" },
  { name: "Arjun Mehta", specialization: "ENT Specialist", experience: 9, contact: "9876543216" },
  { name: "Kavita Joshi", specialization: "Psychiatrist", experience: 13, contact: "9876543217" },
  { name: "Manish Bansal", specialization: "General Physician", experience: 7, contact: "9876543218" },
  { name: "Ritu Malhotra", specialization: "Ophthalmologist", experience: 10, contact: "9876543219" }
];

const seedDoctors = async () => {
  try {

    await Doctor.deleteMany();
    
    for (const doctorData of doctors) {
      const user = new User({
        name: `Dr. ${doctorData.name}`, 
        email: `${doctorData.name.toLowerCase().replace(/\s/g, '.')}@hospital.com`,
        password: await bcrypt.hash('doctor123', 10), 
        role: 'doctor'
      });
      await user.save();

      const doctor = new Doctor({
        user: user._id,
        name: `Dr. ${doctorData.name}`, 
        specialization: doctorData.specialization,
        experience: doctorData.experience,
        contact: doctorData.contact
      });
      await doctor.save();
    }

    console.log("Doctors seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding doctors:", err);
    mongoose.connection.close();
  }
};

seedDoctors();
