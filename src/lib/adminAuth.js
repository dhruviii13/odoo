import { NextResponse } from 'next/server';
import { verifyToken, getUserFromToken } from './auth';
import dbConnect from './db';
import User from '../models/User';

// Admin authentication middleware
export async function requireAdmin(request) {
  try {
    await dbConnect();
    
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = await getUserFromToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return user;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Check if user is admin (returns boolean)
export async function isAdmin(email) {
  if (!email) return false;
  
  await dbConnect();
  const user = await User.findOne({ email });
  return user?.role === 'admin';
}

// Get current admin user from JWT token
export async function getCurrentAdmin(request) {
  try {
    await dbConnect();
    
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    const user = await getUserFromToken(token);
    
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    
    return user;
  } catch (error) {
    console.error('Get current admin error:', error);
    throw error;
  }
} 