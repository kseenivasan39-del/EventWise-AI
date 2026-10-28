import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { findUserByEmail, createUser, findUserById, deleteUserAccount } from '@/lib/db/repository';
import { signSessionToken, getSessionUser } from '@/lib/auth/session';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = req.nextUrl.searchParams.get('action');

    // 1. REGISTER
    if (action === 'register') {
      const parsed = RegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
      }

      const existing = await findUserByEmail(parsed.data.email);
      if (existing) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(parsed.data.password, salt);
      const userId = crypto.randomUUID();

      const user = await createUser({
        id: userId,
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        createdAt: new Date().toISOString(),
      });

      const token = signSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      const res = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
      });

      res.cookies.set('eventwise_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return res;
    }

    // 2. LOGIN
    if (action === 'login') {
      const parsed = LoginSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
      }

      const user = await findUserByEmail(parsed.data.email);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
      }

      const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!validPassword) {
        return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
      }

      const token = signSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      const res = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
      });

      res.cookies.set('eventwise_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    // 3. LOGOUT
    if (action === 'logout') {
      const res = NextResponse.json({ success: true });
      res.cookies.delete('eventwise_session');
      return res;
    }

    // 4. DELETE ACCOUNT
    if (action === 'delete-account') {
      const sessionUser = getSessionUser(req);
      if (!sessionUser) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      await deleteUserAccount(sessionUser.id);
      const res = NextResponse.json({ success: true, message: 'Account and associated data deleted' });
      res.cookies.delete('eventwise_session');
      return res;
    }

    return NextResponse.json({ success: false, error: 'Unsupported auth action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Authentication error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json({ success: true, user: null });
  }

  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ success: true, user: null });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
