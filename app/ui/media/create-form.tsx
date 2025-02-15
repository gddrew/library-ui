'use client';

import React, { useState } from 'react';
import { MediaField } from '@/app/services/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { addMedia } from '@/app/services/mediaService';
import { useRouter } from 'next/navigation';
import { subCategoryOptions } from '@/app/lib/subCategoryOptions';

function getTodayLocalDate() {
  const today = new Date();
  // Offset so we don’t accidentally run into UTC next/prev day issues
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split('T')[0];
}

export default function Form({}: { media: MediaField[] }) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState('Book');
  const [classificationCategory, setClassificationCategory] = useState<
    'Fiction' | 'Non-Fiction' | ''
  >('');
  const [classificationSubCategory, setClassificationSubCategory] =
    useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleClassificationCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as 'Fiction' | 'Non-Fiction' | '';
    setClassificationCategory(value);
    setClassificationSubCategory('');
  };

  function validateField(name: string, value: string) {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: 'This field is required' }));
    } else {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name]; // Remove error if field is valid
        return updatedErrors;
      });
    }
  }

  const getSubCategoryOptions = () => {
    return (
      subCategoryOptions[
        classificationCategory as keyof typeof subCategoryOptions
      ] || []
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newErrors: { [key: string]: string } = {};

    // List of required fields
    const requiredFields = [
      'mediaTitle',
      'author',
      'publicationYear',
      'mediaType',
      'mediaFormat',
      'publisherName',
      'acquisitionDate',
    ];

    if (mediaType === 'Book') {
      requiredFields.push(
        'numberPages',
        'classificationCategory',
        'classificationSubCategory'
      );
    }

    requiredFields.forEach((field) => {
      if (!formData.get(field)?.toString().trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await addMedia({
        mediaTitle: formData.get('mediaTitle') as string,
        authorName: formData.get('author') as string,
        isbnId: formData.get('isbn') as string,
        publicationYear: formData.get('publicationYear') as string,
        mediaType,
        mediaFormat: formData.get('mediaFormat') as string,
        numberPages:
          mediaType === 'Book'
            ? parseInt(formData.get('numberPages') as string, 10)
            : 0,
        classificationCategory:
          mediaType === 'Book'
            ? (formData.get('classificationCategory') as string)
            : '',
        classificationSubCategory:
          mediaType === 'Book'
            ? (formData.get('classificationSubCategory') as string)
            : '',
        publisherName: formData.get('publisherName') as string,
        acquisitionDate: formData.get('acquistionDate') as unknown as Date,
        disposalDisposition: formData.get('disposalDisposation') as string,
        isSensitive: formData.get('isSensitive') ? true : false,
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
            placeholder='Enter a Publication Title'
            required
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className={`peer w-full rounded-md border py-2 px-3 text-sm placeholder-gray-500 ${
              errors.mediaTitle ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.mediaTitle && (
            <span className='text-red-500 text-sm'>{errors.mediaTitle}</span>
          )}
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
            onChange={(e) => {
              const selectedType = e.target.value;
              setMediaType(selectedType);
              if (selectedType !== 'Book') {
                setClassificationCategory('');
                setClassificationSubCategory('');
              }
            }}
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
            defaultValue={getTodayLocalDate()}
            required
          />
        </div>

        {/* Sensitive */}
        <div className='flex flex-col justify-end'>
          <label htmlFor='isSensitive' className='text-sm font-medium mb-auto'>
            Sensitive Content
          </label>
          <input
            type='checkbox'
            id='isSensitive'
            name='isSensitive'
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
            placeholder='Enter a publisher'
            required
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className={`peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder-gray-500' ${
              errors.publisherName ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.publisherName && (
            <span className='text-red-500 text-sm'>{errors.publisherName}</span>
          )}
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
            placeholder='Enter an author'
            required
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className={`peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder-gray-500' ${
              errors.author ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.author && (
            <span className='text-red-500 text-sm'>{errors.author}</span>
          )}
        </div>

        {/* Number of Pages (Only for Books) */}
        {mediaType === 'Book' && (
          <div className='flex flex-col'>
            <label htmlFor='numberPages' className='text-sm font-medium mb-1'>
              Number of Pages
            </label>
            <input
              type='number'
              id='numberPages'
              name='numberPages'
              placeholder='Enter number of pages'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm placeholder-gray-500 ${
                errors.numberPages ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.numberPages && (
              <span className='text-red-500 text-sm'>{errors.numberPages}</span>
            )}
          </div>
        )}

        {/* Publication Year */}
        <div className='flex flex-col'>
          <label htmlFor='publicationYear' className='text-sm font-medium mb-1'>
            Publication Year
          </label>
          <input
            type='number'
            id='publicationYear'
            name='publicationYear'
            placeholder='Enter publication year'
            required
            onBlur={(e) => validateField(e.target.name, e.target.value)}
            className={`peer w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder-gray-500' ${
              errors.publicationYear ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.publicationYear && (
            <span className='text-red-500 text-sm'>
              {errors.publicationYear}
            </span>
          )}
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
                <option value='VHS'>VHS</option>
              </>
            )}
            {mediaType === 'Audio Recording' && (
              <>
                <option value='CD'>CD</option>
                <option value='MP3'>MP3</option>
                <option value='Vinyl'>Vinyl</option>
                <option value='Cassette'>Cassette</option>
              </>
            )}
          </select>
        </div>

        {/* Classification Category (Only for Books) */}
        {mediaType === 'Book' && (
          <div className='flex flex-col'>
            <label
              htmlFor='classificationCategory'
              className='text-sm font-medium mb-1'
            >
              Classification Category
            </label>
            <select
              id='classificationCategory'
              name='classificationCategory'
              value={classificationCategory}
              onChange={handleClassificationCategoryChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.classificationCategory
                  ? 'border-red-500'
                  : 'border-gray-200'
              }`}
            >
              <option value='' disabled>
                Select a category
              </option>
              <option value='Fiction'>Fiction</option>
              <option value='Non-Fiction'>Non-Fiction</option>
            </select>
            {errors.classificationCategory && (
              <span className='text-red-500 text-sm'>
                {errors.classificationCategory}
              </span>
            )}
          </div>
        )}

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
            value={classificationSubCategory}
            onChange={(e) => setClassificationSubCategory(e.target.value)}
            required={mediaType === 'Book'}
            disabled={mediaType !== 'Book'}
          >
            <option value='' disabled>
              Select a sub-category
            </option>
            {getSubCategoryOptions().map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
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
