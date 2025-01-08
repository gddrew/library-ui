'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreateMedia } from '@/app/ui/media/buttons';
import Pagination from '@/app/ui/pagination';
import { MediaTableSkeleton } from '@/app/ui/skeletons';
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

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const allMedia = await listMedia();
        const filteredMedia = allMedia.filter((media) => {
          return media.mediaTitle.toLowerCase().includes(query.toLowerCase());
        });
        const itemsPerPage = 10;
        const offset = (currentPage - 1) * itemsPerPage;
        const paginatedMedia = filteredMedia.slice(
          offset,
          offset + itemsPerPage
        );

        setMedia(paginatedMedia);
        setTotalPages(Math.ceil(filteredMedia.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [query, currentPage]);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Media</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='Search media...' />
        <CreateMedia />
      </div>
      {loading ? (
        <MediaTableSkeleton />
      ) : (
        <>
          <Table
            query={query}
            currentPage={currentPage}
            media={media}
            setMedia={setMedia}
          />
          <div className='mt-5 flex w-full justify-center'>
            <Pagination totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  );
}
