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

// Register a student
app.post('/register', async (req, res) => {
  try {
    const { name, email, slot } = req.body;
    const student = new Student({ name, email, slot });
    await student.save();
    res.status(201).json({ message: 'Registration successful', student });
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
