import { dbConnect } from '../../../lib/db';
import Feedback from '../../../models/Feedback';
import { verifyToken } from '../../../lib/auth';
import { z } from 'zod';

const feedbackSchema = z.object({
  swap: z.string(),
  toUser: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req) {
  try {
    await dbConnect();
    const auth = req.headers.get('authorization');
    if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Feedback validation error:', parsed.error);
      return Response.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }
    const feedback = await Feedback.create({
      swap: parsed.data.swap,
      fromUser: payload.id,
      toUser: parsed.data.toUser,
      rating: parsed.data.rating,
      comment: parsed.data.comment || '',
    });
    console.log('Feedback created:', feedback._id);
    return Response.json({ feedback });
  } catch (error) {
    console.error('Feedback POST error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user');
    if (!userId) return Response.json({ error: 'Missing user id' }, { status: 400 });
    const feedbacks = await Feedback.find({ toUser: userId })
      .populate('fromUser', 'name avatar')
      .sort({ createdAt: -1 });
    return Response.json({ feedbacks });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
} 