import { dbConnect } from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error('Signup validation error:', parsed.error);
      return Response.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }
    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) {
      console.error('Signup failed: User already exists for email:', email);
      return Response.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken({ id: user._id, email: user.email });
    console.log('Signup successful for user:', user.email);
    return Response.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
