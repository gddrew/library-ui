'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Invoice } from '@/app/services/definitions';
import { listInvoices } from '@/app/services/invoiceService';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/app/lib/useDebounce';

export const dynamic = 'force-dynamic'; // disables SSG for this page

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef<Record<string, Record<number, Invoice[]>>>({});

  // Debounce the query input by 300ms
  const debouncedQuery = useDebounce(query, 300);

  // Fetch invoices for a specific page
  const fetchInvoicePage = useCallback(
    async (page: number, searchQuery: string) => {
      setLoading(true);
      try {
        if (cacheRef.current[searchQuery]?.[page]) {
          setInvoices(cacheRef.current[searchQuery][page]);
          setLoading(false);
          return;
        }

        const allInvoices = await listInvoices();
        const filteredInvoices = allInvoices.filter(
          (invoices) =>
            invoices.patronName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            invoices.invoiceId.toString().includes(searchQuery)
        );
        const itemsPerPage = 7;
        const offset = (page - 1) * itemsPerPage;
        const paginatedInvoices = filteredInvoices.slice(
          offset,
          offset + itemsPerPage
        );

        cacheRef.current = {
          ...cacheRef.current,
          [searchQuery]: {
            ...(cacheRef.current[searchQuery] || {}),
            [page]: paginatedInvoices,
          },
        };

        setInvoices(paginatedInvoices);
        setTotalPages(Math.ceil(filteredInvoices.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Prefetch data for adjacent pages
  const handlePrefetchPage = useCallback(
    async (page: number) => {
      if (cacheRef.current[debouncedQuery]?.[page]) return;

      try {
        const allInvoices = await listInvoices();
        const filteredInvoices = allInvoices.filter(
          (invoices) =>
            invoices.patronName
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase()) ||
            invoices.invoiceId.toString().includes(debouncedQuery)
        );
        const itemsPerPage = 7;
        const offset = (page - 1) * itemsPerPage;
        const paginatedInvoices = filteredInvoices.slice(
          offset,
          offset + itemsPerPage
        );

        cacheRef.current = {
          ...cacheRef.current,
          [debouncedQuery]: {
            ...(cacheRef.current[debouncedQuery] || {}),
            [page]: paginatedInvoices,
          },
        };
      } catch (err) {
        console.error('Error prefetching invoices:', err);
      }
    },
    [debouncedQuery]
  );

  // Effect to fetch data when the page or query changes
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
          <Pagination
            totalPages={totalPages}
            onPrefetchPage={handlePrefetchPage}
          />
        </div>
      </div>
    </div>
  );
}
