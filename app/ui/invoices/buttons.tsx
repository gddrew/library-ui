'use client';

import React, { useState } from 'react';
import { deleteInvoice } from '@/app/services/invoiceService';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Invoice } from '@/app/services/definitions';

export function CreateInvoice() {
  return (
    <Link
      href='/dashboard/invoices/create'
      className='flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
    >
      <span className='hidden md:block'>Create Invoice</span>{' '}
      <PlusIcon className='h-5 md:ml-4' />
    </Link>
  );
}

export function UpdateInvoice({ invoiceId }: { invoiceId: number }) {
  return (
    <Link
      href={`/dashboard/invoices/${invoiceId}/edit`}
      className='rounded-md border p-2 hover:bg-gray-100'
    >
      <PencilIcon className='w-5' />
    </Link>
  );
}

export function DeleteInvoice({
  invoiceId,
  invoices,
  setInvoices,
}: {
  invoiceId: number;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  //const router = useRouter();

  async function handleConfirmDelete() {
    try {
      await deleteInvoice(invoiceId);
      setInvoices(invoices.filter((inv) => inv.invoiceId !== invoiceId));
    } catch (error) {
      console.error('Failed to delete invoice', error);
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
              Are you sure you want to delete this invoice?
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
