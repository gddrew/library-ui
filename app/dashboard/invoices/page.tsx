'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoiceResponse, PaginatedResponse } from '@/app/services/definitions';
import { listInvoices } from '@/app/services/invoiceService';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/app/lib/useDebounce';

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the query input by 300ms
  const debouncedQuery = useDebounce(query, 300);

  // Fetch invoices for a specific page and query
  const fetchInvoicePage = useCallback(
    async (page: number, searchQuery: string) => {
      setLoading(true);
      setError(null);
      try {
        const data: PaginatedResponse<InvoiceResponse> = await listInvoices(
          searchQuery,
          page
        );

        setInvoices(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Effect to fetch data when the debounced query or page changes
  useEffect(() => {
    fetchInvoicePage(currentPage, debouncedQuery);
  }, [debouncedQuery, currentPage, fetchInvoicePage]);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search invoices...' />
        <CreateInvoice />
      </div>
      {error && <div className='mt-4 text-red-500'>{error}</div>}
      <div
        className={`relative transition-opacity duration-500 ${
          loading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <Table
          query={debouncedQuery}
          currentPage={currentPage}
          invoices={invoices}
        />
        <div className='mt-5 flex w-full justify-center'>
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}
