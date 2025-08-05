'use client';

import { createCard } from '@/app/services/cardService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function IssueCardButton({ patronId }: { patronId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleIssueCard() {
    setIsLoading(true);
    try {
      await createCard(patronId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleIssueCard}
      disabled={isLoading}
      className='inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700'
    >
      {isLoading ? 'Issuing...' : 'Issue Card'}
    </button>
  );
}
