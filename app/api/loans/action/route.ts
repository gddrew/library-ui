import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.LIBRARY_API_URL || process.env.NEXT_PUBLIC_LIBRARY_API_URL;

function joinUrl(base: string, ...parts: string[]) {
  const strip = (s: string) => s.replace(/^\/+|\/+$/g, '');
  return [base.replace(/\/+$/, ''), ...parts.map(strip)].join('/');
}

export async function POST(req: NextRequest) {
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

  const url = joinUrl(API_BASE, 'api', 'loans', 'action');

  try {
    const cookie = req.headers.get('cookie') || '';
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

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        {
          message: `Upstream error ${resp.status}: ${text || resp.statusText}`,
        },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json(
      {
        message: `Error contacting Library API: ${
          e instanceof Error ? e.message : 'Unknown'
        }`,
      },
      { status: 502 }
    );
  }
}
