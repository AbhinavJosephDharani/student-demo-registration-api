require('dotenv').config();
const mongoose = require('mongoose');

console.log('MongoDB Setup Script');
console.log('===================');
console.log('');

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.log('❌ MONGODB_URI is not set in your .env file');
  console.log('');
  console.log('To set up MongoDB Atlas:');
  console.log('1. Go to https://www.mongodb.com/cloud/atlas');
  console.log('2. Create a free account and cluster');
  console.log('3. Create a database user (remember username/password)');
  console.log('4. Get your connection string');
  console.log('5. Create a .env file with:');
  console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/student-demo-registration?retryWrites=true&w=majority');
  console.log('');
  console.log('Example connection string:');
  console.log('MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/student-demo-registration?retryWrites=true&w=majority');
  console.log('');
  process.exit(1);
}

console.log('✅ MONGODB_URI is set');
console.log('Testing connection...');
console.log('');

// Test the connection
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('');
  console.log('Your database is ready. You can now:');
  console.log('1. Run: npm start');
  console.log('2. Test the API endpoints');
  console.log('3. Check MongoDB Atlas dashboard to see your data');
  console.log('');
  process.exit(0);
})
.catch(err => {
  console.log('❌ MongoDB connection failed:');
  console.log(err.message);
  console.log('');
  console.log('Common issues:');
  console.log('- Check your username and password');
  console.log('- Make sure your IP is whitelisted in Atlas');
  console.log('- Verify the connection string format');
  console.log('');
  process.exit(1);
}); 