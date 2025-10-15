import { NextRequest, NextResponse } from 'next/server';

// Optional: makes sure this route isn't cached between builds in prod
export const dynamic = 'force-dynamic';

export async function GET() {
  // Quick sanity check endpoint: visit /api/auth/login in the browser
  return NextResponse.json(
    { ok: false, message: 'POST only' },
    { status: 405 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const res = await fetch(`${process.env.LIBRARY_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }).toString(),
      credentials: 'include',
      redirect: 'manual',
    });

    const setCookie = res.headers.get('set-cookie');
    const bodyText = await res.text();

    const response = new NextResponse(
      bodyText || JSON.stringify({ ok: res.ok }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    );

    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
