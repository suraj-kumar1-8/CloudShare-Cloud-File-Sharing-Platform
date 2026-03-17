const mongoose = require('mongoose');

const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB Atlas using MONGO_URI from .env.
 * Retries every 5 s on failure instead of crashing the process,
 * so the HTTP server stays available while you fix credentials.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌  MONGO_URI is not set in .env — please add it and restart.');
    return;
  }

  for (;;) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅  MongoDB connected: ${conn.connection.host}`);
      return; // success – exit the retry loop
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('bad auth') || msg.includes('authentication failed')) {
        console.error('❌  MongoDB auth failed — wrong username or password in MONGO_URI.');
        console.error('   Fix your Atlas user password then restart the server.');
      } else if (msg.includes('ECONNREFUSED') || msg.includes('querySrv')) {
        console.error(`❌  MongoDB connection error: ${msg}`);
        console.error('   Check your MONGO_URI host and Atlas Network Access whitelist.');
      } else {
        console.error(`❌  MongoDB connection error: ${msg}`);
      }
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s …`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;