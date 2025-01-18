'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceForm, PatronField } from '@/app/services/definitions';
import { updateInvoice, deleteInvoice } from '@/app/services/invoiceService';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import CampaignSelector from './campaign-selector';

// This is our new "InvoiceDetails" component, which can show read-only OR an edit form
export default function InvoiceDetails({
  invoice,
  patrons,
}: {
  invoice: InvoiceForm;
  patrons: PatronField[];
}) {
  const router = useRouter();

  // Controls editing state (read-only by default)
  const [isEditing, setIsEditing] = useState(false);

  // Local state for form data (initialize from the server-fetched invoice)
  const [localData, setLocalData] = useState({ ...invoice });

  // Confirmation for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toggles to editing mode
  function handleEdit() {
    setIsEditing(true);
  }

  // Cancels editing, revert local data
  function handleCancel() {
    setIsEditing(false);
    setLocalData({ ...invoice }); // revert changes
  }

  // Handle changes in form fields
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    // If editing amount, convert to integer in cents
    if (name === 'amount') {
      const decimalValue = parseFloat(value) || 0;
      setLocalData((prev) => ({
        ...prev,
        amount: Math.round(decimalValue * 100),
      }));
    } else {
      setLocalData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  // Radio button changes for status
  function handleStatusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const statusVal = e.target.value === 'paid' ? 'paid' : 'pending';
    setLocalData((prev) => ({
      ...prev,
      status: statusVal,
    }));
  }

  // On campaign change (using your existing CampaignSelector)
  function handleCampaignSelect(campaign: string) {
    setLocalData((prev) => ({
      ...prev,
      campaign,
    }));
  }

  // Save / Update the invoice
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateInvoice(invoice.invoiceId, localData);
      // If successful, exit editing mode
      setIsEditing(false);
      // You could also refresh from the server or just rely on localData being updated
    } catch (err) {
      console.error('Failed to update invoice', err);
    }
  }

  // DELETE flow
  function handleShowDelete() {
    setShowDeleteConfirm(true);
  }
  function handleCancelDelete() {
    setShowDeleteConfirm(false);
  }
  async function handleConfirmDelete() {
    try {
      await deleteInvoice(invoice.invoiceId);
      // After deletion, go back to the invoices list
      router.push('/dashboard/invoices');
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  }

  // For convenience, convert localData.amount to a decimal string (for inputs)
  const amountString = (localData.amount / 100).toFixed(2);

  return (
    <div>
      <h1 className='text-xl font-bold mb-6'>Invoice #{invoice.invoiceId}</h1>

      {/* If NOT editing, show read-only fields */}
      {!isEditing && (
        <div className='space-y-4'>
          <p>
            <strong>Patron:</strong> {localData.patronName}
          </p>
          <p>
            <strong>Email:</strong> {localData.emailAddress}
          </p>
          <p>
            <strong>Amount (USD):</strong> {amountString}
          </p>
          <p>
            <strong>Campaign:</strong> {localData.campaign}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            {localData.status === 'paid' ? 'Paid' : 'Pending'}
          </p>

          <div className='mt-4 flex gap-3'>
            <button
              onClick={handleEdit}
              className='inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200'
            >
              Edit
            </button>
            <button
              onClick={handleShowDelete}
              className='inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600'
            >
              Delete
            </button>
            <Link
              href='/dashboard/invoices'
              className='inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200'
            >
              Back
            </Link>
          </div>
        </div>
      )}

      {/* If editing, render the same form you already have, but controlled by local state */}
      {isEditing && (
        <form onSubmit={handleSave} className='space-y-4'>
          {/* Invoice ID */}
          <div>
            <label
              htmlFor='invoiceId'
              className='mb-1 block text-sm font-medium'
            >
              Invoice ID
            </label>
            <input
              id='invoiceId'
              name='invoiceId'
              type='text'
              readOnly
              value={localData.invoiceId}
              className='block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm text-gray-500'
            />
          </div>

          {/* Patron */}
          <div>
            <label
              htmlFor='patronId'
              className='mb-1 block text-sm font-medium'
            >
              Choose patron
            </label>
            <div className='relative'>
              <select
                id='patronId'
                name='patronId'
                className='block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm'
                value={localData.patronId}
                onChange={handleChange}
              >
                <option value='' disabled>
                  Select a patron
                </option>
                {patrons.map((patron) => (
                  <option key={patron.patronId} value={patron.patronId}>
                    {patron.patronName}
                  </option>
                ))}
              </select>
              <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500' />
            </div>
          </div>

          {/* Campaign */}
          <div>
            <label
              htmlFor='campaign'
              className='mb-1 block text-sm font-medium'
            >
              Campaign
            </label>
            <CampaignSelector
              initialCampaign={localData.campaign}
              onSelectCampaign={handleCampaignSelect}
              className='block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm'
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor='amount' className='mb-1 block text-sm font-medium'>
              Choose an amount
            </label>
            <div className='relative'>
              <input
                id='amount'
                name='amount'
                type='number'
                step='0.01'
                value={amountString}
                onChange={handleChange}
                className='block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm'
              />
              <CurrencyDollarIcon className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500' />
            </div>
          </div>

          {/* Invoice Status */}
          <fieldset>
            <legend className='mb-2 block text-sm font-medium'>
              Set the invoice status
            </legend>
            <div className='rounded-md border border-gray-200 bg-white px-4 py-3'>
              <div className='flex gap-4'>
                {/* Pending */}
                <div className='flex items-center'>
                  <input
                    id='pending'
                    name='status'
                    type='radio'
                    value='pending'
                    checked={localData.status === 'pending'}
                    onChange={handleStatusChange}
                    className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600'
                  />
                  <label
                    htmlFor='pending'
                    className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
                  >
                    Pending <ClockIcon className='h-4 w-4' />
                  </label>
                </div>

                {/* Paid */}
                <div className='flex items-center'>
                  <input
                    id='paid'
                    name='status'
                    type='radio'
                    value='paid'
                    checked={localData.status === 'paid'}
                    onChange={handleStatusChange}
                    className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600'
                  />
                  <label
                    htmlFor='paid'
                    className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white'
                  >
                    Paid <CheckIcon className='h-4 w-4' />
                  </label>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Action buttons */}
          <div className='mt-6 flex justify-end gap-4'>
            <button
              type='button'
              onClick={handleCancel}
              className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200'
            >
              Cancel
            </button>
            <Button type='submit'>Save</Button>
          </div>
        </form>
      )}

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/30 z-50'>
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
                onClick={handleCancelDelete}
                className='rounded-md bg-gray-200 px-3 py-2'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
