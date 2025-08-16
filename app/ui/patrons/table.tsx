'use client';

import React from 'react';
import Link from 'next/link';
import PatronStatus from '@/app/ui/patrons/status';
import { formatTelephone, capitalizeFirstLetter } from '@/app/services/utils';
import { Patron } from '@/app/services/definitions';
import { formatDateToLocal } from '@/app/services/utils';
import { usePathname, useSearchParams } from 'next/navigation';

// Define the props for your Table
type PatronTableProps = {
  query: string;
  currentPage: number;
  patrons: Patron[];
  setPatrons: React.Dispatch<React.SetStateAction<Patron[]>>;
};

export default function PatronTable({ patrons }: PatronTableProps) {
  // Enable useSearchParams to remember page user was on when drilling into an item
  const pathname = usePathname(); // "/dashboard/patrons"
  const params = useSearchParams();
  const from = params.toString()
    ? `${pathname}?${params.toString()}`
    : pathname;

  return (
    <div className='overflow-x-auto mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          {/* Mobile version */}
          <div className='md:hidden'>
            {patrons?.map((patron) => (
              <div
                key={patron.patronId}
                className='mb-2 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center'>
                      <p className='text-sm'>{patron.patronId}</p>
                    </div>
                    <p className='text-md font-medium'>{patron.patronName}</p>
                  </div>
                  <PatronStatus status={patron.status} />
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    <p className='text-sm text-gray-500'>
                      {patron.emailAddress}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {patron.telephoneHome
                        ? formatTelephone(patron.telephoneHome)
                        : '--'}
                    </p>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Link
                      href={{
                        pathname: `/dashboard/patrons/${patron.patronId}`,
                        query: { from },
                      }}
                      // optional: keep scroll position when returning via link
                      scroll={true}
                      className='inline-flex items-center gap-1 rounded-md border px-3 py-1 hover:bg-gray-100'
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop version */}
          <table className='hidden md:table table-fixed w-full text-gray-900'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='w-24 px-4 py-3 font-medium sm:pl-6'>
                  Patron ID
                </th>
                <th scope='col' className='w-40 px-4 py-3 font-medium sm:pl-6'>
                  Name
                </th>
                <th scope='col' className='w-60 px-3 py-3 font-medium'>
                  Email Address
                </th>
                <th scope='col' className='w-40 px-3 py-3 font-medium'>
                  Telephone
                </th>
                <th scope='col' className='w-40 px-3 py-3 font-medium'>
                  Status
                </th>
                <th scope='col' className='w-24 px-3 py-3 font-medium'>
                  Member Since
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {patrons?.map((patron) => (
                <tr key={patron.patronId} className='border-b text-sm'>
                  <td className='px-6 py-3'>
                    <Link
                      href={{
                        pathname: `/dashboard/patrons/${patron.patronId}`,
                        query: { from },
                      }}
                    >
                      {patron.patronId}
                    </Link>
                  </td>
                  <td className='truncate px-6 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-40'>
                    {patron.patronName}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-60'>
                    {patron.emailAddress}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-40'>
                    {patron.telephoneHome
                      ? formatTelephone(patron.telephoneHome)
                      : '--'}
                  </td>
                  <td className='truncate px-3 py-3'>
                    {patron.status
                      ? capitalizeFirstLetter(patron.status)
                      : '--'}
                  </td>
                  <td className='truncate px-3 py-3'>
                    {formatDateToLocal(patron.created_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
