import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET || 'eventwise-production-secret-jwt-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Signs a JWT session token for the user
 */
export function signSessionToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: user.role || 'organizer',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Extracts and verifies the current session user from the incoming request cookies or Authorization header.
 * Returns null if not authenticated.
 */
export function getSessionUser(req: NextRequest): AuthUser | null {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookie = req.cookies.get('eventwise_session');
      if (cookie) {
        token = cookie.value;
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.sub) return null;

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Strict authentication guard for API route handlers
 */
export function requireAuth(req: NextRequest): { user: AuthUser } | { response: NextResponse } {
  const user = getSessionUser(req);
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to access this resource' },
        { status: 401 }
      ),
    };
  }
  return { user };
}
