import { dbConnect } from '../../../lib/db';
import User from '../../../models/User';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const search = searchParams.get('search') || '';
  const availability = searchParams.get('availability');

  const query = { isPublic: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { skillsOffered: { $regex: search, $options: 'i' } },
      { skillsWanted: { $regex: search, $options: 'i' } },
    ];
  }
  if (availability) {
    query.availability = availability;
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return Response.json({
    users,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
    },
  });
} 