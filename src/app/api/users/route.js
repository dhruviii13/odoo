import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const query = { profilePublic: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skillsOffered': { $regex: search, $options: 'i' } },
        { 'skillsWanted': { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name skillsOffered skillsWanted availability location profilePhoto createdAt') // Select public fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    const usersWithSkillsCount = users.map(user => ({
      ...user,
      skillsCount: (user.skillsOffered?.length || 0) + (user.skillsWanted?.length || 0)
    }));

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
    console.error('Public Users GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
