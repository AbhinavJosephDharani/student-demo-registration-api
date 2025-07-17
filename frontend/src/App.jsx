import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    projectTitle: '',
    email: '',
    phone: '',
    timeSlot: ''
  })

  const [timeSlots, setTimeSlots] = useState([
    { id: 1, date: '4/19/2070', time: '6:00 PM – 7:00 PM', available: 6, max: 6 },
    { id: 2, date: '4/19/2070', time: '7:00 PM – 8:00 PM', available: 6, max: 6 },
    { id: 3, date: '4/19/2070', time: '8:00 PM – 9:00 PM', available: 6, max: 6 },
    { id: 4, date: '4/20/2070', time: '6:00 PM – 7:00 PM', available: 6, max: 6 },
    { id: 5, date: '4/20/2070', time: '7:00 PM – 8:00 PM', available: 6, max: 6 },
    { id: 6, date: '4/20/2070', time: '8:00 PM – 9:00 PM', available: 6, max: 6 }
  ])

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load registrations from localStorage on component mount
  useEffect(() => {
    updateTimeSlotAvailability()
  }, [])

  const updateTimeSlotAvailability = () => {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]')
    
    setTimeSlots(prev => prev.map(slot => {
      const registeredCount = registrations.filter(reg => reg.timeSlot === slot.id).length
      return {
        ...slot,
        available: Math.max(0, slot.max - registeredCount)
      }
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Check if student is already registered
      const registrations = JSON.parse(localStorage.getItem('registrations') || '[]')
      const existingRegistration = registrations.find(reg => reg.studentId === formData.studentId)
      
      if (existingRegistration) {
        setMessage(`This student ID is already registered. Current registration: Time Slot ${existingRegistration.timeSlot}`)
        setIsLoading(false)
        return
      }

      // Check if time slot is available
      const slotRegistrations = registrations.filter(reg => reg.timeSlot === parseInt(formData.timeSlot))
      const selectedSlot = timeSlots.find(slot => slot.id === parseInt(formData.timeSlot))
      
      if (slotRegistrations.length >= selectedSlot.max) {
        setMessage('Time slot is full. Please select a different slot.')
        setIsLoading(false)
        return
      }

      // Save registration to localStorage
      const newRegistration = {
        ...formData,
        timeSlot: parseInt(formData.timeSlot),
        registeredAt: new Date().toISOString()
      }
      
      registrations.push(newRegistration)
      localStorage.setItem('registrations', JSON.stringify(registrations))

      setMessage('Registration successful! You have been registered for the selected time slot.')
      
      // Update time slot availability
      updateTimeSlotAvailability()
      
      // Reset form
      setFormData({
        studentId: '',
        firstName: '',
        lastName: '',
        projectTitle: '',
        email: '',
        phone: '',
        timeSlot: ''
      })
    } catch (error) {
      console.error('Registration error:', error)
      setMessage('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Demo Registration System</h1>
        <p>Web Technology Class - Project Demonstrations</p>
      </header>

      <main className="app-main">
        <div className="registration-container">
          <h2>Register for Demo Time Slot</h2>
          
          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="studentId">Student ID *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                placeholder="Enter your student ID"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="projectTitle">Project Title *</label>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                required
                placeholder="Enter your project title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timeSlot">Select Time Slot *</label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose a time slot...</option>
                {timeSlots.map(slot => (
                  <option 
                    key={slot.id} 
                    value={slot.id}
                    disabled={slot.available === 0}
                  >
                    {slot.id}. {slot.date}, {slot.time} - {slot.available} seats remaining
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register for Demo'}
            </button>
          </form>
        </div>

        <div className="time-slots-info">
          <h3>Available Time Slots</h3>
          <div className="slots-grid">
            {timeSlots.map(slot => (
              <div 
                key={slot.id} 
                className={`slot-card ${slot.available === 0 ? 'full' : ''}`}
              >
                <h4>Slot {slot.id}</h4>
                <p className="slot-date">{slot.date}</p>
                <p className="slot-time">{slot.time}</p>
                <p className={`slot-availability ${slot.available === 0 ? 'full' : ''}`}>
                  {slot.available === 0 ? 'FULLY BOOKED' : `${slot.available} seats remaining`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 