import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.LIBRARY_API_URL || process.env.NEXT_PUBLIC_LIBRARY_API_URL;

function joinUrl(base: string, ...parts: string[]) {
  const strip = (s: string) => s.replace(/^\/+|\/+$/g, '');
  return [base.replace(/\/+$/, ''), ...parts.map(strip)].join('/');
}

type AnyRec = Record<string, unknown>;

function normalizeMedia(raw: AnyRec) {
  const mediaId = Number(raw.mediaId ?? raw.id ?? NaN);
  const barcode = raw.formattedBarcodeId ?? raw.barcode ?? undefined;
  const title = String(raw.mediaTitle ?? raw.title ?? 'Untitled');
  const status = String(raw.mediaStatus ?? raw.status ?? 'AVAILABLE');
  return { mediaId, barcode, title, status };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  if (!API_BASE) {
    return NextResponse.json(
      { message: 'Library API base URL is not configured.' },
      { status: 500 }
    );
  }

  const { code } = await ctx.params;
  const isNumericId = /^\d+$/.test(code);
  if (!isNumericId) {
    return NextResponse.json(
      { message: 'Only numeric mediaId is supported here.' },
      { status: 400 }
    );
  }

  const upstreamUrl = joinUrl(
    API_BASE,
    'api',
    'collection',
    'media',
    encodeURIComponent(code)
  );

  console.log('[items proxy] →', upstreamUrl);

  try {
    const cookie = req.headers.get('cookie') || '';
    const resp = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { Accept: 'application/json', ...(cookie ? { cookie } : {}) },
      cache: 'no-store',
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => resp.statusText);
      return NextResponse.json(
        {
          message: `Upstream error ${resp.status}: ${text || resp.statusText}`,
        },
        { status: resp.status }
      );
    }

    const raw = (await resp.json()) as AnyRec;
    const normalized = normalizeMedia(raw);

    if (!Number.isFinite(normalized.mediaId)) {
      return NextResponse.json(
        { message: 'Media response did not include a usable mediaId.' },
        { status: 422 }
      );
    }

    return NextResponse.json(normalized);
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
