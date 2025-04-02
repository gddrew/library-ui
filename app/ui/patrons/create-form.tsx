'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useRouter } from 'next/navigation';
import { usStateOptions } from '@/app/lib/state-options';
import { CreatePatronPayload } from '@/app/services/definitions';
import { createPatron } from '@/app/services/patronService';

export default function CreatePatronForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formError, setFormError] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState('');

  function validateField(fieldName: string, fieldValue: string) {
    if (!fieldValue.trim()) {
      setErrors((prev) => ({ ...prev, [fieldName]: 'This field is required' }));
    } else {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const newErrors: { [key: string]: string } = {};

    const requiredFields = [
      'patronName',
      'dateOfBirth',
      'streetAddress',
      'cityName',
      'stateName',
      'zipCode',
      'contactMethod',
    ];

    requiredFields.forEach((field) => {
      const value = formData.get(field)?.toString().trim() || '';
      if (!value) {
        newErrors[field] = 'This field is required';
      }
    });

    const telephoneHome =
      formData.get('telephoneHome')?.toString().trim() || '';
    const telephoneMobile =
      formData.get('telephoneMobile')?.toString().trim() || '';
    if (!telephoneHome && !telephoneMobile) {
      newErrors['telephoneHome'] = 'At least home or mobile phone is required';
      newErrors['telephoneMobile'] =
        'At least home or mobile phone is required';
    }

    const emailAddress = formData.get('emailAddress')?.toString().trim() || '';
    if (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      newErrors['emailAddress'] = 'Please provide a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const patronData: CreatePatronPayload = {
      patronName: formData.get('patronName') as string,
      dateOfBirth: new Date(formData.get('dateOfBirth') as string),
      streetAddress: formData.get('streetAddress') as string,
      cityName: formData.get('cityName') as string,
      stateName: formData.get('stateName') as string,
      zipCode: formData.get('zipCode') as string,
      telephoneHome,
      telephoneMobile,
      emailAddress,
      contactMethod: formData.get('contactMethod') as string,
    };

    const result = await createPatron(patronData);

    if (!result.success) {
      if (result.error.errorCode === 'PATRON_ALREADY_EXISTS') {
        setDuplicateErrorMessage(result.error.message);
        setShowDuplicateModal(true);
        return;
      }
      console.error(result.error.message);
      setFormError(result.error.message || 'Failed to create patron');
      return;
    }
    router.push('/dashboard/patrons');
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='max-w-4xl p-6 bg-gray-50 rounded-md'
      >
        <h2 className='text-xl font-semibold mb-4'>Patron Information</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
          {/* Patron Name */}
          <div className='flex flex-col'>
            <label htmlFor='patronName' className='mb-1 text-sm font-medium'>
              Patron Name
            </label>
            <input
              type='text'
              id='patronName'
              name='patronName'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.patronName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.patronName && (
              <span className='text-red-500 text-sm'>{errors.patronName}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className='flex flex-col'>
            <label htmlFor='dateOfBirth' className='mb-1 text-sm font-medium'>
              Date of Birth
            </label>
            <input
              type='date'
              id='dateOfBirth'
              name='dateOfBirth'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.dateOfBirth && (
              <span className='text-red-500 text-sm'>{errors.dateOfBirth}</span>
            )}
          </div>

          {/* Street Address */}
          <div className='flex flex-col'>
            <label htmlFor='streetAddress' className='mb-1 text-sm font-medium'>
              Street Address
            </label>
            <input
              type='text'
              id='streetAddress'
              name='streetAddress'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.streetAddress ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.streetAddress && (
              <span className='text-red-500 text-sm'>
                {errors.streetAddress}
              </span>
            )}
          </div>

          {/* City */}
          <div className='flex flex-col'>
            <label htmlFor='cityName' className='mb-1 text-sm font-medium'>
              City
            </label>
            <input
              type='text'
              id='cityName'
              name='cityName'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.cityName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.cityName && (
              <span className='text-red-500 text-sm'>{errors.cityName}</span>
            )}
          </div>

          {/* State */}
          <div className='flex flex-col'>
            <label htmlFor='stateName' className='mb-1 text-sm font-medium'>
              State
            </label>
            <select
              id='stateName'
              name='stateName'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.stateName ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value=''>Select a state</option>
              {usStateOptions.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            {errors.stateName && (
              <span className='text-red-500 text-sm'>{errors.stateName}</span>
            )}
          </div>

          {/* Zip Code */}
          <div className='flex flex-col'>
            <label htmlFor='zipCode' className='mb-1 text-sm font-medium'>
              Zip Code
            </label>
            <input
              type='text'
              id='zipCode'
              name='zipCode'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.zipCode ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.zipCode && (
              <span className='text-red-500 text-sm'>{errors.zipCode}</span>
            )}
          </div>

          {/* Telephone (Home) */}
          <div className='flex flex-col'>
            <label htmlFor='telephoneHome' className='mb-1 text-sm font-medium'>
              Telephone (Home)
            </label>
            <input
              type='text'
              id='telephoneHome'
              name='telephoneHome'
              placeholder='(555) 555-5678'
              className='peer w-full rounded-md border py-2 px-3 text-sm placeholder-gray-500 border-gray-200'
            />
            {errors.telephoneHome && (
              <span className='text-red-500 text-sm'>
                {errors.telephoneHome}
              </span>
            )}
          </div>

          {/* Telephone (Mobile) */}
          <div className='flex flex-col'>
            <label
              htmlFor='telephoneMobile'
              className='mb-1 text-sm font-medium'
            >
              Telephone (Mobile)
            </label>
            <input
              type='text'
              id='telephoneMobile'
              name='telephoneMobile'
              placeholder='(555) 555-5678'
              className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            />
            {errors.telephoneMobile && (
              <span className='text-red-500 text-sm'>
                {errors.telephoneMobile}
              </span>
            )}
          </div>

          {/* Email (Optional) */}
          <div className='flex flex-col'>
            <label htmlFor='emailAddress' className='mb-1 text-sm font-medium'>
              Email
            </label>
            <input
              type='email'
              id='emailAddress'
              name='emailAddress'
              className={`peer w-full rounded-md border py-2 px-3 text-sm placeholder-gray-500 ${
                errors.emailAddress ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.emailAddress && (
              <span className='text-red-500 text-sm'>
                {errors.emailAddress}
              </span>
            )}
          </div>

          {/* Preferred Contact Method */}
          <div className='flex flex-col'>
            <label htmlFor='contactMethod' className='mb-1 text-sm font-medium'>
              Preferred Contact Method
            </label>
            <select
              id='contactMethod'
              name='contactMethod'
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`peer w-full rounded-md border py-2 px-3 text-sm ${
                errors.contactMethod ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value=''>Select a method</option>
              <option value='home'>Home Phone</option>
              <option value='text'>Text Message</option>
              <option value='mail'>Mail</option>
              <option value='email'>Email</option>
            </select>
            {errors.contactMethod && (
              <span className='text-red-500 text-sm'>
                {errors.contactMethod}
              </span>
            )}
          </div>
        </div>

        {/* Global form error (for non-duplicate errors) */}
        {formError && <div className='mt-4 text-red-500'>{formError}</div>}

        <div className='flex justify-end gap-4 mt-6'>
          <Link
            href='/dashboard/patrons'
            className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
          >
            Cancel
          </Link>
          <Button type='submit' className='btn btn-primary'>
            Save
          </Button>
        </div>
      </form>

      {showDuplicateModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white p-6 rounded shadow-md max-w-md w-full'>
            <h3 className='text-lg font-bold mb-4'>Duplicate Patron</h3>
            <p className='mb-6'>{duplicateErrorMessage}</p>
            <div className='flex justify-end gap-4'>
              <Button
                type='button'
                onClick={() => setShowDuplicateModal(false)}
                className='btn btn-secondary'
              >
                Dismiss
              </Button>
              <Button
                type='button'
                onClick={() => router.push('/dashboard/patrons')}
                className='btn btn-primary'
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
