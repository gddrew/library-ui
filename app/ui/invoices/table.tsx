import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import React from 'react';

// Define a type for your invoice items
interface Invoice {
  id: string;
  patron_name: string;
  email_address: string;
  status: string;
  amount: number;
  campaign: number;
  date: string;
}

// Define the props for your Table
type InvoicesTableProps = {
  query: string;
  currentPage: number;
  invoices: Invoice[]; // accept the array from the parent
};

export default function InvoicesTable({
  query,
  currentPage,
  invoices,
}: InvoicesTableProps) {
  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          {/* Mobile version */}
          <div className='md:hidden'>
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className='mb-2 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center'>
                      <p>{invoice.patron_name}</p>
                    </div>
                    <p className='text-sm text-gray-500'>
                      {invoice.email_address}
                    </p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    <p className='text-xl font-medium'>
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p className='text-xl font-medium'>
                      {formatCurrency(invoice.campaign)}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop version */}
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                  Patron
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Email
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Amount
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Campaign
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Date
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Status
                </th>
                <th scope='col' className='relative py-3 pl-6 pr-3'>
                  <span className='sr-only'>Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className='w-full border-b py-3 text-sm last-of-type:border-none 
                  [&:first-child>td:first-child]:rounded-tl-lg 
                  [&:first-child>td:last-child]:rounded-tr-lg 
                  [&:last-child>td:first-child]:rounded-bl-lg 
                  [&:last-child>td:last-child]:rounded-br-lg'
                >
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex items-center gap-3'>
                      <p>{invoice.patron_name}</p>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {invoice.email_address}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {formatCurrency(invoice.campaign)}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {formatDateToLocal(invoice.date)}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex justify-end gap-3'>
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
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
