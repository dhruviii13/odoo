import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    // Get username and password from the request body
    const body = await request.json();
    const { username, password, email } = body;

    // Validate required parameters
    if (!username || !password || !email) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          message: 'Username, email, and password are required' 
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Check if user already exists (by email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
          message: 'A user with this email already exists.'
        },
        { status: 409 }
      );
    }

    // Create and save new user
    const newUser = new User({ name: username, email, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info (excluding password)
    return NextResponse.json({
      success: true,
      token: token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePhoto: newUser.profilePhoto,
      },
      message: 'Signup successful'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An error occurred during signup' 
      },
      { status: 500 }
    );
  }
}
