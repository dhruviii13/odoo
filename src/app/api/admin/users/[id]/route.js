import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../models/User';
import { getCurrentAdmin } from '../../../../../lib/adminAuth';
import { sendNotificationToUser } from '../../../../../lib/fcm';

// PATCH /api/admin/users/[id] - Ban/Unban a user
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { id } = params;
    const { isBanned, banReason, banUntil } = await request.json();

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json(
        { error: 'isBanned must be a boolean' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from banning themselves
    const currentAdmin = await getCurrentAdmin();
    if (user._id.toString() === currentAdmin._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot ban yourself' },
        { status: 400 }
      );
    }

    // Update user ban status
    const updateData = { isBanned };
    
    if (isBanned) {
      updateData.banReason = banReason || 'Violation of platform policies';
      updateData.banUntil = banUntil ? new Date(banUntil) : null;
    } else {
      updateData.banReason = null;
      updateData.banUntil = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Send FCM notification to user about ban status
    if (user.fcmToken) {
      const title = isBanned ? 'Account Suspended' : 'Account Restored';
      const body = isBanned 
        ? `Your account has been suspended. Reason: ${updateData.banReason}`
        : 'Your account has been restored. You can now use the platform again.';
      
      await sendNotificationToUser(user.fcmToken, title, body, {
        type: 'account_status',
        isBanned: isBanned.toString()
      });
    }

    return NextResponse.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin User Ban Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user ban status' },
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