import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { getCurrentAdmin } from '../../../../lib/adminAuth';

// GET /api/admin/skills - Get all unique skills with counts
export async function GET(request) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Aggregate all unique skills from users
    const skillsPipeline = [
      {
        $project: {
          allSkills: {
            $concatArrays: ['$skillsOffered', '$skillsWanted']
          }
        }
      },
      {
        $unwind: '$allSkills'
      },
      {
        $group: {
          _id: '$allSkills',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          skill: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1, skill: 1 }
      }
    ];

    // Add search filter if provided
    if (search) {
      skillsPipeline.unshift({
        $match: {
          $or: [
            { skillsOffered: { $regex: search, $options: 'i' } },
            { skillsWanted: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const skills = await User.aggregate(skillsPipeline);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Admin Skills GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/admin/skills/remove - Remove a skill from all users
export async function POST(request) {
  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    const { skill } = await request.json();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }

    // Remove skill from all users' skillsOffered and skillsWanted arrays
    const result = await User.updateMany(
      {
        $or: [
          { skillsOffered: skill },
          { skillsWanted: skill }
        ]
      },
      {
        $pull: {
          skillsOffered: skill,
          skillsWanted: skill
        }
      }
    );

    return NextResponse.json({
      message: `Skill "${skill}" removed from ${result.modifiedCount} users`,
      removedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Admin Skills Remove Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove skill' },
      { status: 500 }
    );
  }
} 