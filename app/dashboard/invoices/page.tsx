'use client';

import React, { useEffect, useState } from 'react';
import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { lusitana } from '@/app/ui/fonts';
import { fetchInvoicesPages } from '@/app/lib/data';
import { useSearchParams } from 'next/navigation';

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchInvoicesPages(query, currentPage)
      .then((res) => {
        setInvoices(res.invoices);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        console.error('Error:', err);
        // handle error state if desired
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, currentPage]);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search invoices...' />
        <CreateInvoice />
      </div>
      {loading ? (
        <InvoicesTableSkeleton />
      ) : (
        <>
          <Table query={query} currentPage={currentPage} invoices={invoices} />
          <div className='mt-5 flex w-full justify-center'>
            <Pagination totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  );
}
