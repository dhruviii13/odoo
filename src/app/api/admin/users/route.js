import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { getCurrentAdmin } from '../../../../lib/adminAuth';

// GET /api/admin/users - Get all users with pagination and filters
export async function GET(request) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isBanned = searchParams.get('isBanned') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isBanned !== '') {
      query.isBanned = isBanned === 'true';
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Add skills count to each user for display
    const usersWithSkillsCount = users.map(user => {
      const skillsOfferedCount = user.skillsOffered?.length || 0;
      const skillsWantedCount = user.skillsWanted?.length || 0;
      return {
        ...user,
        skillsCount: skillsOfferedCount + skillsWantedCount
      };
    });

    return NextResponse.json({
      users: usersWithSkillsCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin Users GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
