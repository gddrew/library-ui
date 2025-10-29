import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.LIBRARY_API_URL || process.env.NEXT_PUBLIC_LIBRARY_API_URL;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ cardId: string }> }
) {
  if (!API_BASE) {
    return NextResponse.json(
      { message: 'Library API base URL is not configured.' },
      { status: 500 }
    );
  }

  const { cardId } = await ctx.params;
  const url = `${API_BASE.replace(
    /\/$/,
    ''
  )}/api/cards/code/${encodeURIComponent(cardId)}`;
  console.log('Proxying to:', url);

  try {
    const cookie = req.headers.get('cookie') || '';
    const host =
      req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const proto =
      req.headers.get('x-forwarded-proto') ||
      (req.nextUrl.protocol.startsWith('https') ? 'https' : 'http');

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (cookie) headers.cookie = cookie;
    if (host) headers['X-Forwarded-Host'] = host;
    if (proto) headers['X-Forwarded-Proto'] = proto;

    const resp = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Upstream status:', resp.status, 'Body:', text);
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
          e instanceof Error ? e.message : 'Unknown error'
        }`,
      },
      { status: 502 }
    );
  }
}
