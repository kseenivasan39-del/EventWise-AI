import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/db/supabase';
import { signSessionToken } from '@/lib/auth/session';
import { createUser, findUserByEmail } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const errorParam = req.nextUrl.searchParams.get('error');
  const errorDescription = req.nextUrl.searchParams.get('error_description');
  const next = req.nextUrl.searchParams.get('next') || '/dashboard';

  if (errorParam || errorDescription) {
    console.error('Supabase OAuth Error received:', errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || errorParam || 'OAuth failed')}`, req.url)
    );
  }

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/login?error=oauth_missing_code', req.url));
  }

  // Build redirect response early so cookies can be set on it
  const redirectResponse = NextResponse.redirect(new URL(next, req.url));

  const supabase = getSupabaseServerClient({
    getAll() {
      return req.cookies.getAll();
    },
    set(name, value, options) {
      redirectResponse.cookies.set(name, value, options);
    },
  });

  if (!supabase) {
    return NextResponse.redirect(new URL('/login?error=supabase_unconfigured', req.url));
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      console.error('OAuth exchange error:', error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || 'oauth_error')}`, req.url));
    }

    const email = data.user.email || '';
    const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0];

    // Ensure user exists in our local repository
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser({
        id: data.user.id,
        email,
        name,
        passwordHash: 'OAUTH_GOOGLE',
        createdAt: new Date().toISOString(),
      });
    }

    // Sign session token cookie
    const token = signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    redirectResponse.cookies.set('eventwise_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return redirectResponse;
  } catch (err: any) {
    console.error('OAuth callback handling failed:', err);
    return NextResponse.redirect(new URL('/login?error=callback_failed', req.url));
  }
}
