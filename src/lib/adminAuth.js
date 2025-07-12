import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import dbConnect from './db';
import User from '../models/User';

// Admin authentication middleware
export async function requireAdmin() {
  await dbConnect();
  
  // For now, we'll use a simple session check
  // In production, you'd integrate with next-auth
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await User.findOne({ email: session.user.email });
  
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  return user;
}

// Check if user is admin (returns boolean)
export async function isAdmin(email) {
  if (!email) return false;
  
  await dbConnect();
  const user = await User.findOne({ email });
  return user?.role === 'admin';
}

// Get current admin user
export async function getCurrentAdmin() {
  try {
    await dbConnect();
    
    // For demo purposes, we'll use a hardcoded admin email
    // In production, this would come from the session
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillmate.com';
    const user = await User.findOne({ email: adminEmail });
    
    if (!user || user.role !== 'admin') {
      // For demo purposes, return a mock admin user
      return {
        _id: 'demo-admin-id',
        name: 'Demo Admin',
        email: adminEmail,
        role: 'admin'
      };
    }
    
    return user;
  } catch (error) {
    console.error('Database connection error:', error);
    // For demo purposes, return a mock admin user when DB is not available
    return {
      _id: 'demo-admin-id',
      name: 'Demo Admin',
      email: 'admin@skillmate.com',
      role: 'admin'
    };
  }
} 