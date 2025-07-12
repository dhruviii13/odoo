import { dbConnect } from '../../../../lib/db';
import User from '../../../../models/User';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const total = await User.countDocuments();
  const users = await User.find()
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