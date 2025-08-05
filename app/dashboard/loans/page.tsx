'use client';

import React from 'react';
import { CreateLoan, CloseLoan } from '@/app/ui/loans/buttons';
import { inter, lusitana } from '@/app/ui/fonts';

export default function LoanPage() {
  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-4xl`}>Loans</h1>
      </div>

      {/* Begin Checkout Block */}
      <div className='mt-4 md:mt-12'>
        {/* <Search placeholder='Search loans...' /> */}
        <h1 className={`${inter.className} text-2xl`}>Checkout</h1>
        <hr className='border-t border-gray-300 my-2' />
        <div className='mt-2 inline-block'>
          <CreateLoan />
        </div>
      </div>

      {/* Begin Return Block */}
      <div className='mt-4 md:mt-16'>
        <h1 className={`${inter.className} text-2xl`}>Return</h1>
        <hr className='border-t border-gray-300 my-2' />
        <div className='mt-2 inline-block'>
          <CloseLoan />
        </div>
      </div>
    </div>
  );
}
