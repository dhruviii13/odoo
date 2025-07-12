import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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
    const user = await User.findById(decoded.sub).select('-password -fcmToken -isBanned -emailVerified -resetToken');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request) {
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
    const body = await request.json();
    const update = {
      name: body.name,
      location: body.location,
      skillsOffered: body.skillsOffered,
      skillsWanted: body.skillsWanted,
      availability: body.availability,
      isPublic: body.isPublic,
      profilePhoto: body.profilePhoto,
    };
    const user = await User.findByIdAndUpdate(decoded.sub, update, { new: true }).select('-password -fcmToken -isBanned -emailVerified -resetToken');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export { PATCH as PUT }; 