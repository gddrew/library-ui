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

    const mediaData = {
      mediaTitle: formData.get('mediaTitle') as string,
      authorName: formData.get('author') as string,
      isbnId: formData.get('isbn') as string,
      publicationYear: formData.get('publicationYear') as string,
      mediaType: formData.get('mediaType') as string,
      mediaFormat: formData.get('mediaFormat') as string,
      numberPages: parseInt(formData.get('numberPages') as string, 10),
      classificationCategory: formData.get('classificationCategory') as string,
      classificationSubCategory: formData.get(
        'classificationSubCategory'
      ) as string,
      publisherName: formData.get('publisherName') as string,
      acquisitionDate: formData.get('acquisitionDate') as unknown as Date,
      disposalDisposition: formData.get('disposalDisposition') as string,
      isSensitive: formData.get('isSensitive') ? true : false,
    };

    try {
      await addMedia(mediaData);
      router.push('/dashboard/media');
    } catch (err) {
      console.error('Failed to create media', err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-4xl mx-auto bg-gray-50 p-6 rounded-md'
    >
      <h2 className='text-xl font-semibold mb-4'>General Information</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Media Title */}
        <div>
          <label htmlFor='mediaTitle'>Media Title</label>
          <input
            type='text'
            id='mediaTitle'
            name='mediaTitle'
            required
            className='input'
          />
        </div>

        {/* Publication Year */}
        <div>
          <label htmlFor='publicationYear'>Year</label>
          <input
            type='number'
            id='publicationYear'
            name='publicationYear'
            required
            className='input'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
        {/* Media Type */}
        <div>
          <label htmlFor='mediaType'>Media Type</label>
          <select
            id='mediaType'
            name='mediaType'
            defaultValue='Book'
            onChange={(e) => setMediaType(e.target.value)}
            className='input'
          >
            <option value='Book'>Book</option>
            <option value='Video'>Video</option>
            <option value='Audio Recording'>Audio Recording</option>
          </select>
        </div>

        {/* Media Format */}
        <div>
          <label htmlFor='mediaFormat'>Format</label>
          <select
            id='mediaFormat'
            name='mediaFormat'
            className='input'
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
      </div>

      <h2 className='text-xl font-semibold mt-6 mb-4'>Book Information</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='publisherName'>Publisher</label>
          <input
            type='text'
            id='publisherName'
            name='publisherName'
            required
            className='input'
          />
        </div>
        <div>
          <label htmlFor='isbn'>ISBN</label>
          <input type='text' id='isbn' name='isbn' required className='input' />
        </div>
        <div>
          <label htmlFor='author'>Author</label>
          <input
            type='text'
            id='author'
            name='author'
            required
            className='input'
          />
        </div>
        <div>
          <label htmlFor='numberPages'>Pages</label>
          <input
            type='number'
            id='numberPages'
            name='numberPages'
            required
            className='input'
          />
        </div>
      </div>

      {/* Buttons */}
      <div className='flex justify-end gap-4 mt-6'>
        <Link href='/dashboard/media' className='btn btn-secondary'>
          Cancel
        </Link>
        <Button type='submit' className='btn btn-primary'>
          Save
        </Button>
      </div>
    </form>
  );
}
