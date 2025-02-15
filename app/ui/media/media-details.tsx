'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaForm } from '@/app/services/definitions';
import { updateMedia, deleteMedia } from '@/app/services/mediaService';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { subCategoryOptions } from '@/app/lib/subCategoryOptions';
import { formatBarcode, formatISBN13 } from '@/app/services/utils';

export default function MediaDetails({ media }: { media: MediaForm }) {
  const router = useRouter();

  // Controls editing state (read-only by default)
  const [isEditing, setIsEditing] = useState(false);

  // Local state for form data
  const [localData, setLocalData] = useState({ ...media });

  // Confirmation for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toggle editing on/off
  function handleEdit() {
    setIsEditing(true);
  }
  function handleCancel() {
    setIsEditing(false);
    setLocalData({ ...media }); // Revert changes
  }

  // Handle input changes
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setLocalData((prev) => {
      // Reset classification fields and numberPages if mediaType changes
      if (name === 'mediaType' && value !== 'Book') {
        return {
          ...prev,
          mediaType: value,
          classificationCategory: '',
          classificationSubCategory: '',
          numberPages: 0, // Clear number of pages
        };
      }
      return { ...prev, [name]: value };
    });
  }

  // Handle boolean checkbox changes
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalData((prev) => ({ ...prev, isSensitive: e.target.checked }));
  }

  // Save changes
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMedia(media.mediaId, localData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update media', err);
    }
  }

  // Delete flow
  function handleShowDelete() {
    setShowDeleteConfirm(true);
  }
  function handleCancelDelete() {
    setShowDeleteConfirm(false);
  }
  async function handleConfirmDelete() {
    try {
      await deleteMedia(media.mediaId);
      router.push('/dashboard/media');
    } catch (err) {
      console.error('Failed to delete media', err);
    }
  }

  const getSubCategoryOptions = () => {
    return (
      subCategoryOptions[
        localData.classificationCategory as keyof typeof subCategoryOptions
      ] || []
    );
  };

  return (
    <div>
      <form onSubmit={handleSave} className='space-y-4'>
        <h2 className='text-xl font-semibold mb-2 border-b pb-2'>
          General Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          {/* Media ID */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Media ID</label>
            <input
              name='mediaId'
              type='text'
              readOnly
              value={localData.mediaId}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm text-gray-500'
            />
          </div>

          {/* Barcode ID */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Barcode</label>
            <input
              name='barCodeId'
              type='text'
              readOnly
              value={formatBarcode(localData.barCodeId)}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm text-gray-500'
            />
          </div>

          {/* Checkout History Link */}
          <div className='mt-6'>
            <Link
              href={`/dashboard/media/${media.mediaId}/history`}
              className='inline-block px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600'
            >
              View Checkout History
            </Link>
          </div>
        </div>

        {/* Media Title */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Title</label>
            <input
              name='mediaTitle'
              type='text'
              value={localData.mediaTitle}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Media Type */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Media Type</label>
            <select
              name='mediaType'
              value={localData.mediaType}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            >
              <option value='Book'>Book</option>
              <option value='Video'>Video</option>
              <option value='Audio Recording'>Audio Recording</option>
            </select>
          </div>

          {/* Date Acquired */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Date Acquired
            </label>
            <input
              type='date'
              name='acquisitionDate'
              value={
                localData.acquisitionDate
                  ? localData.acquisitionDate instanceof Date
                    ? localData.acquisitionDate.toISOString().split('T')[0]
                    : new Date(localData.acquisitionDate)
                        .toISOString()
                        .split('T')[0]
                  : ''
              }
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Sensitive Content */}
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isSensitive'
              name='isSensitive'
              checked={Boolean(localData.isSensitive)}
              onChange={handleCheckboxChange}
              disabled={!isEditing}
              className='h-4 w-4 mb-6 cursor-pointer border-gray-300'
            />
            <label
              htmlFor='isSensitive'
              className='ml-2 mb-6 text-sm font-medium'
            >
              Sensitive Content
            </label>
          </div>
        </div>

        <h2 className='text-xl font-semibold mb-2 border-b pb-2'>
          Book Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
          {/* Publisher */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Publisher</label>
            <input
              name='publisherName'
              type='text'
              value={localData.publisherName}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* ISBN */}
          <div>
            <label className='mb-1 block text-sm font-medium'>ISBN</label>
            <input
              name='isbnId'
              type='text'
              value={
                isEditing ? localData.isbnId : formatISBN13(localData.isbnId)
              }
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Author */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Author</label>
            <input
              name='authorName'
              type='text'
              value={localData.authorName}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Number of Pages */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Number of Pages
            </label>
            <input
              name='numberPages'
              type='number'
              value={localData.numberPages}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Publication Year */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Publication Year
            </label>
            <input
              name='publicationYear'
              type='text'
              value={localData.publicationYear}
              onChange={handleChange}
              readOnly={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Format */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Format</label>
            <select
              name='mediaFormat'
              value={localData.mediaFormat}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            >
              {localData.mediaType === 'Book' && (
                <>
                  <option value='hardcover'>Hardcover</option>
                  <option value='softcover'>Softcover</option>
                </>
              )}
              {localData.mediaType === 'Video' && (
                <>
                  <option value='DVD'>DVD</option>
                  <option value='Streaming'>Streaming</option>
                </>
              )}
              {localData.mediaType === 'Audio Recording' && (
                <>
                  <option value='CD'>CD</option>
                  <option value='MP3'>MP3</option>
                </>
              )}
            </select>
          </div>

          {/* Classification Category */}
          <div>
            <label className='mb-2 block text-sm font-medium'>
              Classification Category
            </label>
            <select
              name='classificationCategory'
              value={localData.classificationCategory}
              onChange={handleChange}
              required={localData.mediaType === 'Book'}
              disabled={!isEditing || localData.mediaType !== 'Book'}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm mb-6'
            >
              <option value='' disabled>
                Select a category
              </option>
              <option value='Fiction'>Fiction</option>
              <option value='Non-Fiction'>Non-Fiction</option>
            </select>
          </div>

          {/* Classification Sub-category */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Classification Sub-category
            </label>
            <select
              name='classificationSubCategory'
              value={localData.classificationSubCategory}
              onChange={handleChange}
              required={localData.mediaType === 'Book'}
              disabled={!isEditing || localData.mediaType !== 'Book'}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm mb-6'
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

        {/* Action Buttons */}
        <div className='mt-6 flex items-center gap-4'>
          {isEditing ? (
            <>
              <button
                type='button'
                onClick={handleCancel}
                className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200'
              >
                Cancel
              </button>
              <Button type='submit'>Save</Button>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={handleEdit}
                className='flex h-10 items-center rounded-lg bg-brown-400 px-4 text-sm font-medium text-white hover:bg-brown-500'
              >
                Edit
              </button>
              <Link
                href='/dashboard/media'
                className='flex h-10 items-center rounded-lg bg-gray-100 px-4 py-1 text-gray-700 hover:bg-gray-200'
              >
                Back
              </Link>
              <button
                type='button'
                onClick={handleShowDelete}
                className='ml-auto flex h-10 items-center rounded-lg bg-red-500 px-4 py-1 text-white hover:bg-red-600'
              >
                Delete
              </button>
            </>
          )}
        </div>
      </form>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='rounded-md bg-white p-4'>
            <p className='mb-2 text-sm'>
              Are you sure you want to delete this media?
            </p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={handleConfirmDelete}
                className='rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600'
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className='rounded-md bg-gray-200 px-3 py-2 hover:bg-gray-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
