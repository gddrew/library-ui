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
    <div className='mt-6 flow-root'>
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
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left text-sm font-normal'>
              <tr>
                <th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                  Media ID
                </th>
                <th scope='col' className='px-4 py-5 font-medium sm:pl-6'>
                  Title
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Author
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  Publisher
                </th>
                <th scope='col' className='px-3 py-5 font-medium'>
                  ISBN
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
              {media?.map((media) => (
                <tr
                  key={media.mediaId}
                  className='w-full border-b py-3 text-sm last-of-type:border-none 
                  [&:first-child>td:first-child]:rounded-tl-lg 
                  [&:first-child>td:last-child]:rounded-tr-lg 
                  [&:last-child>td:first-child]:rounded-bl-lg 
                  [&:last-child>td:last-child]:rounded-br-lg'
                >
                  <td className='whitespace-nowrap px-6 py-3'>
                    {media.mediaId}
                  </td>
                  <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex items-center gap-3'>
                      <p>{media.mediaTitle}</p>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {media.authorName}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {media.publisherName}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {formatISBN13(media.isbnId)}
                  </td>
                  <td className='whitespace-nowrap px-3 py-3'>
                    {/* <MediaStatus status={media.status} /> */}
                    {formatDateToLocal(media.acquisitionDate)}
                  </td>
                  {/* <td className='whitespace-nowrap py-3 pl-6 pr-3'>
                    <div className='flex justify-end gap-3'>
                      <UpdateMedia mediaId={media.mediaId} />
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
