'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MAX_ITEMS = 6;

interface Patron {
  patronId: number;
  patronName: string;
  status?: string;
  email?: string;
}

interface ScannedItem {
  mediaId: number;
  title: string;
  status: string;
  barcode?: string;
}

interface LoanItem {
  mediaId: number;
  checkoutDate?: string | null;
  dueDate?: string | null;
  returnDate?: string | null;
  status: string;
}

interface LoanHistory {
  loanId: number;
  patronId: number;
  status: string; // ACTIVE | COMPLETED | ...
  createdDate?: string | null;
  lastUpdateDate?: string | null;
  items: LoanItem[];
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

type TransactionType = 'CHECKOUT' | 'CHECKIN' | 'RENEW' | 'RETURN';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const patronId = useMemo(() => {
    const raw = params.get('patronId');
    return raw ? Number(raw) : NaN;
  }, [params]);

  const mode: TransactionType = useMemo(() => {
    const raw = params.get('mode');
    if (!raw) return 'CHECKOUT';
    const upper = raw.toUpperCase();
    return upper === 'RETURN' ? 'RETURN' : 'CHECKOUT';
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

  const [recent, setRecent] = useState<LoanHistory[] | null>(null);

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [titles, setTitles] = useState<Record<number, string>>({});

  // ---- helpers ----
  function fmtDate(iso?: string | null) {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return iso;
    }
  }

  function ellipsize(s: string | undefined, max = 50) {
    if (!s) return '';
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  }

  function chipClass(status: string) {
    const s = (status || '').toUpperCase();
    if (s.includes('RETURN')) return 'border-green-300 text-green-700';
    if (s.includes('CHECK')) return 'border-blue-300 text-blue-700';
    if (s.includes('OVER') || s.includes('LATE'))
      return 'border-red-300 text-red-700';
    if (s.includes('ACTIVE')) return 'border-amber-300 text-amber-700';
    return 'border-gray-300 text-gray-700';
  }

  const titlesRef = useRef(titles);
  useEffect(() => {
    titlesRef.current = titles;
  }, [titles]);

  type BatchRow = { mediaId: number; mediaTitle?: string; title?: string };
  type BatchResponse = { items: BatchRow[] } | BatchRow[];

  const hydrateTitlesFromLoans = useCallback(async (loans: LoanHistory[]) => {
    const current = titlesRef.current;
    const ids = new Set<number>();
    for (const loan of loans) {
      for (const it of loan.items) {
        if (current[it.mediaId] == null) ids.add(it.mediaId);
      }
    }
    if (ids.size === 0) return;

    try {
      const resp = await fetch('/api/collection/media/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ mediaIds: Array.from(ids) }),
      });
      if (!resp.ok) {
        console.warn('batch titles fetch failed:', resp.status);
        return;
      }

      const data = (await resp.json()) as BatchResponse;
      const rows: BatchRow[] = Array.isArray(data) ? data : data?.items ?? [];
      const next: Record<number, string> = {};
      for (const row of rows) {
        const title = row.mediaTitle ?? row.title;
        if (row?.mediaId != null && typeof title === 'string') {
          next[row.mediaId] = title;
        }
      }
      if (Object.keys(next).length > 0) {
        setTitles((cur) => ({ ...cur, ...next }));
      }
    } catch (err) {
      console.warn('batch titles fetch error:', err);
    }
  }, []);

  const toggleCard = (loanId: number) =>
    setCollapsed((m) => ({ ...m, [loanId]: !m[loanId] }));

  // ---- effects ----
  useEffect(() => {
    if (mode === 'RETURN') return;
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
        const arr = Array.isArray(data) ? (data as LoanHistory[]) : [];
        arr.sort((a, b) =>
          (b.createdDate || '').localeCompare(a.createdDate || '')
        );
        const top = arr.slice(0, 5);
        setRecent(top);

        // default-collapse completed loans
        setCollapsed((prev) => {
          const next = { ...prev };
          for (const l of top) {
            if (next[l.loanId] === undefined) {
              next[l.loanId] = l.status === 'COMPLETED';
            }
          }
          return next;
        });

        // hydrate titles via batch (stable callback)
        await hydrateTitlesFromLoans(top);
      } catch {
        // ignore
      }
    })();
  }, [patronId, mode, hydrateTitlesFromLoans]);

  const onScanKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addByCode();
    }
  };

  async function addByCode() {
    const code = barcode.trim();
    if (!code) return;
    setScanErr(null);
    try {
      const resp = await fetch(`/api/items/${encodeURIComponent(code)}`, {
        cache: 'no-store',
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || `Lookup failed (${resp.status}).`);
      }
      const item = (await resp.json()) as ScannedItem;

      if (!Number.isFinite(item.mediaId)) {
        throw new Error('Item lookup did not include a valid mediaId.');
      }
      if (mode === 'CHECKOUT') {
        if (item.status && item.status !== 'AVAILABLE') {
          throw new Error(`Item is not available (status: ${item.status}).`);
        }
      } else if (mode === 'RETURN') {
        if (item.status && item.status === 'AVAILABLE') {
          throw new Error(
            'Item is already available and does not need check-in.'
          );
        }
      }

      if (basket.some((b) => b.mediaId === item.mediaId)) {
        throw new Error('Item already in basket.');
      }

      setBasket((b) => [item, ...b]);
      setBarcode('');
    } catch (e: unknown) {
      setScanErr(e instanceof Error ? e.message : 'Could not add item.');
    }
  }

  function removeFromBasket(mediaId: number) {
    setBasket((b) => b.filter((i) => i.mediaId !== mediaId));
  }

  async function submitCheckout() {
    if (basket.length === 0) {
      setSubmitErr('Add at least one item.');
      return;
    }
    if (mode === 'CHECKOUT' && !patron) {
      setSubmitErr('No patron loaded.');
      return;
    }

    setSubmitting(true);
    setSubmitErr(null);
    setResult(null);
    try {
      let payload: unknown;

      if (mode === 'CHECKOUT') {
        payload = {
          patronId: patron!.patronId,
          mediaIds: basket.map((i) => i.mediaId),
          transactionType: 'CHECKOUT' as TransactionType,
        };
      } else {
        // RETURN: no patron, just the items
        payload = {
          mediaIds: basket.map((i) => i.mediaId),
          transactionType: 'RETURN' as TransactionType,
        };
      }

      const resp = await fetch('/api/loans/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(
          text ||
            `${mode === 'CHECKOUT' ? 'Checkout' : 'Check-in'} failed (${
              resp.status
            }).`
        );
      }
      const data = (await resp.json()) as LoanTransactionResponse;
      setResult(data);
      setBasket([]);
    } catch (e: unknown) {
      setSubmitErr(
        e instanceof Error
          ? e.message
          : `${mode === 'CHECKOUT' ? 'Checkout' : 'Check-in'} failed.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (mode === 'RETURN') return;
    if (!Number.isFinite(patronId)) return;
    (async () => {
      setLoadingPatron(true);
      setPatronErr(null);
      try {
        const resp = await fetch(`/api/patrons/${patronId}`, {
          cache: 'no-store',
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(text || `Failed to load patron (${resp.status}).`);
        }
        const data = (await resp.json()) as Patron;
        setPatron(data);
      } catch (e: unknown) {
        setPatronErr(e instanceof Error ? e.message : 'Unable to load patron.');
      } finally {
        setLoadingPatron(false);
      }
    })();
  }, [patronId, mode]);

  return (
    <div className='max-w-5xl mx-auto p-6 space-y-6'>
      <header className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>
          {mode === 'CHECKOUT' ? 'Checkout' : 'Check-In'}
        </h1>
        {mode === 'CHECKOUT' && (
          <button
            onClick={() => router.push('/dashboard/loans/create')}
            className='inline-block px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600'
          >
            Scan Different Card
          </button>
        )}
      </header>

      {/* Patron card (checkout only) */}
      {mode === 'CHECKOUT' && (
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
      )}

      {/* Scan items */}
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
            onClick={addByCode}
            className='inline-block px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600'
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
              key={item.mediaId}
              className='py-2 flex items-center justify-between'
            >
              <div className='min-w-0'>
                <div className='font-medium truncate'>
                  {ellipsize(item.title, 50) || 'Untitled item'}
                </div>
                <div className='text-sm text-gray-600'>
                  Media ID: {item.mediaId}
                </div>
                {item.barcode && (
                  <div className='text-sm text-gray-600'>
                    Barcode: {item.barcode}
                  </div>
                )}
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-xs rounded px-2 py-1 border'>
                  {item.status}
                </span>
                <button
                  onClick={() => removeFromBasket(item.mediaId)}
                  className='text-sm px-3 py-1 rounded-lg text-black hover:bg-red-600 hover:text-white border'
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
              className='px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border shadow-sm disabled:opacity-60'
            >
              {submitting
                ? mode === 'CHECKOUT'
                  ? 'Checking out…'
                  : 'Checking in…'
                : mode === 'CHECKOUT'
                ? 'Complete Checkout'
                : 'Complete Check-In'}
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

      {/* Recent history (pretty) */}
      {mode === 'CHECKOUT' && (
        <section className='rounded-2xl border p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Recent Loans</h2>
          </div>

          {!recent && <p className='mt-2 text-sm text-gray-500'>Loading…</p>}
          {recent && recent.length === 0 && (
            <p className='mt-2 text-sm text-gray-500'>No recent history.</p>
          )}

          {recent && recent.length > 0 && (
            <ul className='mt-3 space-y-3'>
              {recent.map((loan) => {
                const isCollapsed = !!collapsed[loan.loanId];
                const visible = loan.items.slice(0, MAX_ITEMS);
                const remaining = Math.max(
                  0,
                  loan.items.length - visible.length
                );

                return (
                  <li key={loan.loanId} className='rounded-xl border p-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='font-medium'>
                        Loan #{loan.loanId}
                        {loan.createdDate && (
                          <span className='ml-2 text-sm text-gray-500'>
                            • {fmtDate(loan.createdDate)}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => toggleCard(loan.loanId)}
                          className='text-xs px-2 py-0.5 rounded border hover:bg-blue-600 hover:text-white'
                          aria-expanded={!isCollapsed}
                          aria-controls={`loan-${loan.loanId}`}
                        >
                          {isCollapsed ? 'Expand' : 'Collapse'}
                        </button>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${chipClass(
                            loan.status
                          )}`}
                        >
                          {loan.status}
                        </span>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div id={`loan-${loan.loanId}`} className='mt-2'>
                        <table className='w-full text-sm'>
                          <thead className='text-gray-500'>
                            <tr>
                              <th className='text-left font-normal py-1'>
                                Media ID
                              </th>
                              <th className='text-left font-normal py-1'>
                                Title
                              </th>
                              <th className='text-left font-normal py-1'>
                                Checked Out
                              </th>
                              <th className='text-left font-normal py-1'>
                                Due
                              </th>
                              <th className='text-left font-normal py-1'>
                                Returned
                              </th>
                              <th className='text-left font-normal py-1'>
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y'>
                            {visible.map((it, idx) => (
                              <tr key={idx} className='odd:bg-gray-50'>
                                <td className='py-1'>{it.mediaId}</td>
                                <td
                                  className='py-1'
                                  title={titles[it.mediaId] ?? ''}
                                >
                                  {ellipsize(titles[it.mediaId] ?? '--', 50)}
                                </td>
                                <td className='py-1'>
                                  {fmtDate(it.checkoutDate)}
                                </td>
                                <td className='py-1'>{fmtDate(it.dueDate)}</td>
                                <td className='py-1'>
                                  {fmtDate(it.returnDate)}
                                </td>
                                <td className='py-1'>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded border ${chipClass(
                                      it.status
                                    )}`}
                                  >
                                    {it.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {remaining > 0 && (
                          <div className='mt-2 text-xs text-gray-500'>
                            +{remaining} more item{remaining > 1 ? 's' : ''} not
                            shown
                          </div>
                        )}

                        {loan.lastUpdateDate && (
                          <div className='mt-2 text-xs text-gray-500'>
                            Updated {fmtDate(loan.lastUpdateDate)}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
