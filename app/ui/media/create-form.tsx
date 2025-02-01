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
    <form
      onSubmit={handleSubmit}
      className='max-w-4xl ml bg-gray-50 p-6 rounded-md'
    >
      <h2 className='text-xl font-semibold mb-4'>General Information</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
        {/* Media Title */}
        <div className='flex flex-col'>
          <label htmlFor='mediaTitle' className='text-sm font-medium mb-1'>
            Media Title
          </label>
          <input
            type='text'
            id='mediaTitle'
            name='mediaTitle'
            required
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder-gray-500'
          />
        </div>

        {/* Media Type */}
        <div className='flex flex-col'>
          <label htmlFor='mediaType' className='text-sm font-medium mb-1'>
            Media Type
          </label>
          <select
            id='mediaType'
            name='mediaType'
            defaultValue='Book'
            onChange={(e) => setMediaType(e.target.value)}
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
          >
            <option value='Book'>Book</option>
            <option value='Video'>Video</option>
            <option value='Audio Recording'>Audio Recording</option>
          </select>
        </div>

        {/* Acquisition Date */}
        <div className='flex flex-col w-full'>
          <label htmlFor='acquisitionDate' className='text-sm font-medium mb-1'>
            Date Acquired
          </label>
          <input
            type='date'
            id='acquisitionDate'
            name='acquisitionDate'
            className='peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2'
            required
          />
        </div>

        {/* Sensitive */}
        <div className='flex flex-col justify-end'>
          <label htmlFor='sensitive' className='text-sm font-medium mb-auto'>
            Sensitive Content
          </label>
          <input
            type='checkbox'
            id='sensitive'
            name='sensitive'
            className='h-4 w-4 cursor-pointer border-gray-300'
          />
        </div>
      </div>

      <h2 className='text-xl font-semibold mt-6 mb-4'>Book Information</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
        {/* Publisher Name */}
        <div className='flex flex-col'>
          <label htmlFor='publisherName' className='text-sm font-medium mb-1'>
            Publisher
          </label>
          <input
            type='text'
            id='publisherName'
            name='publisherName'
            required
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
          />
        </div>

        {/* ISBN */}
        <div className='flex flex-col'>
          <label htmlFor='isbn' className='text-sm font-medium mb-1'>
            ISBN
          </label>
          <input
            type='text'
            id='isbn'
            name='isbn'
            required
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
          />
        </div>

        {/* Author */}
        <div className='flex flex-col'>
          <label htmlFor='author' className='text-sm font-medium mb-1'>
            Author
          </label>
          <input
            type='text'
            id='author'
            name='author'
            required
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
          />
        </div>

        {/* Number of Page */}
        <div className='flex flex-col'>
          <label htmlFor='numberPages' className='text-sm font-medium mb-1'>
            Number of Pages
          </label>
          <input
            type='number'
            id='numberPages'
            name='numberPages'
            required
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
          />
        </div>

        {/* Publication Year */}
        <div className='flex flex-col'>
          <label htmlFor='publicationYear' className='text-sm font-medium mb-1'>
            Publication Year
          </label>
          <input
            type='number'
            id='publicationYear'
            name='publicationYear'
            required
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder-gray-500'
          />
        </div>

        {/* Media Format */}
        <div className='flex flex-col'>
          <label htmlFor='mediaFormat' className='text-sm font-medium mb-1'>
            Format
          </label>
          <select
            id='mediaFormat'
            name='mediaFormat'
            className='peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            required
          >
            {mediaType === 'Book' && (
              <>
                <option value='hardcover'>Hardcover</option>
                <option value='softcover'>Softcover</option>
              </>
            )}
            {mediaType === 'Video' && (
              <>
                <option value='DVD'>DVD</option>
                <option value='Streaming'>Streaming</option>
              </>
            )}
            {mediaType === 'Audio Recording' && (
              <>
                <option value='CD'>CD</option>
                <option value='MP3'>MP3</option>
              </>
            )}
          </select>
        </div>

        {/* Classification Category */}
        <div className='flex flex-col'>
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
        <div className='flex flex-col'>
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
      </div>

      {/* Buttons */}
      <div className='flex justify-end gap-4 mt-6'>
        <Link
          href='/dashboard/media'
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
        >
          Cancel
        </Link>
        <Button type='submit' className='btn btn-primary'>
          Save
        </Button>
      </div>
    </form>
  );
}
