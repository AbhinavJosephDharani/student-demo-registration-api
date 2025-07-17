const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  projectTitle: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  timeSlot: { type: Number, required: true },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
