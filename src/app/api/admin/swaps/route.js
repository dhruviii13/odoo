import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Swap from '../../../../models/Swap';
import { getCurrentAdmin } from '../../../../lib/adminAuth';
import { sendNotificationToUser } from '../../../../lib/fcm';

export async function GET(req) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const total = await Swap.countDocuments();
    const swaps = await Swap.find()
      .populate('fromUser', 'name avatar')
      .populate('toUser', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return NextResponse.json({
      swaps,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Admin Swaps GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swaps' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/swaps - Update swap status (force reject/delete)
export async function PATCH(request) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { swapId, status, reason } = await request.json();

    if (!swapId || !status) {
      return NextResponse.json(
        { error: 'Swap ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const swap = await Swap.findByIdAndUpdate(
      swapId,
      { 
        status,
        ...(status === 'rejected' && { rejectedAt: new Date() }),
        ...(status === 'accepted' && { acceptedAt: new Date() }),
        ...(status === 'cancelled' && { cancelledAt: new Date() })
      },
      { new: true, runValidators: true }
    ).populate('fromUser', 'name email fcmToken')
     .populate('toUser', 'name email fcmToken');

    if (!swap) {
      return NextResponse.json(
        { error: 'Swap not found' },
        { status: 404 }
      );
    }

    // Send FCM notifications to both users
    const adminMessage = reason ? ` (Admin: ${reason})` : '';
    
    if (swap.fromUser?.fcmToken) {
      try {
        await sendNotificationToUser(
          swap.fromUser.fcmToken,
          'Swap Status Updated',
          `Your swap request has been ${status}${adminMessage}`,
          { type: 'swap_status', swapId: swap._id.toString() }
        );
      } catch (fcmError) {
        console.error('FCM notification error:', fcmError);
      }
    }

    if (swap.toUser?.fcmToken) {
      try {
        await sendNotificationToUser(
          swap.toUser.fcmToken,
          'Swap Status Updated',
          `A swap request has been ${status}${adminMessage}`,
          { type: 'swap_status', swapId: swap._id.toString() }
        );
      } catch (fcmError) {
        console.error('FCM notification error:', fcmError);
      }
    }

    return NextResponse.json({
      message: `Swap ${status} successfully`,
      swap
    });
  } catch (error) {
    console.error('Admin Swaps PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update swap' },
      { status: 500 }
    );
  }
} 