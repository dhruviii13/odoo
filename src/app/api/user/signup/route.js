import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          error: 'Server misconfiguration',
          message: 'MONGODB_URI environment variable is not set.'
        },
        { status: 500 }
      );
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        {
          error: 'Server misconfiguration',
          message: 'JWT_SECRET environment variable is not set.'
        },
        { status: 500 }
      );
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
      } catch (dbErr) {
        return NextResponse.json(
          {
            error: 'Database connection error',
            message: dbErr.message || 'Failed to connect to MongoDB.'
          },
          { status: 500 }
        );
      }
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
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      return NextResponse.json(
        {
          error: 'Password hashing error',
          message: hashErr.message || 'Failed to hash password.'
        },
        { status: 500 }
      );
    }
    const newUser = new User({ 
      name: username, 
      email, 
      password: hashedPassword,
      availability: "Weekends" // Set default availability as required by schema
    });
    try {
      await newUser.save();
    } catch (saveErr) {
      return NextResponse.json(
        {
          error: 'User creation error',
          message: saveErr.message || 'Failed to create user.'
        },
        { status: 500 }
      );
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        {
          sub: newUser._id,
          role: newUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (jwtErr) {
      return NextResponse.json(
        {
          error: 'Token generation error',
          message: jwtErr.message || 'Failed to generate authentication token.'
        },
        { status: 500 }
      );
    }

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
        message: error.message || 'An error occurred during signup' 
      },
      { status: 500 }
    );
  }
}
