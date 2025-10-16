'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PatronForm } from '@/app/services/definitions';
import { updatePatron, deletePatron } from '@/app/services/patronService';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { usStateOptions } from '@/app/lib/state-options';
import { formatTelephone } from '@/app/services/utils';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function PatronDetails({ patron }: { patron: PatronForm }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? null;
  const backHref = React.useMemo(() => {
    // keep only the params your list page understands
    const allow = ['page', 'pageSize', 'q', 'sort', 'filter'];
    const out = new URLSearchParams();
    for (const key of allow) {
      const val = searchParams.get(key);
      if (val) out.set(key, val);
    }
    return out.toString()
      ? `/dashboard/patrons?${out.toString()}`
      : '/dashboard/patrons';
  }, [searchParams]);

  function handleBack() {
    if (from) {
      router.push(from); // go straight back to the list you came from
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref); // safe fallback
    }
  }

  const [isEditing, setIsEditing] = useState(false);

  const [localData, setLocalData] = useState({ ...patron });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setLocalData({ ...patron });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setLocalData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updatedPatron = await updatePatron(patron.patronId, localData);
      setLocalData(updatedPatron);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update patron', err);
    }
  }

  function handleShowDelete() {
    setShowDeleteConfirm(true);
  }

  function handleCancelDelete() {
    setShowDeleteConfirm(false);
  }

  async function handleConfirmDelete() {
    try {
      await deletePatron(patron.patronId);
      router.push('/dashboard/patron');
    } catch (err) {
      console.error('Failed to delete patron', err);
    }
  }

  return (
    <div>
      <form onSubmit={handleSave} className='space-y-4'>
        {/* General Information Block */}

        <h2 className='text-xl font-semibold mb-2 border-b pb-2'>
          General Information
        </h2>
        {/* Patron ID */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Patron ID</label>
            <div className='flex items-center gap-2'>
              <input
                name='patronId'
                type='text'
                readOnly
                value={localData.patronId}
                className='block w-40 rounded-md border border-gray-200 py-2 px-3 text-sm text-gray-500'
              />
              <Link href={`/dashboard/patrons/${patron.patronId}/cards`}>
                <CreditCardIcon className='h-6 w-6' />
              </Link>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Current Status
            </label>
            <select
              name='status'
              value={localData.status}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            >
              <option value='ACTIVE'>Active</option>
              <option value='INACTIVE'>Inactive</option>
              <option value='SUSPENDED'>Suspended</option>
            </select>
          </div>

          {/* Checkout History Link */}
          <div className='mt-6'>
            <Link
              href={{
                pathname: `/dashboard/patrons/${patron.patronId}/history`,
                query: from ? { from } : undefined,
              }}
              className='inline-block px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600'
            >
              View Loan History
            </Link>
          </div>
        </div>

        {/* Patron Indicative Information block */}
        {/* Patron Name */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Patron Full Name
            </label>
            <input
              name='patronName'
              type='text'
              value={localData.patronName}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Date of Birth
            </label>
            <input
              type='date'
              name='dateOfBirth'
              value={
                localData.dateOfBirth
                  ? localData.dateOfBirth instanceof Date
                    ? localData.dateOfBirth.toISOString().split('T')[0]
                    : new Date(localData.dateOfBirth)
                        .toISOString()
                        .split('T')[0]
                  : ''
              }
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Member Since
            </label>
            <input
              type='date'
              name='createdDate'
              value={
                localData.created_date
                  ? localData.created_date instanceof Date
                    ? localData.created_date.toISOString().split('T')[0]
                    : new Date(localData.created_date)
                        .toISOString()
                        .split('T')[0]
                  : ''
              }
              // onChange={handleChange}
              // disabled={!isEditing}
              readOnly
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm text-gray-500'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Last Update Date
            </label>
            <input
              type='date'
              name='lastUpdateDate'
              value={
                localData.lastUpdateDate
                  ? localData.lastUpdateDate instanceof Date
                    ? localData.lastUpdateDate.toISOString().split('T')[0]
                    : new Date(localData.lastUpdateDate)
                        .toISOString()
                        .split('T')[0]
                  : ''
              }
              readOnly
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm text-gray-500'
            />
          </div>
        </div>

        {/* Contact Information Block */}
        <h2 className='text-xl font-semibold mb-2 border-b pb-2 py-6'>
          Contact Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Email Address
            </label>
            <input
              name='emailAddress'
              type='text'
              value={localData.emailAddress}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Preferred Contact Method
            </label>
            <select
              name='contactMethod'
              value={localData.contactMethod}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            >
              <option value='home'>Home</option>
              <option value='text'>Text</option>
              <option value='mail'>Mail</option>
              <option value='email'>Email</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          <div>
            <label>Street Address</label>
            <input
              name='streetAddress'
              type='text'
              value={localData.streetAddress}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          <div>
            <label>City</label>
            <input
              name='cityName'
              type='text'
              value={localData.cityName}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
          <div>
            <label>State</label>
            <select
              name='stateName'
              value={localData.stateName}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            >
              <option value=''>Select a state</option>
              {usStateOptions.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Zip Code</label>
            <input
              name='zipCode'
              type='text'
              onChange={handleChange}
              readOnly={!isEditing}
              value={localData.zipCode}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
          <div>
            <label>Home Telephone</label>
            <input
              name='telephoneHome'
              type='text'
              value={formatTelephone(localData.telephoneHome)}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
          <div>
            <label>Mobile Telephone</label>
            <input
              name='telephoneMobile'
              type='text'
              value={formatTelephone(localData.telephoneMobile)}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-6 flex items-center gap-4 py-6'>
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
              <button
                type='button'
                onClick={handleBack}
                className='flex h-10 items-center rounded-lg bg-gray-100 px-4 py-1 text-gray-700 hover:bg-gray-200'
              >
                Back
              </button>
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='rounded-md bg-white p-4'>
            <p className='mb-2 text-sm'>
              Are you sure you want to delete this patron?
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
