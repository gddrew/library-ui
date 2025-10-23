import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.LIBRARY_API_URL || process.env.NEXT_PUBLIC_LIBRARY_API_URL;

function joinUrl(base: string, ...parts: string[]) {
  const strip = (s: string) => s.replace(/^\/+|\/+$/g, '');
  return [base.replace(/\/+$/, ''), ...parts.map(strip)].join('/');
}

export const POST = async (req: NextRequest) => {
  if (!API_BASE) {
    return NextResponse.json(
      { message: 'Library API base URL is not configured.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const url = joinUrl(API_BASE, 'api', 'collection', 'media', 'batch');

  try {
    const cookie = req.headers.get('cookie') || '';
    console.log('[batch proxy] POST ->', url, 'payload:', body);

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error('[batch proxy] Upstream', resp.status, text);
      return NextResponse.json(
        {
          message: `Upstream error ${resp.status}: ${text || resp.statusText}`,
        },
        { status: resp.status }
      );
    }

    return NextResponse.json(text ? JSON.parse(text) : []);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { message: `Error contacting Library API: ${msg}` },
      { status: 502 }
    );
  }
};
