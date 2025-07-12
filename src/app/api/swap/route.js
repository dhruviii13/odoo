import { dbConnect } from '../../../lib/db';
import Swap from '../../../models/Swap';
import { verifyToken } from '../../../lib/auth';
import { z } from 'zod';

const swapSchema = z.object({
  toUser: z.string(),
  offeredSkill: z.string(),
  requestedSkill: z.string(),
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
    const parsed = swapSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Swap validation error:', parsed.error);
      return Response.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }
    const swap = await Swap.create({
      fromUser: payload.id,
      toUser: parsed.data.toUser,
      offeredSkill: parsed.data.offeredSkill,
      requestedSkill: parsed.data.requestedSkill,
      status: 'pending',
    });
    console.log('Swap created:', swap._id);
    return Response.json({ swap });
  } catch (error) {
    console.error('Swap POST error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const auth = req.headers.get('authorization');
    if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const swaps = await Swap.find({ $or: [ { fromUser: payload.id }, { toUser: payload.id } ] })
      .populate('fromUser', 'name avatar')
      .populate('toUser', 'name avatar')
      .sort({ createdAt: -1 });
    return Response.json({ swaps });
  } catch (error) {
    console.error('Swap GET error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

const patchSchema = z.object({
  swapId: z.string(),
  status: z.enum(['accepted', 'rejected', 'cancelled']),
});

export async function PATCH(req) {
  try {
    await dbConnect();
    const auth = req.headers.get('authorization');
    if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Swap PATCH validation error:', parsed.error);
      return Response.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }
    const swap = await Swap.findById(parsed.data.swapId);
    if (!swap) return Response.json({ error: 'Swap not found' }, { status: 404 });
    if (swap.toUser.toString() !== payload.id && swap.fromUser.toString() !== payload.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    swap.status = parsed.data.status;
    await swap.save();
    console.log('Swap updated:', swap._id, 'status:', parsed.data.status);
    return Response.json({ swap });
  } catch (error) {
    console.error('Swap PATCH error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
} 