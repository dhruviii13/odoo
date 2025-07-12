import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import dbConnect from './db';
import User from '../models/User';

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user from JWT token
export async function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    await dbConnect();
    const user = await User.findById(decoded.sub).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Get user from session (NextAuth)
export async function getUserFromSession() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

// Middleware for protected API routes
export async function requireAuth(request) {
  try {
    // Try to get user from session first
    let user = await getUserFromSession();
    
    if (!user) {
      // Fallback to JWT token
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      user = await getUserFromToken(token);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }
    
    return user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Middleware for admin-only routes
export async function requireAdmin(request) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user; // Return the error response
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return user;
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.json(
      { error: 'Admin authentication failed' },
      { status: 403 }
    );
  }
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
} 