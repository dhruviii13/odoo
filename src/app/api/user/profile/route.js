import { dbConnect } from '../../../../lib/db';
import User from '../../../../models/User';
import { verifyToken } from '../../../../lib/auth';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2),
  avatar: z.string().optional(),
  isPublic: z.boolean(),
  availability: z.array(z.string()),
  skillsOffered: z.array(z.string()),
  skillsWanted: z.array(z.string()),
});

export async function GET(req) {
  try {
    await dbConnect();
    const auth = req.headers.get('authorization');
    if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await User.findById(payload.id).select('-password');
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    return Response.json({ user });
  } catch (err) {
    console.error('GET /api/user/profile error:', err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const auth = req.headers.get('authorization');
    if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    const user = await User.findByIdAndUpdate(
      payload.id,
      { $set: parsed.data },
      { new: true, select: '-password' }
    );
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    return Response.json({ user });
  } catch (err) {
    console.error('PUT /api/user/profile error:', err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
} 