const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 3;
  let retryCount = 0;
  
  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });

      console.log('MongoDB Connected Successfully');
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB Connection Lost:', err.message);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB Disconnected. Attempting to reconnect...');
        connectWithRetry();
      });
      
    } catch (error) {
      retryCount++;
      if (retryCount < maxRetries) {
        console.warn(`MongoDB Connection Attempt ${retryCount} failed. Retrying in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error('MongoDB Connection Failed:', error.message);
        console.error('Error Details:', {
          name: error.name,
          code: error.code,
          reason: error.reason
        });
        process.exit(1);
      }
    }
  };
  
  await connectWithRetry();
};


module.exports = connectDB;
