import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Swap from '../../../../models/Swap';
import { getCurrentAdmin } from '../../../../lib/adminAuth';
import { Parser } from 'json2csv';

// GET /api/admin/reports - Generate and download reports
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'users';
  const format = searchParams.get('format') || 'json';

  let data = [];
  let filename = '';

  try {
    await dbConnect();
    await getCurrentAdmin(); // Verify admin access

    switch (type) {
      case 'users':
        data = await generateUsersReport();
        filename = `users_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      case 'swaps':
        data = await generateSwapsReport();
        filename = `swaps_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      case 'skills':
        data = await generateSkillsReport();
        filename = `skills_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      case 'summary':
        data = await generateSummaryReport();
        filename = `summary_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Return mock data when database is not available
    switch (type) {
      case 'users':
        data = generateMockUsersReport();
        filename = `users_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      case 'swaps':
        data = generateMockSwapsReport();
        filename = `swaps_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      case 'skills':
        data = generateMockSkillsReport();
        filename = `skills_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      case 'summary':
        data = generateMockSummaryReport();
        filename = `summary_report_${new Date().toISOString().split('T')[0]}`;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  }

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`
      }
    });
  }

  return NextResponse.json({
    data,
    filename,
    generatedAt: new Date().toISOString()
  });
}

// Generate users report
async function generateUsersReport() {
  const users = await User.find({})
    .select('-password')
    .lean();

  return users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    banReason: user.banReason || '',
    profilePublic: user.profilePublic,
    skillsOffered: user.skillsOffered?.join(', ') || '',
    skillsWanted: user.skillsWanted?.join(', ') || '',
    availability: user.availability?.join(', ') || '',
    location: user.location || '',
    skillsCount: (user.skillsOffered?.length || 0) + (user.skillsWanted?.length || 0),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
}

// Generate swaps report
async function generateSwapsReport() {
  const swaps = await Swap.find({})
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .lean();

  return swaps.map(swap => ({
    id: swap._id.toString(),
    fromUser: swap.fromUser?.name || 'Unknown',
    fromEmail: swap.fromUser?.email || '',
    toUser: swap.toUser?.name || 'Unknown',
    toEmail: swap.toUser?.email || '',
    offeredSkill: swap.offeredSkill,
    requestedSkill: swap.requestedSkill,
    message: swap.message || '',
    status: swap.status,
    createdAt: swap.createdAt,
    acceptedAt: swap.acceptedAt,
    rejectedAt: swap.rejectedAt,
    cancelledAt: swap.cancelledAt
  }));
}

// Generate skills report
async function generateSkillsReport() {
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
        count: { $sum: 1 },
        offeredCount: {
          $sum: {
            $cond: [
              { $in: ['$allSkills', '$skillsOffered'] },
              1,
              0
            ]
          }
        },
        wantedCount: {
          $sum: {
            $cond: [
              { $in: ['$allSkills', '$skillsWanted'] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        skill: '$_id',
        totalCount: '$count',
        offeredCount: '$offeredCount',
        wantedCount: '$wantedCount',
        _id: 0
      }
    },
    {
      $sort: { totalCount: -1, skill: 1 }
    }
  ];

  return await User.aggregate(skillsPipeline);
}

// Generate summary report
async function generateSummaryReport() {
  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    totalSwaps,
    pendingSwaps,
    acceptedSwaps,
    rejectedSwaps,
    skillsData
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBanned: false }),
    User.countDocuments({ isBanned: true }),
    Swap.countDocuments(),
    Swap.countDocuments({ status: 'pending' }),
    Swap.countDocuments({ status: 'accepted' }),
    Swap.countDocuments({ status: 'rejected' }),
    generateSkillsReport()
  ]);

  const topSkills = skillsData.slice(0, 10);

  return [{
    metric: 'Total Users',
    value: totalUsers,
    description: 'Total number of registered users'
  }, {
    metric: 'Active Users',
    value: activeUsers,
    description: 'Users who are not banned'
  }, {
    metric: 'Banned Users',
    value: bannedUsers,
    description: 'Users who are currently banned'
  }, {
    metric: 'Total Swaps',
    value: totalSwaps,
    description: 'Total number of swap requests'
  }, {
    metric: 'Pending Swaps',
    value: pendingSwaps,
    description: 'Swaps awaiting response'
  }, {
    metric: 'Accepted Swaps',
    value: acceptedSwaps,
    description: 'Successfully completed swaps'
  }, {
    metric: 'Rejected Swaps',
    value: rejectedSwaps,
    description: 'Rejected swap requests'
  }, {
    metric: 'Unique Skills',
    value: skillsData.length,
    description: 'Total unique skills offered/wanted'
  }, {
    metric: 'Top Skill',
    value: topSkills[0]?.skill || 'None',
    description: 'Most popular skill'
  }, {
    metric: 'Top Skill Count',
    value: topSkills[0]?.totalCount || 0,
    description: 'Number of users with top skill'
  }];
}

// Mock data functions for demo purposes
function generateMockUsersReport() {
  return [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      isBanned: false,
      banReason: '',
      profilePublic: true,
      skillsOffered: 'JavaScript, React',
      skillsWanted: 'Python, Design',
      availability: 'weekends, evenings',
      location: 'New York',
      skillsCount: 4,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      isBanned: false,
      banReason: '',
      profilePublic: true,
      skillsOffered: 'Python, Data Analysis',
      skillsWanted: 'JavaScript, UI/UX',
      availability: 'weekdays',
      location: 'San Francisco',
      skillsCount: 4,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T14:20:00Z'
    }
  ];
}

function generateMockSwapsReport() {
  return [
    {
      id: '1',
      fromUser: 'John Doe',
      fromEmail: 'john@example.com',
      toUser: 'Jane Smith',
      toEmail: 'jane@example.com',
      offeredSkill: 'JavaScript',
      requestedSkill: 'Python',
      message: 'I can help you with JavaScript in exchange for Python lessons',
      status: 'pending',
      createdAt: '2024-01-20T10:00:00Z',
      acceptedAt: null,
      rejectedAt: null,
      cancelledAt: null
    }
  ];
}

function generateMockSkillsReport() {
  return [
    {
      skill: 'JavaScript',
      totalCount: 25,
      offeredCount: 15,
      wantedCount: 10
    },
    {
      skill: 'Python',
      totalCount: 20,
      offeredCount: 12,
      wantedCount: 8
    },
    {
      skill: 'React',
      totalCount: 18,
      offeredCount: 10,
      wantedCount: 8
    }
  ];
}

function generateMockSummaryReport() {
  return [
    {
      metric: 'Total Users',
      value: 150,
      description: 'Total number of registered users'
    },
    {
      metric: 'Active Users',
      value: 142,
      description: 'Users who are not banned'
    },
    {
      metric: 'Banned Users',
      value: 8,
      description: 'Users who are currently banned'
    },
    {
      metric: 'Total Swaps',
      value: 89,
      description: 'Total number of swap requests'
    },
    {
      metric: 'Pending Swaps',
      value: 23,
      description: 'Swaps awaiting response'
    },
    {
      metric: 'Accepted Swaps',
      value: 45,
      description: 'Successfully completed swaps'
    },
    {
      metric: 'Rejected Swaps',
      value: 21,
      description: 'Rejected swap requests'
    },
    {
      metric: 'Unique Skills',
      value: 67,
      description: 'Total unique skills offered/wanted'
    },
    {
      metric: 'Top Skill',
      value: 'JavaScript',
      description: 'Most popular skill'
    },
    {
      metric: 'Top Skill Count',
      value: 25,
      description: 'Number of users with top skill'
    }
  ];
} 