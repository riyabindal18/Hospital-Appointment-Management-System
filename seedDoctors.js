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
  { name: "Rajesh Kumar", specialization: "Cardiologist", experience: 15, contact: "9876543210", photo: "https://www.sonicseo.com/wp-content/uploads/2020/07/surgeon.jpg", availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }, { day: "Wednesday", startTime: "10:00", endTime: "16:00" }] },
  { name: "Neha Sharma", specialization: "Dermatologist", experience: 10, contact: "9876543211", photo: "https://tse2.mm.bing.net/th/id/OIP.X0x0U8BtbtO-faw-go5GeQHaI7?pid=Api&P=0&h=180", availability: [{ day: "Tuesday", startTime: "08:00", endTime: "15:00" }, { day: "Thursday", startTime: "09:00", endTime: "14:00" }] },
  { name: "Aman Verma", specialization: "Neurologist", experience: 12, contact: "9876543212", photo: "https://tse1.mm.bing.net/th/id/OIP.J3a1PInS_7BJiZEp95MPMQHaHa?pid=Api&P=0&h=180", availability: [{ day: "Monday", startTime: "10:00", endTime: "18:00" }, { day: "Friday", startTime: "11:00", endTime: "17:00" }] },
  { name: "Priya Gupta", specialization: "Pediatrician", experience: 8, contact: "9876543213", photo: "https://tse2.mm.bing.net/th/id/OIP.ydeEdknJJEG-rbIvtajr5gHaHa?pid=Api&P=0&h=180", availability: [{ day: "Wednesday", startTime: "09:00", endTime: "16:00" }, { day: "Saturday", startTime: "10:00", endTime: "14:00" }] },
  { name: "Rohit Singh", specialization: "Orthopedic", experience: 14, contact: "9876543214", photo: "https://tse2.mm.bing.net/th/id/OIP.G4Lo57buZLkuG99l5fb6aQHaE8?pid=Api&P=0&h=180", availability: [{ day: "Tuesday", startTime: "08:00", endTime: "17:00" }, { day: "Thursday", startTime: "09:00", endTime: "15:00" }] },
  { name: "Meera Kapoor", specialization: "Gynecologist", experience: 11, contact: "9876543215", photo: "https://img.freepik.com/premium-photo/medical-concept-indian-beautiful-female-doctor-white-coat-with-stethoscope-waist-up-medical-student-woman-hospital-worker-looking-camera-smiling-studio-blue-background_185696-621.jpg?w=2000", availability: [{ day: "Monday", startTime: "10:00", endTime: "16:00" }, { day: "Friday", startTime: "11:00", endTime: "15:00" }] },
  { name: "Arjun Mehta", specialization: "ENT Specialist", experience: 9, contact: "9876543216", photo: "https://img.freepik.com/premium-photo/portrait-indian-doctor-indian-doctor-smiling_890100-1265.jpg", availability: [{ day: "Wednesday", startTime: "09:00", endTime: "17:00" }, { day: "Saturday", startTime: "10:00", endTime: "13:00" }] },
  { name: "Kavita Joshi", specialization: "Psychiatrist", experience: 13, contact: "9876543217", photo: "https://img.freepik.com/premium-photo/indian-female-doctor-portrait-south-indian-young-lady-doctor-holding-stethoscope-hand_527904-1841.jpg?w=2000", availability: [{ day: "Tuesday", startTime: "08:00", endTime: "16:00" }, { day: "Thursday", startTime: "09:00", endTime: "14:00" }] },
  { name: "Manish Bansal", specialization: "General Physician", experience: 7, contact: "9876543218", photo: "https://st.depositphotos.com/2702761/3304/i/950/depositphotos_33044395-stock-photo-doctor-smiling.jpg", availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }, { day: "Wednesday", startTime: "10:00", endTime: "16:00" }] },
  { name: "Ritu Malhotra", specialization: "Ophthalmologist", experience: 10, contact: "9876543219", photo: "https://tse2.mm.bing.net/th/id/OIP.GgSsUAIKo90PDO1DvjOtGgHaLI?pid=Api&P=0&h=180", availability: [{ day: "Friday", startTime: "11:00", endTime: "18:00" }, { day: "Saturday", startTime: "10:00", endTime: "15:00" }] }
];

const seedDoctors = async () => {
  try {

    await Doctor.deleteMany();
    await User.deleteMany({ role: 'doctor' });
    
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
        contact: doctorData.contact,
        photo: doctorData.photo,
        availability: doctorData.availability
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
