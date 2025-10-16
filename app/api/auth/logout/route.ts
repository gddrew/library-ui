import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const backend = process.env.LIBRARY_API_URL || 'http://127.0.0.1:8080';

export async function POST(req: NextRequest) {
  const cookie = (await headers()).get('cookie') ?? '';
  const res = await fetch(`${backend}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie },
    redirect: 'manual',
  }).catch(() => null);

  const next = NextResponse.redirect(new URL('/auth/login', req.url), 303);

  const setCookie = res?.headers.get('set-cookie');
  if (setCookie) next.headers.set('set-cookie', setCookie);

  return next;
}
