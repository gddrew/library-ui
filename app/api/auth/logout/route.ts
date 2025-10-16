import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const backend = process.env.LIBRARY_API_URL || 'http://127.0.0.1:8080';

export async function POST(req: NextRequest) {
  const cookie = (await headers()).get('cookie') ?? '';

  let res: Response | null = null;
  try {
    res = await fetch(`${backend}/api/auth/logout`, {
      method: 'POST',
      headers: { cookie },
      redirect: 'manual',
    });
  } catch {}

  // Build an absolute redirect URL using forwarded headers (works behind CF/nginx)
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const host =
    req.headers.get('x-forwarded-host') ??
    req.headers.get('host') ??
    'localhost:3000';
  const url = new URL('/auth/login', `${proto}://${host}`);

  const next = NextResponse.redirect(url, { status: 303 });

  const setCookie = res?.headers.get('set-cookie');
  if (setCookie) next.headers.set('set-cookie', setCookie);

  return next;
}
