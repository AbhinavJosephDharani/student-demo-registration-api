require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => res.send('API is running!'));

// Get time slots availability
app.get('/time-slots', async (req, res) => {
  try {
    // Get current registrations for each time slot
    const registrations = await Student.find();
    
    // Define time slots
    const timeSlots = [
      { id: 1, date: '4/19/2070', time: '6:00 PM – 7:00 PM', max: 6 },
      { id: 2, date: '4/19/2070', time: '7:00 PM – 8:00 PM', max: 6 },
      { id: 3, date: '4/19/2070', time: '8:00 PM – 9:00 PM', max: 6 },
      { id: 4, date: '4/20/2070', time: '6:00 PM – 7:00 PM', max: 6 },
      { id: 5, date: '4/20/2070', time: '7:00 PM – 8:00 PM', max: 6 },
      { id: 6, date: '4/20/2070', time: '8:00 PM – 9:00 PM', max: 6 }
    ];

    // Calculate available seats for each slot
    const slotsWithAvailability = timeSlots.map(slot => {
      const registeredCount = registrations.filter(reg => reg.timeSlot === slot.id).length;
      return {
        ...slot,
        available: Math.max(0, slot.max - registeredCount)
      };
    });

    res.json(slotsWithAvailability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a student
app.post('/register', async (req, res) => {
  try {
    const { studentId, firstName, lastName, projectTitle, email, phone, timeSlot } = req.body;
    
    // Check if student is already registered
    const existingRegistration = await Student.findOne({ studentId });
    if (existingRegistration) {
      return res.status(400).json({ 
        error: 'Student already registered',
        message: 'This student ID is already registered.',
        existingRegistration: {
          timeSlot: existingRegistration.timeSlot
        }
      });
    }

    // Check if time slot is available
    const slotRegistrations = await Student.find({ timeSlot });
    const timeSlots = [
      { id: 1, max: 6 }, { id: 2, max: 6 }, { id: 3, max: 6 },
      { id: 4, max: 6 }, { id: 5, max: 6 }, { id: 6, max: 6 }
    ];
    const selectedSlot = timeSlots.find(slot => slot.id === parseInt(timeSlot));
    
    if (slotRegistrations.length >= selectedSlot.max) {
      return res.status(400).json({ error: 'Time slot is full' });
    }

    const student = new Student({ 
      studentId, 
      firstName, 
      lastName, 
      projectTitle, 
      email, 
      phone, 
      timeSlot 
    });
    await student.save();
    
    res.status(201).json({ 
      message: 'Registration successful! You have been registered for the selected time slot.',
      student 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Get all registrations
app.get('/admin/registrations', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
