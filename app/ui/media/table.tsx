import React from 'react';
import { UpdateMedia } from '@/app/ui/media/buttons';
import MediaStatus from '@/app/ui/media/status';
import { Media } from '@/app/services/definitions';
import { formatDateToLocal, formatISBN13 } from '@/app/services/utils';

// Define the props for your Table
type MediaTableProps = {
  query: string;
  currentPage: number;
  media: Media[];
  setMedia: React.Dispatch<React.SetStateAction<Media[]>>;
};

export default function MediaTable({ media }: MediaTableProps) {
  return (
    <div className='overflow-x-auto mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          {/* Mobile version */}
          <div className='md:hidden'>
            {media?.map((media) => (
              <div
                key={media.mediaId}
                className='mb-2 w-full rounded-md bg-white p-4'
              >
                <div className='flex items-center justify-between border-b pb-4'>
                  <div>
                    <div className='mb-2 flex items-center'>
                      <p>{media.mediaId}</p>
                    </div>
                    <p className='text-sm text-gray-500'>{media.mediaTitle}</p>
                  </div>
                  <MediaStatus status={media.status} />
                </div>
                <div className='flex w-full items-center justify-between pt-4'>
                  <div>
                    <p className='text-xl font-medium'>{media.authorName}</p>
                    <p className='text-xl font-medium'>{media.status}</p>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <UpdateMedia mediaId={media.mediaId} />
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
                  Media ID
                </th>
                <th scope='col' className='w-60 px-4 py-3 font-medium sm:pl-6'>
                  Title
                </th>
                <th scope='col' className='w-40 px-3 py-3 font-medium'>
                  Author
                </th>
                <th scope='col' className='w-40 px-3 py-3 font-medium'>
                  Publisher
                </th>
                <th scope='col' className='w-40 px-3 py-3 font-medium'>
                  ISBN
                </th>
                <th scope='col' className='w-24 px-3 py-3 font-medium'>
                  Date Acquired
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {media?.map((media) => (
                <tr key={media.mediaId} className='border-b text-sm'>
                  <td className='truncate px-6 py-3'>{media.mediaId}</td>
                  <td className='truncate px-6 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-60'>
                    {media.mediaTitle}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-40'>
                    {media.authorName}
                  </td>
                  <td className='truncate px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap w-40'>
                    {media.publisherName}
                  </td>
                  <td className='truncate px-3 py-3'>
                    {formatISBN13(media.isbnId)}
                  </td>
                  <td className='truncate px-3 py-3'>
                    {formatDateToLocal(media.acquisitionDate)}
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
