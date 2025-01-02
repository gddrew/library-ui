'use client';

import React, { useState } from 'react';
import { PatronField } from '@/app/services/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import CampaignSelector from './campaign-selector';
import { createInvoice } from '@/app/services/invoiceService';
import { useRouter } from 'next/navigation';
import CurrencyInput from 'react-currency-input-field';

export default function Form({ patrons }: { patrons: PatronField[] }) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const patronId = formData.get('patronId') as string;
    const status = formData.get('status') as string;
    const decimalValue = parseFloat(amountInput || '0');
    const amountInCents = Math.round(decimalValue * 100);

    try {
      await createInvoice({
        patronId: parseInt(patronId, 10),
        amount: amountInCents,
        status: status === 'paid' ? 'paid' : 'pending',
        campaign: selectedCampaign,
      });

      router.push('/dashboard/invoices');
    } catch (err) {
      console.error('Failed to create invoice', err);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        {/* Patron Name */}
        <div className='mb-4'>
          <label htmlFor='patron' className='mb-2 block text-sm font-medium'>
            Choose patron
          </label>
          <div className='relative'>
            <select
              id='patron'
              name='patronId'
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
              defaultValue=''
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
            <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
          </div>
        </div>

        {/* Campaign */}
        <div className='mb-4'>
          <label htmlFor='campaign' className='mb-2 block text-sm font-medium'>
            Choose a campaign
          </label>
          <div className='relative'>
            <CampaignSelector
              onSelectCampaign={setSelectedCampaign}
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
            />
            <BanknotesIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
          </div>
        </div>

        {/* Invoice Amount */}
        <div className='mb-4'>
          <label htmlFor='amount' className='mb-2 block text-sm font-medium'>
            Choose an amount
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <CurrencyInput
                id='amount'
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                prefix='$'
                groupSeparator=','
                decimalSeparator='.'
                decimalsLimit={2}
                defaultValue={0}
                value={amountInput}
                onValueChange={(value) => setAmountInput(value || '')}
                placeholder='Enter USD amount'
              />
              <CurrencyDollarIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className='mb-2 block text-sm font-medium'>
            Set the invoice status
          </legend>
          <div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
            <div className='flex gap-4'>
              <div className='flex items-center'>
                <input
                  id='pending'
                  name='status'
                  type='radio'
                  value='pending'
                  className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                />
                <label
                  htmlFor='pending'
                  className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'
                >
                  Pending <ClockIcon className='h-4 w-4' />
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  id='paid'
                  name='status'
                  type='radio'
                  value='paid'
                  className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
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
      </div>
      <div className='mt-6 flex justify-end gap-4'>
        <Link
          href='/dashboard/invoices'
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
        >
          Cancel
        </Link>
        <Button type='submit'>Create Invoice</Button>
      </div>
    </form>
  );
}
