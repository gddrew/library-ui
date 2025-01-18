'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreateMedia } from '@/app/ui/media/buttons';
import Pagination from '@/app/ui/pagination';
import Table from '@/app/ui/media/table';
import { Media } from '@/app/services/definitions';
import { listMedia } from '@/app/services/mediaService';

export default function MediaPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [media, setMedia] = useState<Media[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<Record<number, Media[]>>({});

  // Fetch media for a specific page
  const fetchMediaPage = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        if (cache[page]) {
          // Use cached data if available
          setMedia(cache[page]);
          setLoading(false);
          return;
        }

        const allMedia = await listMedia();
        const filteredMedia = allMedia.filter((media) =>
          media.mediaTitle.toLowerCase().includes(query.toLowerCase())
        );
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const paginatedMedia = filteredMedia.slice(
          offset,
          offset + itemsPerPage
        );

        setCache((prev) => ({ ...prev, [page]: paginatedMedia }));
        setMedia(paginatedMedia);
        setTotalPages(Math.ceil(filteredMedia.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching media:', err);
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
        const allMedia = await listMedia();
        const filteredMedia = allMedia.filter((media) =>
          media.mediaTitle.toLowerCase().includes(query.toLowerCase())
        );
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const paginatedMedia = filteredMedia.slice(
          offset,
          offset + itemsPerPage
        );

        setCache((prev) => ({ ...prev, [page]: paginatedMedia }));
      } catch (err) {
        console.error('Error prefetching media:', err);
      }
    },
    [cache, query]
  );

  // Effect to fetch data when the page or query changes
  useEffect(() => {
    fetchMediaPage(currentPage);
  }, [query, currentPage, fetchMediaPage]);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Media</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search media...' />
        <CreateMedia />
      </div>
      <div
        className={`relative transition-opacity duration-500 ${
          loading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <Table
          query={query}
          currentPage={currentPage}
          media={media}
          setMedia={setMedia}
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
