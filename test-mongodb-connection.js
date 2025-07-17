const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abhinavdharani7:FDdhD3uo5pihnm7N@cluster0.giuzfom.mongodb.net/student-demo-registration?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection(); 