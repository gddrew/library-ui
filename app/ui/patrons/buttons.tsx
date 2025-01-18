'use client';

import React, { useState } from 'react';
import { deletePatron } from '@/app/services/patronService';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Patron } from '@/app/services/definitions';

export function CreatePatron() {
  return (
    <Link
      href='/dashboard/patron/create'
      className='flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
    >
      <span className='hidden md:block'>Create Patron</span>{' '}
      <PlusIcon className='h-5 md:ml-4' />
    </Link>
  );
}

export function UpdatePatron({ patronId }: { patronId: number }) {
  return (
    <Link
      href={`/dashboard/patron/${patronId}/edit`}
      className='rounded-md border p-2 hover:bg-gray-100'
    >
      <PencilIcon className='w-5' />
    </Link>
  );
}

export function DeletePatron({
  patronId,
  patron,
  setPatron,
}: {
  patronId: number;
  patron: Patron[];
  setPatron: React.Dispatch<React.SetStateAction<Patron[]>>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  //const router = useRouter();

  async function handleConfirmDelete() {
    try {
      await deletePatron(patronId);
      setPatron(patron.filter((patron) => patron.patronId !== patronId));
    } catch (error) {
      console.error('Failed to delete patron', error);
    } finally {
      setShowConfirm(false);
    }
  }
  return (
    <>
      {/* Delete button that triggers modal */}
      <button
        type='button'
        onClick={() => setShowConfirm(true)}
        className='rounded-md border p-2 hover:bg-gray-100'
      >
        <span className='sr-only'>Delete</span>
        <TrashIcon className='w-5' />
      </button>

      {/* Simple confirmation dialog */}
      {showConfirm && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/30'>
          <div className='rounded-md bg-white p-4'>
            <p className='mb-2 text-sm'>
              Are you sure you want to delete this item?
            </p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={handleConfirmDelete}
                className='rounded-md bg-red-500 px-3 py-2 text-white'
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className='rounded-md bg-gray-200 px-3 py-2'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
