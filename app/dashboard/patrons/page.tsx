'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreatePatron } from '@/app/ui/patrons/buttons';
import Pagination from '@/app/ui/pagination';
import Table from '@/app/ui/patrons/table';
import { Patron } from '@/app/services/definitions';
import { listPatrons } from '@/app/services/patronService';

export default function PatronPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<Record<number, Patron[]>>({});

  // Fetch patron for a specific page
  const fetchPatronPage = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        if (cache[page]) {
          // Use cached data if available
          setPatrons(cache[page]);
          setLoading(false);
          return;
        }

        const allPatrons = await listPatrons();
        const filteredPatrons = allPatrons.filter((patrons) =>
          patrons.patronName.toLowerCase().includes(query.toLowerCase())
        );
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const paginatedPatrons = filteredPatrons.slice(
          offset,
          offset + itemsPerPage
        );

        setCache((prev) => ({ ...prev, [page]: paginatedPatrons }));
        setPatrons(paginatedPatrons);
        setTotalPages(Math.ceil(filteredPatrons.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching patron:', err);
      } finally {
        setLoading(false);
      }
    },
    [cache, query]
  );

  // Prefetch data for adjacent pages
  const handlePrefetchPage = useCallback(
    async (page: number) => {
      if (cache[page]) return; // Skip if already cached

      try {
        const allPatrons = await listPatrons();
        const filteredPatrons = allPatrons.filter((patrons) =>
          patrons.patronName.toLowerCase().includes(query.toLowerCase())
        );
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const paginatedPatrons = filteredPatrons.slice(
          offset,
          offset + itemsPerPage
        );

        setCache((prev) => ({ ...prev, [page]: paginatedPatrons }));
      } catch (err) {
        console.error('Error prefetching patron:', err);
      }
    },
    [cache, query]
  );

  // Effect to fetch data when the page or query changes
  useEffect(() => {
    fetchPatronPage(currentPage);
  }, [query, currentPage, fetchPatronPage]);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Patron</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search patron...' />
        <CreatePatron />
      </div>
      <div
        className={`relative transition-opacity duration-500 ${
          loading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <Table
          query={query}
          currentPage={currentPage}
          patrons={patrons}
          setPatrons={setPatrons}
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
