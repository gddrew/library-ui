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

  // Local state for form data
  const [localData, setLocalData] = useState({ ...invoice });

  // Confirmation for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // For convenience, the decimal string version of the amount
  const amountString = (localData.amount / 100).toFixed(2);

  // Toggle editing on/off
  function handleEdit() {
    setIsEditing(true);
  }
  function handleCancel() {
    setIsEditing(false);
    setLocalData({ ...invoice }); // revert local changes
  }

  // Handle input changes
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    // If "amount," convert to cents
    if (name === 'amount') {
      const decimalValue = parseFloat(value) || 0;
      setLocalData((prev) => ({
        ...prev,
        amount: Math.round(decimalValue * 100),
      }));
    } else {
      setLocalData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Handle radio changes
  function handleStatusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const statusVal = e.target.value === 'paid' ? 'paid' : 'pending';
    setLocalData((prev) => ({ ...prev, status: statusVal }));
  }

  // Handle campaign selector
  function handleCampaignSelect(campaign: string) {
    setLocalData((prev) => ({ ...prev, campaign }));
  }

  // Save changes
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateInvoice(invoice.invoiceId, localData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update invoice', err);
    }
  }

  // Delete flow
  function handleShowDelete() {
    setShowDeleteConfirm(true);
  }
  function handleCancelDelete() {
    setShowDeleteConfirm(false);
  }
  async function handleConfirmDelete() {
    try {
      await deleteInvoice(invoice.invoiceId);
      router.push('/dashboard/invoices');
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  }

  return (
    <div>
      <form onSubmit={handleSave} className='space-y-4'>
        {/* Invoice ID */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Invoice ID</label>
          <input
            name='invoiceId'
            type='text'
            readOnly // Invoice ID typically never changes
            value={localData.invoiceId}
            className='block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm text-gray-500'
          />
        </div>

        {/* Patron */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Patron</label>
          <div className='relative'>
            <select
              name='patronId'
              value={localData.patronId}
              onChange={handleChange}
              disabled={!isEditing} // disabled when read-only
              className='block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm'
            >
              <option value='' disabled>
                Select a patron
              </option>
              {patrons.map((p) => (
                <option key={p.patronId} value={p.patronId}>
                  {p.patronName}
                </option>
              ))}
            </select>
            <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500' />
          </div>
          {/* If you’d rather show a read-only text version, do it conditionally */}
        </div>

        {/* Email (if you want to keep it separate) */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Email</label>
          <input
            name='emailAddress'
            type='email'
            value={localData.emailAddress}
            onChange={handleChange}
            readOnly={!isEditing} // readOnly in read-only mode
            className='block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm'
          />
        </div>

        {/* Campaign */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Campaign</label>
          <CampaignSelector
            initialCampaign={localData.campaign}
            onSelectCampaign={handleCampaignSelect}
            className='block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm'
            disabled={!isEditing}
          />
        </div>

        {/* Amount */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Amount (USD)</label>
          <div className='relative'>
            <input
              name='amount'
              type='number'
              step='0.01'
              value={amountString}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm'
            />
            <CurrencyDollarIcon className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500' />
          </div>
        </div>

        {/* Status */}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
        <div className='mt-6 flex items-center gap-4'>
          {isEditing ? (
            <>
              <button
                type='button'
                onClick={handleCancel}
                className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200'
              >
                Cancel
              </button>
              <Button type='submit'>Save</Button>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={handleEdit}
                className='flex h-10 items-center rounded-lg bg-brown-400 px-4 text-sm font-medium text-white hover:bg-brown-500'
              >
                Edit
              </button>
              <Link
                href='/dashboard/invoices'
                className='flex h-10 items-center rounded-lg bg-gray-100 px-4 py-1 text-gray-700 hover:bg-gray-200'
              >
                Back
              </Link>
              {/* Delete on the far right */}
              <button
                type='button'
                onClick={handleShowDelete}
                className='ml-auto flex h-10 items-center rounded-lg bg-red-500 px-4 py-1 text-white hover:bg-red-600'
              >
                Delete
              </button>
            </>
          )}
        </div>
      </form>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='rounded-md bg-white p-4'>
            <p className='mb-2 text-sm'>
              Are you sure you want to delete this invoice?
            </p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={handleConfirmDelete}
                className='rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600'
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className='rounded-md bg-gray-200 px-3 py-2 hover:bg-gray-300'
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
