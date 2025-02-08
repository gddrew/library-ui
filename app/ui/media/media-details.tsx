'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaForm } from '@/app/services/definitions';
import { updateMedia, deleteMedia } from '@/app/services/mediaService';
import Link from 'next/link';
import { Button } from '@/app/ui/button';

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
    setLocalData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div>
      <form onSubmit={handleSave} className='space-y-4'>
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

        {/* Media Title */}
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
            value={localData.isbnId}
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

        {/* Sensitive Content */}
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='sensitive'
            name='isSensitive'
            checked={localData.isSensitive}
            onChange={handleCheckboxChange}
            disabled={!isEditing}
            className='h-4 w-4 cursor-pointer border-gray-300'
          />
          <label htmlFor='sensitive' className='ml-2 text-sm font-medium'>
            Sensitive Content
          </label>
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
