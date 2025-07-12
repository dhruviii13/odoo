import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmate';

let isConnected = false;

export default async function dbConnect() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB:', MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 