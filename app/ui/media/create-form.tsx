'use client';

import React, { useState } from 'react';
import { MediaField } from '@/app/services/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { addMedia } from '@/app/services/mediaService';
import { useRouter } from 'next/navigation';

export default function Form({}: { media: MediaField[] }) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState('Book');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const mediaTitle = formData.get('mediaTitle') as string;
    const authorName = formData.get('author') as string;
    const isbnId = formData.get('isbn') as string;
    const publicationYear = formData.get('publicationYear') as string;
    const mediaTypeValue = formData.get('mediaType') as string;
    const mediaFormat = formData.get('mediaFormat') as string;
    const numberPages = formData.get('numberPages') as string;
    const classificationCategory = formData.get(
      'classificationCategory'
    ) as string;
    const classificationSubCategory = formData.get(
      'classificationSubCategory'
    ) as string;
    const publisherName = formData.get('publisherName') as string;
    const acquisitionDate = formData.get('acquisitionDate') as unknown as Date;
    const disposalDisposition = formData.get('disposalDisposition') as string;
    const isSensitive = formData.get('isSensitive') ? true : false;

    try {
      await addMedia({
        mediaTitle,
        authorName,
        isbnId,
        publicationYear,
        mediaType: mediaTypeValue,
        mediaFormat,
        numberPages: parseInt(numberPages, 10),
        classificationCategory,
        classificationSubCategory,
        publisherName,
        acquisitionDate,
        disposalDisposition,
        isSensitive,
      });
      router.push('/dashboard/media');
    } catch (err) {
      console.error('Failed to create media', err);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        {/* Media Title */}
        <div className='mb-4'>
          <label
            htmlFor='mediaTitle'
            className='mb-2 block text-sm font-medium'
          >
            Media Title
          </label>
          <input
            type='text'
            id='mediaTitle'
            name='mediaTitle'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500'
            placeholder='Enter media title'
            required
          />
        </div>

        {/* Author */}
        <div className='mb-4'>
          <label htmlFor='author' className='mb-2 block text-sm font-medium'>
            Author
          </label>
          <input
            type='text'
            id='author'
            name='author'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500'
            placeholder='Enter author name'
            required
          />
        </div>

        {/* ISBN */}
        <div className='mb-4'>
          <label htmlFor='isbn' className='mb-2 block text-sm font-medium'>
            ISBN
          </label>
          <input
            type='text'
            id='isbn'
            name='isbn'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500'
            placeholder='Enter ISBN'
            required
          />
        </div>

        {/* Publication Year */}
        <div className='mb-4'>
          <label
            htmlFor='publicationYear'
            className='mb-2 block text-sm font-medium'
          >
            Publication Year
          </label>
          <input
            type='number'
            id='publicationYear'
            name='publicationYear'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500'
            placeholder='YYYY'
            required
            min='0'
            max='9999'
          />
        </div>

        {/* Media Type */}
        <div className='mb-4'>
          <label htmlFor='mediaType' className='mb-2 block text-sm font-medium'>
            Media Type
          </label>
          <select
            id='mediaType'
            name='mediaType'
            className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            defaultValue='Book'
            onChange={(e) => setMediaType(e.target.value)}
          >
            <option value='Book'>Book</option>
            <option value='Video'>Video</option>
            <option value='Audio Recording'>Audio Recording</option>
          </select>
        </div>

        {/* Media Format */}
        <div className='mb-4'>
          <label
            htmlFor='mediaFormat'
            className='mb-2 block text-sm font-medium'
          >
            Media Format
          </label>
          <select
            id='mediaFormat'
            name='mediaFormat'
            className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            defaultValue=''
            required
          >
            <option value='' disabled>
              Select a format
            </option>
            {mediaType === 'Book' && (
              <>
                <option value='hardcover'>Hardcover</option>
                <option value='softcover'>Softcover</option>
              </>
            )}
            {mediaType === 'Video' && (
              <>
                <option value='DVD'>DVD</option>
                <option value='Blue-ray'>Blue-ray</option>
                <option value='VHS'>VHS</option>
                <option value='Streaming'>Streaming</option>
              </>
            )}
            {mediaType === 'Audio Recording' && (
              <>
                <option value='CD'>CD</option>
                <option value='MP3'>MP3</option>
                <option value='Vinyl Record'>Vinyl Record</option>
                <option value='Cassette'>Cassette</option>
              </>
            )}
          </select>
        </div>

        {/* Number Pages */}
        <div className='mb-4'>
          <label
            htmlFor='numberPage'
            className='mb-2 block text-sm font-medium'
          >
            Number of Pages
          </label>
          <input
            type='number'
            id='numberPage'
            name='numberPage'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500'
            placeholder='Enter number of pages'
            required
            min='1'
            max='9999'
          />
        </div>

        {/* Classification Category */}
        <div className='mb-4'>
          <label
            htmlFor='classificationCategory'
            className='mb-2 block text-sm font-medium'
          >
            Classification Category
          </label>
          <select
            id='classificationCategory'
            name='classificationCategory'
            className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            defaultValue=''
            required
          >
            <option value='' disabled>
              Select a category
            </option>
            <option value='Fiction'>Fiction</option>
            <option value='Non-Fiction'>Non-Fiction</option>
          </select>
        </div>

        {/* Classification Sub-category */}
        <div className='mb-4'>
          <label
            htmlFor='classificationSubcategory'
            className='mb-2 block text-sm font-medium'
          >
            Classification Sub-category
          </label>
          <select
            id='classificationSubcategory'
            name='classificationSubcategory'
            className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            defaultValue=''
            required
          >
            <option value='' disabled>
              Select a sub-category
            </option>
            <option value='Architecture'>Architecture</option>
            <option value='Art/Art History'>Art/Art History</option>
            <option value='Biography'>Biography</option>
            <option value='Communications'>Communications</option>
            <option value='History'>History</option>
            <option value='Management'>Management</option>
            <option value='Self-help'>Self-help</option>
            <option value='Technical'>Technical</option>
          </select>
        </div>

        {/* Publisher Name */}
        <div className='mb-4'>
          <label
            htmlFor='publisherName'
            className='mb-2 block text-sm font-medium'
          >
            Publisher Name
          </label>
          <input
            type='text'
            id='publisherName'
            name='publisherName'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500'
            placeholder='Enter publisher name'
            required
          />
        </div>

        {/* Acquisition Date*/}
        <div className='mb-4'>
          <label
            htmlFor='acquisitionDate'
            className='mb-2 block text-sm font-medium'
          >
            Acquisition Date
          </label>
          <input
            type='date'
            id='acquisitionDate'
            name='acquisitionDate'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            required
          />
        </div>

        {/* Disposal Disposition */}
        <div className='mb-4'>
          <label
            htmlFor='disposalDisposition'
            className='mb-2 block text-sm font-medium'
          >
            Disposal Disposition
          </label>
          <select
            id='disposalDisposition'
            name='disposalDisposition'
            className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            defaultValue=''
            required
          >
            <option value='' disabled>
              Select an option
            </option>
            <option value='Art school library'>Art school library</option>
            <option value='Sell or donate'>Sell or donate</option>
          </select>
        </div>

        {/* Sensitive */}
        <div className='mb-4 flex items-center'>
          <input
            type='checkbox'
            id='sensitive'
            name='sensitive'
            className='h-4 w-4 cursor-pointer border-gray-300'
          />
          <label htmlFor='sensitive' className='ml-2 block text-sm font-medium'>
            Sensitive
          </label>
        </div>
      </div>

      <div className='mt-6 flex justify-end gap-4'>
        <Link
          href='/dashboard/media'
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
        >
          Cancel
        </Link>
        <Button type='submit'>Save</Button>
      </div>
    </form>
  );
}
