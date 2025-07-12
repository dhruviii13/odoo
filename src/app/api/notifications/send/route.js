import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sendNotificationToUser, sendPlatformNotification } from '@/lib/fcm';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Check admin authentication
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) {
      return admin;
    }

    const requestBody = await request.json();
    const { title, body: messageBody, userId, data = {} } = requestBody;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let successCount = 0;
    let failureCount = 0;

    if (userId) {
      // Send to specific user
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (user.fcmToken) {
        const success = await sendNotificationToUser(
          user.fcmToken,
          title,
          messageBody,
          data
        );
        
        if (success) {
          successCount = 1;
        } else {
          failureCount = 1;
        }
      } else {
        return NextResponse.json(
          { error: 'User has no FCM token' },
          { status: 400 }
        );
      }
    } else {
      // Send to all users with FCM tokens
      const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
      
      for (const user of users) {
        const success = await sendNotificationToUser(
          user.fcmToken,
          title,
          messageBody,
          data
        );
        
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
      stats: {
        sent: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
} 