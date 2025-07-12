import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Swap from '@/models/Swap';
import User from '@/models/User';

// Minimal JWT decode for Edge compatibility
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = auth.replace('Bearer ', '');
    const decoded = decodeJWT(token);
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decoded.sub;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Find swaps where the user is either the sender or receiver
    const query = {
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    };
    if (status && status !== 'All') {
      query.status = status;
    }

    let swaps = await Swap.find(query)
      .sort({ createdAt: -1 })
      .populate('fromUser', 'name')
      .populate('toUser', 'name')
      .lean();

    // Format swaps for UI
    swaps = swaps.map(swap => ({
      _id: swap._id,
      withUser: String(swap.fromUser && swap.fromUser._id == userId ? swap.toUser?.name : swap.fromUser?.name),
      skillOffered: swap.skillOffered,
      skillWanted: swap.skillWanted,
      status: swap.status,
      date: swap.createdAt,
      feedback: swap.feedback,
    }));

    return NextResponse.json({ swaps });
  } catch (error) {
    console.error('Swap History GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch swap history' }, { status: 500 });
  }
} 