import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../models/User';
import { getCurrentAdmin } from '../../../../../lib/adminAuth';
import { sendNotificationToUser } from '../../../../../lib/fcm';
import mongoose from 'mongoose';

// PATCH /api/admin/users/[id] - Ban/Unban a user
export async function PATCH(request, { params }) {
  try {
    // Check for required environment variable
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Server misconfiguration', message: 'MONGODB_URI environment variable is not set.' }, { status: 500 });
    }
    // Connect to DB
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('DB connection error:', dbErr);
      return NextResponse.json({ error: 'Database connection error', message: dbErr.message || 'Failed to connect to MongoDB.' }, { status: 500 });
    }
    // Verify admin access
    let currentAdmin;
    try {
      currentAdmin = await getCurrentAdmin();
    } catch (adminErr) {
      console.error('Admin auth error:', adminErr);
      return NextResponse.json({ error: 'Admin authentication error', message: adminErr.message || 'Failed to authenticate admin.' }, { status: 401 });
    }
    if (!params || !params.id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const { id } = params;
    // Check for valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { isBanned, banReason, banUntil } = body || {};
    if (typeof isBanned !== 'boolean') {
      return NextResponse.json({ error: 'isBanned must be a boolean' }, { status: 400 });
    }
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user._id.toString() === currentAdmin._id.toString()) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
    }
    const updateData = { isBanned };
    if (isBanned) {
      updateData.banReason = banReason || 'Violation of platform policies';
      updateData.banUntil = banUntil ? new Date(banUntil) : null;
    } else {
      updateData.banReason = null;
      updateData.banUntil = null;
    }
    let updatedUser;
    try {
      updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    } catch (updateErr) {
      console.error('User update error:', updateErr);
      return NextResponse.json({ error: 'User update error', message: updateErr.message || 'Failed to update user.' }, { status: 500 });
    }
    // Send FCM notification to user about ban status
    if (user.fcmToken) {
      const title = isBanned ? 'Account Suspended' : 'Account Restored';
      const bodyMsg = isBanned 
        ? `Your account has been suspended. Reason: ${updateData.banReason}`
        : 'Your account has been restored. You can now use the platform again.';
      try {
        await sendNotificationToUser(user.fcmToken, title, bodyMsg, {
          type: 'account_status',
          isBanned: isBanned.toString()
        });
      } catch (fcmErr) {
        console.error('FCM notification error:', fcmErr);
        // Don't fail the request if notification fails
      }
    }
    return NextResponse.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin User Ban Error:', error);
    // Always return JSON, even for unexpected errors
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Failed to update user ban status' },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id] - Get specific user details
export async function GET(request, { params }) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { id } = params;

    const user = await User.findById(id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add skills count
    user.skillsCount = (user.skillsOffered?.length || 0) + (user.skillsWanted?.length || 0);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin User GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 