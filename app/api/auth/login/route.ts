// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

function forwardSetCookies(from: Response, to: NextResponse) {
  // Prefer undici’s getSetCookie(); fall back to a single get()
  const cookies =
    from.headers.getSetCookie?.() ??
    (from.headers.get('set-cookie')
      ? [from.headers.get('set-cookie') as string]
      : []);

  if (cookies && cookies.length) {
    for (const c of cookies) to.headers.append('set-cookie', c);
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const upstream = await fetch(`${process.env.LIBRARY_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }).toString(),
    redirect: 'manual',
  });

  const body = await upstream.text();

  const res = new NextResponse(body || JSON.stringify({ ok: upstream.ok }), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });

  forwardSetCookies(upstream, res);
  return res;
}
