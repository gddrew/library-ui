'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';

interface Patron {
  patronId: number;
  patronName: string;
  libraryCard: string | number;
}

export default function CreateLoanPage() {
  const router = useRouter();
  const [cardId, setCardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    const trimmed = cardId.trim();
    if (!trimmed) {
      setError('Please enter a library card number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`/api/cards/${encodeURIComponent(trimmed)}`);
      if (!resp.ok) {
        const problem = await resp.json().catch(() => ({}));
        throw new Error(problem?.message || `Lookup failed (${resp.status}).`);
      }

      const data: Patron = await resp.json();
      if (!data || data.patronId == null) {
        throw new Error('No patron found for that card');
      }

      router.push(`/dashboard/loans/transaction?patronId=${data.patronId}`);
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  };

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Start Checkout</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <p className='text-sm text-gray-600'>
          Scan or type a library card number, then press Enter or click Search.
        </p>
      </div>
      <div className='relative mt-6 transition-opacity duration-500'>
        <div className='flex gap-2'>
          <input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            autoFocus
            placeholder='Library Card Number'
            className='flex-1 border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-blue-200'
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            onClick={runSearch}
            disabled={loading}
            className='inline-block px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600'
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className='mt-3 text-sm text-red-600' role='alert'>
          {error}
        </div>
      )}
    </div>
  );
}
