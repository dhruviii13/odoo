import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Swap from '../../../../models/Swap';
import { getCurrentAdmin } from '../../../../lib/adminAuth';
import { sendNotificationToUser } from '../../../../lib/fcm';

// GET /api/admin/swaps - Get all swaps with filters and pagination
export async function GET(request) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status') || '';
    const skill = searchParams.get('skill') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (skill) {
      query.$or = [
        { offeredSkill: { $regex: skill, $options: 'i' } },
        { requestedSkill: { $regex: skill, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Get swaps with populated user data
    const swaps = await Swap.find(query)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Swap.countDocuments(query);

    // Get status counts for summary
    const statusCounts = await Swap.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      swaps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        statusCounts: statusSummary,
        totalSwaps: total
      }
    });
  } catch (error) {
    console.error('Admin Swaps GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swaps' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/swaps/[id] - Update swap status (force reject/delete)
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
      await sendNotificationToUser(
        swap.fromUser.fcmToken,
        'Swap Status Updated',
        `Your swap request has been ${status}${adminMessage}`,
        { type: 'swap_status', swapId: swap._id.toString() }
      );
    }

    if (swap.toUser?.fcmToken) {
      await sendNotificationToUser(
        swap.toUser.fcmToken,
        'Swap Status Updated',
        `A swap request has been ${status}${adminMessage}`,
        { type: 'swap_status', swapId: swap._id.toString() }
      );
    }

    return NextResponse.json({
      message: `Swap ${status} successfully`,
      swap
    });
  } catch (error) {
    console.error('Admin Swap Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update swap' },
      { status: 500 }
    );
  }
} 