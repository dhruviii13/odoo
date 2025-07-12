import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import GlobalNotice from '../../../../models/GlobalNotice';
import { getCurrentAdmin } from '../../../../lib/adminAuth';
import { sendPlatformNotification } from '../../../../lib/fcm';

// GET /api/admin/messages - Get all platform messages
export async function GET(request) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const isActive = searchParams.get('isActive') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Get messages with populated admin data
    const messages = await GlobalNotice.find(query)
      .populate('sentBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await GlobalNotice.countDocuments(query);

    // Get active messages count
    const activeCount = await GlobalNotice.countDocuments({ isActive: true });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        activeCount,
        totalMessages: total
      }
    });
  } catch (error) {
    console.error('Admin Messages GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/admin/messages - Create a new platform message
export async function POST(request) {
  try {
    await dbConnect();
    const admin = await getCurrentAdmin(); // Verify admin access

    const { message, priority, startDate, endDate, sendFCM } = await request.json();

    if (!message || !priority) {
      return NextResponse.json(
        { error: 'Message and priority are required' },
        { status: 400 }
      );
    }

    if (!['info', 'warning', 'error'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    // Create the global notice
    const globalNotice = new GlobalNotice({
      message,
      priority,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      sentBy: admin._id
    });

    await globalNotice.save();

    // Send FCM notification if requested
    let fcmSent = false;
    if (sendFCM) {
      const title = `SkillMate ${priority.charAt(0).toUpperCase() + priority.slice(1)}`;
      fcmSent = await sendPlatformNotification(title, message, {
        type: 'platform_message',
        priority,
        messageId: globalNotice._id.toString()
      });

      if (fcmSent) {
        globalNotice.fcmSent = true;
        globalNotice.fcmSentAt = new Date();
        await globalNotice.save();
      }
    }

    // Populate the sentBy field for response
    await globalNotice.populate('sentBy', 'name email');

    return NextResponse.json({
      message: 'Platform message created successfully',
      globalNotice,
      fcmSent
    });
  } catch (error) {
    console.error('Admin Messages POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create platform message' },
      { status: 500 }
    );
  }
} 