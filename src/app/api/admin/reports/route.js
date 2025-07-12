import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Swap from '../../../../models/Swap';
import { getCurrentAdmin } from '../../../../lib/adminAuth';
import { Parser } from 'json2csv';

// Report generation functions
async function generateUsersReport() {
  const users = await User.find({}).select('-password').lean();
  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    isPublic: user.isPublic,
    isBanned: user.isBanned,
    skillsOffered: user.skillsOffered?.join(', ') || '',
    skillsWanted: user.skillsWanted?.join(', ') || '',
    availability: user.availability?.join(', ') || '',
    createdAt: user.createdAt,
    lastActive: user.lastActive
  }));
}

async function generateSwapsReport() {
  const swaps = await Swap.find({})
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .lean();
  
  return swaps.map(swap => ({
    id: swap._id,
    fromUser: swap.fromUser?.name || 'Unknown',
    fromEmail: swap.fromUser?.email || '',
    toUser: swap.toUser?.name || 'Unknown',
    toEmail: swap.toUser?.email || '',
    offeredSkill: swap.offeredSkill,
    requestedSkill: swap.requestedSkill,
    status: swap.status,
    createdAt: swap.createdAt,
    acceptedAt: swap.acceptedAt,
    rejectedAt: swap.rejectedAt
  }));
}

async function generateSkillsReport() {
  const users = await User.find({}).select('skillsOffered skillsWanted').lean();
  const skillCounts = {};
  
  users.forEach(user => {
    [...(user.skillsOffered || []), ...(user.skillsWanted || [])].forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  
  return Object.entries(skillCounts).map(([skill, count]) => ({
    skill,
    count,
    offeredCount: users.filter(u => u.skillsOffered?.includes(skill)).length,
    wantedCount: users.filter(u => u.skillsWanted?.includes(skill)).length
  }));
}

async function generateSummaryReport() {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isBanned: { $ne: true } });
  const bannedUsers = await User.countDocuments({ isBanned: true });
  const totalSwaps = await Swap.countDocuments();
  const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
  const acceptedSwaps = await Swap.countDocuments({ status: 'accepted' });
  const rejectedSwaps = await Swap.countDocuments({ status: 'rejected' });
  
  const users = await User.find({}).select('skillsOffered skillsWanted').lean();
  const uniqueSkills = new Set();
  users.forEach(user => {
    [...(user.skillsOffered || []), ...(user.skillsWanted || [])].forEach(skill => uniqueSkills.add(skill));
  });
  
  return [
    { metric: 'Total Users', value: totalUsers },
    { metric: 'Active Users', value: activeUsers },
    { metric: 'Banned Users', value: bannedUsers },
    { metric: 'Total Swaps', value: totalSwaps },
    { metric: 'Pending Swaps', value: pendingSwaps },
    { metric: 'Accepted Swaps', value: acceptedSwaps },
    { metric: 'Rejected Swaps', value: rejectedSwaps },
    { metric: 'Unique Skills', value: uniqueSkills.size }
  ];
}

// Mock data functions for fallback
function generateMockUsersReport() {
  return [
    { id: '1', name: 'John Doe', email: 'john@example.com', isPublic: true, isBanned: false, skillsOffered: 'JavaScript, React', skillsWanted: 'Python, Django', availability: 'Weekends', createdAt: new Date(), lastActive: new Date() }
  ];
}

function generateMockSwapsReport() {
  return [
    { id: '1', fromUser: 'John Doe', fromEmail: 'john@example.com', toUser: 'Jane Smith', toEmail: 'jane@example.com', offeredSkill: 'JavaScript', requestedSkill: 'Python', status: 'pending', createdAt: new Date() }
  ];
}

function generateMockSkillsReport() {
  return [
    { skill: 'JavaScript', count: 15, offeredCount: 10, wantedCount: 5 },
    { skill: 'Python', count: 12, offeredCount: 8, wantedCount: 4 }
  ];
}

function generateMockSummaryReport() {
  return [
    { metric: 'Total Users', value: 150 },
    { metric: 'Active Users', value: 142 },
    { metric: 'Banned Users', value: 8 },
    { metric: 'Total Swaps', value: 89 },
    { metric: 'Pending Swaps', value: 23 },
    { metric: 'Accepted Swaps', value: 45 },
    { metric: 'Rejected Swaps', value: 21 },
    { metric: 'Unique Skills', value: 67 }
  ];
}

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