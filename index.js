require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
app.use(express.json());

// Add CORS headers for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Global connection promise to avoid multiple connections
let connectionPromise = null;

// Connect to MongoDB with better error handling for serverless
const connectDB = async () => {
  try {
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('- MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
    
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      return false;
    }
    
    // If already connected, return true
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return true;
    }
    
    // If connection is in progress, wait for it
    if (connectionPromise) {
      console.log('Connection in progress, waiting...');
      await connectionPromise;
      return mongoose.connection.readyState === 1;
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
    
    // Create connection promise
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      maxPoolSize: 1, // Limit connections for serverless
      minPoolSize: 0, // Allow 0 connections when idle
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000, // 10 second connection timeout
    });
    
    await connectionPromise;
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Full error:', err);
    connectionPromise = null; // Reset promise on error
    return false;
  }
};

// Initialize database connection
connectDB().then(connected => {
  console.log('Initial connection result:', connected);
});

// Update connection status when mongoose connects
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
  connectionPromise = null; // Reset promise
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
  connectionPromise = null; // Reset promise
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  connectionPromise = null; // Reset promise
});

// Health check
app.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  console.log('Health check - MongoDB readyState:', mongoose.connection.readyState);
  console.log('Health check - isConnected:', isConnected);
  console.log('Health check - Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('- MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
  console.log('- MONGODB_URI starts with:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET');
  
  res.json({ 
    message: 'API is running!',
    mongodb: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    debug: {
      readyState: mongoose.connection.readyState,
      envExists: !!process.env.MONGODB_URI,
      envLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
    }
  });
});

// Get time slots availability
app.get('/api/time-slots', async (req, res) => {
  try {
    // Ensure connection
    const connected = await connectDB();
    if (!connected) {
      return res.status(500).json({ 
        error: 'Database not connected',
        message: 'MongoDB connection is not available'
      });
    }

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
    console.error('Error in /api/time-slots:', err);
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to fetch time slots'
    });
  }
});

// Register a student
app.post('/api/register', async (req, res) => {
  try {
    // Ensure connection
    const connected = await connectDB();
    if (!connected) {
      return res.status(500).json({ 
        error: 'Database not connected',
        message: 'MongoDB connection is not available'
      });
    }

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
    console.error('Error in /api/register:', err);
    res.status(400).json({ 
      error: err.message,
      message: 'Failed to register student'
    });
  }
});

// Admin: Get all registrations
app.get('/api/admin/registrations', async (req, res) => {
  try {
    // Ensure connection
    const connected = await connectDB();
    if (!connected) {
      return res.status(500).json({ 
        error: 'Database not connected',
        message: 'MongoDB connection is not available'
      });
    }

    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error('Error in /api/admin/registrations:', err);
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to fetch registrations'
    });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
