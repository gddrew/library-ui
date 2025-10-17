'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Patron {
  patronId: number;
  patronName: string;
  status?: string;
  email?: string;
}

interface BackendItem {
  mediaId?: number;
  itemId?: number;
  id?: number;
  formattedBarcodeId?: string;
  barcode?: string;
  mediaTitle?: string;
  title?: string;
  mediaStatus?: string;
  status?: string;
}

interface ScannedItem {
  mediaId: number;
  barcode: string;
  title: string;
  status: string;
}

type LoanTransactionResponse = {
  loanId: number;
  message: string;
  mediaItems: Array<{
    mediaTitle: string;
    mediaStatus: string;
    formattedBarcodeId: string;
  }>;
};

type TransactionType = 'CHECKOUT' | 'CHECKIN' | 'RENEW';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const patronId = useMemo(() => {
    const raw = params.get('patronId');
    return raw ? Number(raw) : NaN;
  }, [params]);

  const [patron, setPatron] = useState<Patron | null>(null);
  const [loadingPatron, setLoadingPatron] = useState(false);
  const [patronErr, setPatronErr] = useState<string | null>(null);

  const [barcode, setBarcode] = useState('');
  const [basket, setBasket] = useState<ScannedItem[]>([]);
  const [scanErr, setScanErr] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [result, setResult] = useState<LoanTransactionResponse | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recent, setRecent] = useState<any[] | null>(null);

  useEffect(() => {
    if (!Number.isFinite(patronId)) return;
    (async () => {
      setLoadingPatron(true);
      setPatronErr(null);
      try {
        const resp = await fetch(`/api/patrons/${patronId}`, {
          cache: 'no-store',
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(
            j?.message || `Failed to load patron (${resp.status}).`
          );
        }
        const data: Patron = await resp.json();
        setPatron(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setPatronErr(e?.message || 'Unable to load patron.');
      } finally {
        setLoadingPatron(false);
      }
    })();
  }, [patronId]);

  useEffect(() => {
    // Preload recent history (if any)
    if (!Number.isFinite(patronId)) return;
    (async () => {
      try {
        const r = await fetch(`/api/loans/history/patron/${patronId}`, {
          cache: 'no-store',
        });
        if (r.status === 204) {
          setRecent([]);
          return;
        }
        if (!r.ok) return;
        const data = await r.json();
        setRecent(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch {}
    })();
  }, [patronId]);

  const onScanKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addByBarcode();
    }
  };

  async function addByBarcode() {
    const code = barcode.trim();
    if (!code) return;
    setScanErr(null);
    try {
      const resp = await fetch(`/api/items/${encodeURIComponent(code)}`, {
        cache: 'no-store',
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.message || `Lookup failed (${resp.status}).`);
      }
      const item: BackendItem = await resp.json();
      const scanned: ScannedItem = {
        mediaId: Number(item.mediaId ?? item.itemId ?? item.id ?? NaN),
        barcode: item.formattedBarcodeId ?? item.barcode ?? String(barcode),
        title: item.mediaTitle ?? item.title ?? 'Untitled',
        status: item.mediaStatus ?? item.status ?? 'UNKNOWN',
      };

      if (!Number.isFinite(scanned.mediaId)) {
        throw new Error('Item lookup did not include a valid mediaId.');
      }
      if (scanned.status !== 'AVAILABLE') {
        throw new Error(`Item is not available (status: ${scanned.status}).`);
      }
      if (basket.some((b) => b.mediaId === scanned.mediaId)) {
        throw new Error('Item already in basket.');
      }

      setBasket((b) => [scanned, ...b]);
      setBarcode('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setScanErr(e?.message || 'Could not add item.');
    }
  }

  function removeFromBasket(code: string) {
    setBasket((b) => b.filter((i) => i.barcode !== code));
  }

  async function submitCheckout() {
    if (!patron) return;
    if (basket.length === 0) {
      setSubmitErr('Add at least one item.');
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    setResult(null);
    try {
      const payload: {
        patronId: number;
        mediaIds: number[];
        transactionType: TransactionType;
      } = {
        patronId: patron.patronId,
        mediaIds: basket.map((i) => i.mediaId), // i.itemId must be your mediaId
        transactionType: 'CHECKOUT',
      };

      const resp = await fetch('/api/loans/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.message || `Checkout failed (${resp.status}).`);
      }
      const data: LoanTransactionResponse = await resp.json();
      setResult(data);
      setBasket([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setSubmitErr(e?.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(patronId)) {
      router.replace('/dashboard/loans/create');
    }
  }, [patronId, router]);

  return (
    <div className='max-w-5xl mx-auto p-6 space-y-6'>
      <header className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Checkout</h1>
        <button
          onClick={() => router.push('/dashboard/loans/create')}
          className='px-3 py-2 rounded-lg border shadow-sm'
        >
          Scan Different Card
        </button>
      </header>

      {/* Patron card */}
      <section className='rounded-2xl border p-4 shadow-sm'>
        <h2 className='text-xl font-semibold'>Patron</h2>
        {loadingPatron && <p className='mt-2 text-sm'>Loading patron…</p>}
        {patronErr && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {patronErr}
          </p>
        )}
        {patron && (
          <div className='mt-3 grid gap-1 text-sm'>
            <div>
              <span className='text-gray-500'>ID:</span> {patron.patronId}
            </div>
            <div>
              <span className='text-gray-500'>Name:</span> {patron.patronName}
            </div>
            {patron.email && (
              <div>
                <span className='text-gray-500'>Email:</span> {patron.email}
              </div>
            )}
            {patron.status && (
              <div>
                <span className='text-gray-500'>Status:</span> {patron.status}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Scan barcodes */}
      <section className='rounded-2xl border p-4 shadow-sm'>
        <h2 className='text-xl font-semibold'>Scan Items</h2>
        <div className='mt-3 flex gap-2'>
          <input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            autoFocus
            placeholder='Scan or type barcode'
            className='flex-1 border rounded-lg px-3 py-2 outline-none focus:ring'
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={onScanKeyDown}
          />
          <button
            onClick={addByBarcode}
            className='px-4 py-2 rounded-lg border shadow-sm'
          >
            Add
          </button>
        </div>
        {scanErr && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {scanErr}
          </p>
        )}

        <ul className='mt-4 divide-y'>
          {basket.map((item) => (
            <li
              key={item.barcode}
              className='py-2 flex items-center justify-between'
            >
              <div className='min-w-0'>
                <div className='font-medium truncate'>
                  {item.title || 'Untitled item'}
                </div>
                <div className='text-sm text-gray-600'>
                  Barcode: {item.barcode}
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-xs rounded px-2 py-1 border'>
                  {item.status}
                </span>
                <button
                  onClick={() => removeFromBasket(item.barcode)}
                  className='text-sm px-3 py-1 rounded-lg border'
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
          {basket.length === 0 && (
            <li className='py-6 text-sm text-gray-500'>
              No items yet. Scan a barcode to add.
            </li>
          )}
        </ul>
      </section>

      {/* Submit */}
      <section className='rounded-2xl border p-4 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm text-gray-500'>Items</div>
            <div className='text-2xl font-semibold'>{basket.length}</div>
          </div>
          <div className='flex items-center gap-3'>
            <button
              disabled={submitting || basket.length === 0}
              onClick={submitCheckout}
              className='px-4 py-2 rounded-lg border shadow-sm disabled:opacity-60'
            >
              {submitting ? 'Checking out…' : 'Complete Checkout'}
            </button>
          </div>
        </div>
        {submitErr && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {submitErr}
          </p>
        )}
        {result && (
          <div className='mt-3 rounded-lg border p-3 bg-gray-50'>
            <div className='font-medium'>Loan #{result.loanId}</div>
            <div className='text-sm text-green-700'>{result.message}</div>
            <ul className='mt-2 text-sm space-y-1'>
              {result.mediaItems?.map((m, idx) => (
                <li key={idx} className='flex items-center justify-between'>
                  <span className='truncate'>{m.mediaTitle}</span>
                  <span className='ml-3 text-gray-600'>
                    {m.formattedBarcodeId}
                  </span>
                  <span className='ml-3 text-xs border rounded px-2 py-0.5'>
                    {m.mediaStatus}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Recent history (best-effort) */}
      <section className='rounded-2xl border p-4 shadow-sm'>
        <h2 className='text-lg font-semibold'>Recent Loans</h2>
        <ul className='mt-2 list-disc ml-5 text-sm'>
          {(recent || []).map((x, i) => (
            <li key={i}>
              <code>{JSON.stringify(x)}</code>
            </li>
          ))}
          {recent && recent.length === 0 && (
            <li className='text-gray-500'>No recent history.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
