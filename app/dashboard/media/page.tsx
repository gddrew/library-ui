'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/media/table';
import { CreateMedia } from '@/app/ui/media/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Media } from '@/app/services/definitions';
import { listMedia } from '@/app/services/mediaService';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/app/lib/useDebounce';

export default function MediaPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [media, setMedia] = useState<Media[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef<Record<string, Record<number, Media[]>>>({});

  // Debounce the query input by 300ms
  const debouncedQuery = useDebounce(query, 300);

  // Fetch media for a specific page
  const fetchMediaPage = useCallback(
    async (page: number, searchQuery: string) => {
      setLoading(true);
      try {
        if (cacheRef.current[searchQuery]?.[page]) {
          // Use cached data if available
          setMedia(cacheRef.current[searchQuery][page]);
          setLoading(false);
          return;
        }

        const allMedia = await listMedia();
        const normalized = searchQuery.trim().toLowerCase();
        const filteredMedia = allMedia.filter((item) => {
          if (!normalized) return true;

          const title = item.mediaTitle?.toLowerCase() ?? '';
          const id = item.mediaId?.toString() ?? '';

          return title.includes(normalized) || id.includes(searchQuery.trim());
        });

        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const paginatedMedia = filteredMedia.slice(
          offset,
          offset + itemsPerPage
        );

        cacheRef.current = {
          ...cacheRef.current,
          [searchQuery]: {
            ...(cacheRef.current[searchQuery] || {}),
            [page]: paginatedMedia,
          },
        };

        setMedia(paginatedMedia);
        setTotalPages(Math.ceil(filteredMedia.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching media:', err);
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
        const allMedia = await listMedia();
        const normalized = debouncedQuery.trim().toLowerCase();
        const filteredMedia = allMedia.filter((item) => {
          if (!normalized) return true;

          const title = item.mediaTitle?.toLowerCase() ?? '';
          const id = item.mediaId?.toString() ?? '';

          return (
            title.includes(normalized) || id.includes(debouncedQuery.trim())
          );
        });

        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;
        const paginatedMedia = filteredMedia.slice(
          offset,
          offset + itemsPerPage
        );

        cacheRef.current = {
          ...cacheRef.current,
          [debouncedQuery]: {
            ...(cacheRef.current[debouncedQuery] || {}),
            [page]: paginatedMedia,
          },
        };
      } catch (err) {
        console.error('Error prefetching media:', err);
      }
    },
    [debouncedQuery]
  );

  // Effect to fetch data when the page or query changes
  useEffect(() => {
    fetchMediaPage(currentPage, debouncedQuery);
  }, [debouncedQuery, currentPage, fetchMediaPage]);

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
        <Table query={debouncedQuery} currentPage={currentPage} media={media} />
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
