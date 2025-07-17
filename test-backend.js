const express = require('express');
const app = express();
app.use(express.json());

// In-memory storage for testing
let registrations = [];

// Health check
app.get('/', (req, res) => res.send('Test API is running!'));

// Get time slots availability
app.get('/api/time-slots', async (req, res) => {
  try {
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

    console.log('Time slots requested, returning:', slotsWithAvailability);
    res.json(slotsWithAvailability);
  } catch (err) {
    console.error('Error in time-slots:', err);
    res.status(500).json({ error: err.message });
  }
});

// Register a student
app.post('/api/register', async (req, res) => {
  try {
    const { studentId, firstName, lastName, projectTitle, email, phone, timeSlot } = req.body;
    
    console.log('Registration request:', { studentId, firstName, lastName, projectTitle, email, phone, timeSlot });
    
    // Check if student is already registered
    const existingRegistration = registrations.find(reg => reg.studentId === studentId);
    if (existingRegistration) {
      console.log('Student already registered:', existingRegistration);
      return res.status(400).json({ 
        error: 'Student already registered',
        message: 'This student ID is already registered.',
        existingRegistration: {
          timeSlot: existingRegistration.timeSlot
        }
      });
    }

    // Check if time slot is available
    const slotRegistrations = registrations.filter(reg => reg.timeSlot === parseInt(timeSlot));
    const timeSlots = [
      { id: 1, max: 6 }, { id: 2, max: 6 }, { id: 3, max: 6 },
      { id: 4, max: 6 }, { id: 5, max: 6 }, { id: 6, max: 6 }
    ];
    const selectedSlot = timeSlots.find(slot => slot.id === parseInt(timeSlot));
    
    if (slotRegistrations.length >= selectedSlot.max) {
      console.log('Time slot is full:', timeSlot);
      return res.status(400).json({ error: 'Time slot is full' });
    }

    const newRegistration = { 
      studentId, 
      firstName, 
      lastName, 
      projectTitle, 
      email, 
      phone, 
      timeSlot: parseInt(timeSlot),
      registeredAt: new Date().toISOString()
    };
    
    registrations.push(newRegistration);
    console.log('Registration successful:', newRegistration);
    console.log('Total registrations:', registrations.length);
    
    res.status(201).json({ 
      message: 'Registration successful! You have been registered for the selected time slot.',
      student: newRegistration
    });
  } catch (err) {
    console.error('Error in register:', err);
    res.status(400).json({ error: err.message });
  }
});

// Admin: Get all registrations
app.get('/api/admin/registrations', async (req, res) => {
  try {
    console.log('Admin requested registrations, returning:', registrations);
    res.json(registrations);
  } catch (err) {
    console.error('Error in admin registrations:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test the endpoints:`);
  console.log(`- GET http://localhost:${PORT}/api/time-slots`);
  console.log(`- POST http://localhost:${PORT}/api/register`);
  console.log(`- GET http://localhost:${PORT}/api/admin/registrations`);
}); 