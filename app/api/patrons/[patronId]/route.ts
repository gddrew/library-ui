import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.LIBRARY_API_URL || process.env.NEXT_PUBLIC_LIBRARY_API_URL;

function joinUrl(base: string, ...parts: string[]) {
  const strip = (s: string) => s.replace(/^\/+|\/+$/g, '');
  return [base.replace(/\/+$/, ''), ...parts.map(strip)].join('/');
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ patronId: string }> }
) {
  if (!API_BASE) {
    return NextResponse.json(
      { message: 'Library API base URL is not configured.' },
      { status: 500 }
    );
  }
  const { patronId } = await ctx.params;
  const url = joinUrl(API_BASE, 'api', 'patrons', encodeURIComponent(patronId));
  try {
    const cookie = req.headers.get('cookie') || '';
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', ...(cookie ? { cookie } : {}) },
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json(
      { message: 'Error contacting Library API.' },
      { status: 502 }
    );
  }
}
