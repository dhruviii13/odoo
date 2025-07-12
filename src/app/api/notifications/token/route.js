import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Check authentication
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update user's FCM token
    await User.findByIdAndUpdate(user._id, {
      fcmToken: fcmToken,
      lastActive: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'FCM token saved successfully'
    });

  } catch (error) {
    console.error('FCM token save error:', error);
    return NextResponse.json(
      { error: 'Failed to save FCM token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Check authentication
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await dbConnect();

    // Remove user's FCM token
    await User.findByIdAndUpdate(user._id, {
      $unset: { fcmToken: 1 },
      lastActive: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'FCM token removed successfully'
    });

  } catch (error) {
    console.error('FCM token remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove FCM token' },
      { status: 500 }
    );
  }
} 