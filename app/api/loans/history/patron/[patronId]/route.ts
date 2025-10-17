import { NextRequest, NextResponse } from 'next/server';

const API2 =
  process.env.LIBRARY_API_URL || process.env.NEXT_PUBLIC_LIBRARY_API_URL;

function j(base: string, ...parts: string[]) {
  const strip = (s: string) => s.replace(/^\/+|\/+$/g, '');
  return [base.replace(/\/+$/, ''), ...parts.map(strip)].join('/');
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ patronId: string }> }
) {
  if (!API2) {
    return NextResponse.json(
      { message: 'Library API base URL is not configured.' },
      { status: 500 }
    );
  }
  const { patronId } = await ctx.params;
  const url = j(
    API2,
    'api',
    'loans',
    'history',
    'patron',
    encodeURIComponent(patronId)
  );
  try {
    const cookie = req.headers.get('cookie') || '';
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', ...(cookie ? { cookie } : {}) },
      cache: 'no-store',
    });
    if (resp.status === 204) return NextResponse.json([]);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json(
      { message: `Error contacting Library API: ${e?.message || 'Unknown'}` },
      { status: 502 }
    );
  }
}
