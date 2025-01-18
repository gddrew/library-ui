'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useRouter } from 'next/navigation';
import InputMask from 'react-input-mask';
import { usStateOptions } from '@/app/lib/state-options';

interface PatronCreateData {
  patronName: string;
  dateOfBirth: string;
  streetAddress: string;
  cityName: string;
  stateName: string;
  zipCode: string;
  telephoneHome: string;
  telephoneMobile: string;
  emailAddress?: string | null;
  contactMethod: string;
}

async function createPatron(
  patronData: PatronCreateData
): Promise<PatronCreateData> {
  const response = await fetch('/api/patrons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patronData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`${result.errorCode}: ${result.message}`);
  }
  return result;
}

const contactMethodOptions = ['home', 'text', 'mail', 'email'];

// Helper to convert mm/dd/yyyy -> yyyy-mm-dd
function formatDateOfBirth(dobString: string): string {
  // If user never typed a DOB, or typed incomplete, just return as is
  if (!dobString || !dobString.includes('/')) return dobString;

  const [month, day, year] = dobString.split('/');
  if (!year || !month || !day) return dobString;
  return `${year}-${month}-${day}`;
}

// Helper to strip out non-digits from phone input
function stripNonDigits(value: string) {
  return value.replace(/\D+/g, '');
}

export default function CreatePatronForm() {
  const router = useRouter();

  // State for each field:
  const [patronName, setPatronName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [telephoneHome, setTelephoneHome] = useState('');
  const [telephoneMobile, setTelephoneMobile] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [contactMethod, setContactMethod] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  // Basic validation checks:
  // - Required fields: patronName, dateOfBirth, streetAddress, cityName, stateName, zipCode, contactMethod
  // - At least one phone number is required: telephoneHome or telephoneMobile
  // - If email is provided, it must be valid
  const isEmailValid = emailAddress
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)
    : true;

  const isAtLeastOnePhone =
    telephoneHome.trim() !== '' || telephoneMobile.trim() !== '';

  const requiredFieldsFilled =
    patronName.trim() !== '' &&
    dateOfBirth.trim() !== '' &&
    streetAddress.trim() !== '' &&
    cityName.trim() !== '' &&
    stateName.trim() !== '' &&
    zipCode.trim() !== '' &&
    contactMethod.trim() !== '' &&
    isAtLeastOnePhone &&
    isEmailValid;

  // Submit handler:
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');

    // Transform dateOfBirth and phone formats before sending to the API
    const finalDob = formatDateOfBirth(dateOfBirth);
    const finalHomePhone = stripNonDigits(telephoneHome);
    const finalMobilePhone = stripNonDigits(telephoneMobile);

    try {
      await createPatron({
        patronName,
        dateOfBirth: finalDob,
        streetAddress,
        cityName,
        stateName,
        zipCode,
        telephoneHome: finalHomePhone,
        telephoneMobile: finalMobilePhone,
        emailAddress: emailAddress.trim() === '' ? null : emailAddress, // or just emailAddress
        contactMethod,
      });

      // On success, go to the patron table page
      router.push('/dashboard/patrons');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        // Catch the API error and display message
        setErrorMessage('Failed to create patron');
      }

      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        {/* Patron Name */}
        <div className='mb-4'>
          <label
            htmlFor='patronName'
            className='mb-2 block text-sm font-medium'
          >
            Patron Name <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <input
              id='patronName'
              name='patronName'
              type='text'
              className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
              value={patronName}
              onChange={(e) => setPatronName(e.target.value)}
              placeholder='Enter patron name'
            />
          </div>
        </div>

        {/* Date of Birth (masked as MM/DD/YYYY) */}
        <div className='mb-4'>
          <label htmlFor='dob' className='mb-2 block text-sm font-medium'>
            Date of Birth <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <InputMask
              mask='99/99/9999'
              maskChar=''
              id='dob'
              name='dateOfBirth'
              placeholder='MM/DD/YYYY'
              className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
        </div>

        {/* Street Address */}
        <div className='mb-4'>
          <label
            htmlFor='streetAddress'
            className='mb-2 block text-sm font-medium'
          >
            Street Address <span className='text-red-500'>*</span>
          </label>
          <input
            id='streetAddress'
            name='streetAddress'
            type='text'
            className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder='Enter street address'
          />
        </div>

        {/* City Name */}
        <div className='mb-4'>
          <label htmlFor='cityName' className='mb-2 block text-sm font-medium'>
            City <span className='text-red-500'>*</span>
          </label>
          <input
            id='cityName'
            name='cityName'
            type='text'
            className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder='Enter city name'
          />
        </div>

        {/* State Name (dropdown) */}
        <div className='mb-4'>
          <label htmlFor='stateName' className='mb-2 block text-sm font-medium'>
            State <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <select
              id='stateName'
              name='stateName'
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            >
              <option value=''>Select a state</option>
              {usStateOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zip Code */}
        <div className='mb-4'>
          <label htmlFor='zipCode' className='mb-2 block text-sm font-medium'>
            Zip Code <span className='text-red-500'>*</span>
          </label>
          <input
            id='zipCode'
            name='zipCode'
            type='text'
            maxLength={10}
            className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder='Enter zip/postal code'
          />
        </div>

        {/* Telephone Home (masked) */}
        <div className='mb-4'>
          <label
            htmlFor='telephoneHome'
            className='mb-2 block text-sm font-medium'
          >
            Telephone (Home)
          </label>
          <InputMask
            mask='(999) 999-9999'
            maskChar=''
            id='telephoneHome'
            name='telephoneHome'
            placeholder='(555) 555-1234'
            className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            value={telephoneHome}
            onChange={(e) => setTelephoneHome(e.target.value)}
          />
        </div>

        {/* Telephone Mobile (masked) */}
        <div className='mb-4'>
          <label
            htmlFor='telephoneMobile'
            className='mb-2 block text-sm font-medium'
          >
            Telephone (Mobile)
          </label>
          <InputMask
            mask='(999) 999-9999'
            maskChar=''
            id='telephoneMobile'
            name='telephoneMobile'
            placeholder='(555) 555-5678'
            className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            value={telephoneMobile}
            onChange={(e) => setTelephoneMobile(e.target.value)}
          />
        </div>

        {/* Email Address (optional, but validate if provided) */}
        <div className='mb-4'>
          <label
            htmlFor='emailAddress'
            className='mb-2 block text-sm font-medium'
          >
            Email Address
          </label>
          <input
            id='emailAddress'
            name='emailAddress'
            type='email'
            className='peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder='example@domain.com'
          />
          {!isEmailValid && (
            <p className='mt-1 text-sm text-red-500'>
              Please provide a valid email address.
            </p>
          )}
        </div>

        {/* Contact Method */}
        <div className='mb-4'>
          <label
            htmlFor='contactMethod'
            className='mb-2 block text-sm font-medium'
          >
            Preferred Contact Method <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <select
              id='contactMethod'
              name='contactMethod'
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500'
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
            >
              <option value=''>Select method</option>
              {contactMethodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display any server/API errors */}
        {errorMessage && (
          <div className='my-4 rounded-md bg-red-100 p-3 text-sm text-red-600'>
            {errorMessage}
          </div>
        )}
      </div>

      <div className='mt-6 flex justify-end gap-4'>
        <Link
          href='/dashboard/patrons'
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
        >
          Cancel
        </Link>
        <Button type='submit' disabled={!requiredFieldsFilled}>
          Save
        </Button>
      </div>
    </form>
  );
}
