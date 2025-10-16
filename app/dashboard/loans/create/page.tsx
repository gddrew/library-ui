'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

      router.push(`/checkout?patronId=${data.patronId}`);
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
    <div className='max-w-xl mx-auto p-6'>
      <h1 className='text-3xl font-bold'>Start Checkout</h1>
      <p className='mt-2 text-sm text-gray-600'>
        Scan or type a library card number, then press Enter or click Search.
      </p>

      <div className='mt-6 flex gap-2'>
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
          className='rounded-lg px-4 py-2 border shadow-sm disabled:opacity-60'
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && (
        <div className='mt-3 text-sm text-red-600' role='alert'>
          {error}
        </div>
      )}
    </div>
  );
}
