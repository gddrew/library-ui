'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaForm } from '@/app/services/definitions';
import {
  updateMedia,
  deleteMedia,
  withdrawMedia,
  fetchCheckoutHistory,
} from '@/app/services/mediaService';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { subCategoryOptions } from '@/app/lib/subCategoryOptions';
import {
  DISPOSAL_OPTIONS,
  formatBarcode,
  formatISBN13,
  MEDIA_TYPE,
  toDateInputValue,
} from '@/app/services/utils';

export default function MediaDetails({ media }: { media: MediaForm }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? null;
  const backHref = React.useMemo(() => {
    // keep only the params your list page understands
    const allow = ['page', 'pageSize', 'q', 'sort', 'filter'];
    const out = new URLSearchParams();
    for (const key of allow) {
      const val = searchParams.get(key);
      if (val) out.set(key, val);
    }
    return out.toString()
      ? `/dashboard/media?${out.toString()}`
      : '/dashboard/media';
  }, [searchParams]);

  function handleBack() {
    if (from) {
      router.push(from); // go straight back to the list you came from
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref); // safe fallback
    }
  }

  // Controls editing state (read-only by default)
  const [isEditing, setIsEditing] = useState(false);

  // Local state for form data
  type LocalMedia = Omit<MediaForm, 'acquisitionDate'> & {
    acquisitionDate: string;
  };
  const [localData, setLocalData] = useState<LocalMedia>({
    ...media,
    acquisitionDate: toDateInputValue(media.acquisitionDate),
  });

  // Withdraw / delete confirmation
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Normalize null to '' for ISBN
  const isbnValue = isEditing
    ? localData.isbnId ?? ''
    : formatISBN13(localData.isbnId ?? undefined);

  // Toggle editing on/off
  function handleEdit() {
    setIsEditing(true);
  }
  function handleCancel() {
    setIsEditing(false);
    setLocalData({
      ...media,
      acquisitionDate: toDateInputValue(media.acquisitionDate),
    }); // Revert changes
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
          disposalDisposition: '', // clear for non-book types
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
      const payload = {
        ...localData,
        acquisitionDate: localData.acquisitionDate || '',
      };
      await updateMedia(media.mediaId, payload);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update media', err);
    }
  }

  // Withdraw / Delete flow
  async function handleShowWithdraw() {
    setShowWithdrawDialog(true);
    setIsCheckingHistory(true);
    setDialogError(null);

    try {
      const history = await fetchCheckoutHistory(media.mediaId);
      // If there is ANY history, we will NOT offer true delete
      setHasHistory(history.length > 0);
    } catch (err) {
      console.error('Failed to check checkout history', err);
      // Safe default: assume there *might* be history, so don't offer delete
      setDialogError(
        'Unable to check checkout history. You can still withdraw this item, but deletion is disabled.'
      );
      setHasHistory(true);
    } finally {
      setIsCheckingHistory(false);
    }
  }

  function handleCloseWithdrawDialog() {
    setShowWithdrawDialog(false);
    setDialogError(null);
    setHasHistory(null);
  }

  // Confirm withdraw
  async function handleConfirmWithdraw() {
    try {
      const updated = await withdrawMedia(media.mediaId);
      // Update local status so the UI reflects the change
      setLocalData((prev) => ({
        ...prev,
        status: updated.status ?? 'WITHDRAWN',
        disposalDisposition:
          // if server sends this back, prefer it
          (updated as any).disposalDisposition ?? prev.disposalDisposition,
      }));
      setShowWithdrawDialog(false);
    } catch (err) {
      console.error('Failed to withdraw media', err);
      setDialogError('Failed to withdraw media. Please try again.');
    }
  }

  // Confirm delete (only allowed when there is NO history)
  async function handleConfirmDelete() {
    try {
      await deleteMedia(media.mediaId);
      router.push('/dashboard/media');
    } catch (err: any) {
      console.error('Failed to delete media', err);
      // If backend says "nope", show a friendly message
      setDialogError(
        'Failed to delete media. This item may have circulation history. Try withdrawing instead.'
      );
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
        <div className='grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4'>
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

          {/* Status */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Status</label>
            <input
              name='mediaStatus'
              type='text'
              readOnly
              value={localData.status}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm text-gray-500'
            />
          </div>

          {/* Checkout History Link */}
          <div className='mt-6'>
            <Link
              href={{
                pathname: `/dashboard/media/${media.mediaId}/history`,
                query: from ? { from } : undefined,
              }}
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
              {MEDIA_TYPE.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
              value={localData.acquisitionDate || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
            />
          </div>

          {/* Disposal Disposition - only for physical media */}
          {localData.mediaType === 'Book' && (
            <div>
              <label className='mb-1 block text-sm font-medium'>
                Disposal Disposition
              </label>
              <select
                name='disposalDisposition'
                value={localData.disposalDisposition ?? ''}
                onChange={handleChange}
                disabled={!isEditing}
                className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
              >
                {DISPOSAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
        {/* === BOOK DETAILS === */}
        {localData.mediaType === 'Book' && (
          <>
            <h2 className='text-xl font-semibold mb-2 border-b pb-2'>
              Book Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
              {/* Publisher */}
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Publisher
                </label>
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
                  value={isbnValue}
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

              {/* Format (book) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>Format</label>
                <select
                  name='mediaFormat'
                  value={localData.mediaFormat}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                >
                  <option value='hardcover'>Hardcover</option>
                  <option value='softcover'>Softcover</option>
                </select>
              </div>

              {/* Classification Category */}
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Classification Category
                </label>
                <select
                  name='classificationCategory'
                  value={localData.classificationCategory || ''}
                  onChange={handleChange}
                  required
                  disabled={!isEditing}
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
                  value={localData.classificationSubCategory || ''}
                  onChange={handleChange}
                  required
                  disabled={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm mb-6'
                >
                  <option value='' disabled>
                    Select a sub-category
                  </option>
                  {getSubCategoryOptions().map(
                    (option: string, index: number) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </>
        )}

        {/* === AUDIO DETAILS === */}
        {localData.mediaType === 'Audio Recording' && (
          <>
            <h2 className='text-xl font-semibold mb-2 border-b pb-2'>
              Audio Recording Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
              {/* Label (reuses publisherName) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>Label</label>
                <input
                  name='publisherName'
                  type='text'
                  value={localData.publisherName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                />
              </div>

              {/* Primary Artist (reuses authorName) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Primary Artist
                </label>
                <input
                  name='authorName'
                  type='text'
                  value={localData.authorName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                />
              </div>

              {/* Release Year (reuses publicationYear) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Release Year
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

              {/* Format (audio) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>Format</label>
                <select
                  name='mediaFormat'
                  value={localData.mediaFormat}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                >
                  <option value='CD'>CD</option>
                  <option value='MP3'>MP3</option>
                </select>
              </div>

              {/* You can add more audio-specific fields here later:
          track count, duration, disc number, etc.
          Just follow the same pattern and wire to your MediaForm fields. */}
            </div>
          </>
        )}

        {/* === VIDEO DETAILS (optional) === */}
        {localData.mediaType === 'Video' && (
          <>
            <h2 className='text-xl font-semibold mb-2 border-b pb-2'>
              Video Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
              {/* Studio (reuses publisherName) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>Studio</label>
                <input
                  name='publisherName'
                  type='text'
                  value={localData.publisherName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                />
              </div>

              {/* Director (reuses authorName) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Director
                </label>
                <input
                  name='authorName'
                  type='text'
                  value={localData.authorName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                />
              </div>

              {/* Release Year */}
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Release Year
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

              {/* Format (video) */}
              <div>
                <label className='mb-1 block text-sm font-medium'>Format</label>
                <select
                  name='mediaFormat'
                  value={localData.mediaFormat}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='block w-full rounded-md border border-gray-200 py-2 px-3 text-sm'
                >
                  <option value='DVD'>DVD</option>
                  <option value='Streaming'>Streaming</option>
                </select>
              </div>
            </div>
          </>
        )}

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
              <button
                type='button'
                onClick={handleBack}
                className='flex h-10 items-center rounded-lg bg-gray-100 px-4 py-1 text-gray-700 hover:bg-gray-200'
              >
                Back
              </button>
              <button
                type='button'
                onClick={handleShowWithdraw}
                className='ml-auto flex h-10 items-center rounded-lg bg-red-500 px-4 py-1 text-white hover:bg-red-600'
              >
                Withdraw
              </button>
            </>
          )}
        </div>
      </form>

      {/* Withdraw / Delete Confirmation */}
      {showWithdrawDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='w-full max-w-md rounded-md bg-white p-4 shadow-lg'>
            {isCheckingHistory ? (
              <p className='text-sm'>Checking circulation history...</p>
            ) : (
              <>
                {dialogError && (
                  <p className='mb-2 text-sm text-red-600'>{dialogError}</p>
                )}

                {/* Case 1: No history → offer Withdraw OR Delete */}
                {hasHistory === false && (
                  <>
                    <p className='mb-3 text-sm'>
                      This item has <strong>no checkout history</strong>.
                      <br />
                      You can either:
                    </p>
                    <ul className='mb-3 list-disc pl-5 text-sm'>
                      <li>
                        <strong>Withdraw</strong> – recommended; the item is
                        removed from active circulation but kept for records.
                      </li>
                      <li>
                        <strong>Delete permanently</strong> – only for mistakes;
                        this cannot be undone.
                      </li>
                    </ul>
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={handleConfirmWithdraw}
                        className='rounded-md bg-amber-500 px-3 py-2 text-sm text-white hover:bg-amber-600'
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        className='rounded-md bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600'
                      >
                        Delete permanently
                      </button>
                      <button
                        onClick={handleCloseWithdrawDialog}
                        className='rounded-md bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300'
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {/* Case 2: Has history or unknown → only allow Withdraw */}
                {hasHistory !== false && (
                  <>
                    <p className='mb-3 text-sm'>
                      <strong>
                        This item has circulation history and cannot be deleted.
                      </strong>
                      <br />
                      You can withdraw the item, which keeps it in the catalog
                      for historical purposes but is no longer available for
                      checkout.
                      <br />
                      <br />
                      <strong>Withdraw this item?</strong>
                    </p>
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={handleConfirmWithdraw}
                        className='rounded-md bg-amber-500 px-3 py-2 text-sm text-white hover:bg-amber-600'
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={handleCloseWithdrawDialog}
                        className='rounded-md bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300'
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
