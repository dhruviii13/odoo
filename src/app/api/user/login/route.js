import { dbConnect } from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error('Login validation error:', parsed.error);
      return Response.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Login failed: User not found for email:', email);
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.error('Login failed: Invalid password for email:', email);
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({ id: user._id, email: user.email });
    console.log('Login successful for user:', user.email);
    return Response.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
