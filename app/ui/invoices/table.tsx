import React from 'react';
import Link from 'next/link';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/services/utils';
import { InvoiceResponse } from '@/app/services/definitions';

// Define the props for your Table
type InvoicesTableProps = {
  query: string;
  currentPage: number;
  invoices: InvoiceResponse[];
};

export default function InvoicesTable({ invoices }: InvoicesTableProps) {
  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          {/* Mobile version */}
          <div className='md:hidden'>
            {invoices?.map((invoice) => (
              <div
                key={invoice.invoiceId}
                className='mb-2 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center'>
                      <p>{invoice.patronName}</p>
                    </div>
                    <p className='text-sm text-gray-500'>
                      {invoice.emailAddress}
                    </p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    <p className='text-xl font-medium'>
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p className='text-xl font-medium'>{invoice.campaign}</p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Link
                      href={`/dashboard/invoices/${invoice.invoiceId}`}
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
                <th scope='col' className='w-24 px-4 py-5 font-medium sm:pl-6'>
                  Invoice ID
                </th>
                <th scope='col' className='w-40 px-4 py-5 font-medium sm:pl-6'>
                  Patron
                </th>
                <th scope='col' className='w-60 px-3 py-5 font-medium'>
                  Email
                </th>
                <th scope='col' className='w-24 px-3 py-5 font-medium'>
                  Amount
                </th>
                <th scope='col' className='w-40 px-3 py-5 font-medium'>
                  Campaign
                </th>
                <th scope='col' className='w-24 px-3 py-5 font-medium'>
                  Date
                </th>
                <th scope='col' className='w-24 px-3 py-5 font-medium'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {invoices?.map((invoice) => (
                <tr key={invoice.invoiceId} className='border-b text-sm'>
                  <td className='px-6 py-3'>
                    <Link
                      href={`/dashboard/invoices/${invoice.invoiceId}`}
                      className='hover:text-blue-600'
                    >
                      {invoice.invoiceId}
                    </Link>
                  </td>
                  <td className='truncate py-3 pl-6 pr-3 overflow-hidden text-ellipsis whitespace-nowrap w-40'>
                    <div className='flex items-center gap-3'>
                      <p>{invoice.patronName}</p>
                    </div>
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-60'>
                    {invoice.emailAddress}
                  </td>
                  <td className='truncate px-3 py-3'>
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-40'>
                    {invoice.campaign}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-24'>
                    {formatDateToLocal(invoice.date)}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-24'>
                    <InvoiceStatus status={invoice.status} />
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
