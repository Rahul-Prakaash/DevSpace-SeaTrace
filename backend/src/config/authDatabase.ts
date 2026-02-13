import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Separate database for user authentication data
const AUTH_DB_URI = process.env.AUTH_DB_URI || 'mongodb://localhost:27017/seatrace_auth';

// Create a separate connection for the auth database
export const authConnection = mongoose.createConnection(AUTH_DB_URI);

authConnection.on('connected', () => {
    console.log('✅ Connected to Auth MongoDB (seatrace_auth)');
});

authConnection.on('error', (err) => {
    console.error('❌ Auth MongoDB connection error:', err);
});

authConnection.on('disconnected', () => {
    console.log('⚠️  Auth MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await authConnection.close();
});
