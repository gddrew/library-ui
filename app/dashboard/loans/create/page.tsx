'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Patron {
  patronId: number;
  patronName: string;
  libraryCard: number;
}

export default function CreateLoanPage() {
  const router = useRouter();
  const [searchField, setSearchField] = useState('libraryCard');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patron[]>([]);

  const handleSearch = async () => {
    let url = '';
    // Determine the endpoint based on the selected searchField
    switch (searchField) {
      case 'libraryCard':
        // Scanning a library card triggers this endpoint
        url = `/api/cards/${query}`;
        break;
      case 'patronId':
        url = `/api/patrons/${query}`;
        break;
      case 'name':
        url = `/api/patrons/patron/name/${query}`;
        break;
      case 'dob':
        url = `/api/patrons/patron/dob/${query}`;
        break;
      case 'telephone':
        url = `/api/patrons/patron/telephone/${query}`;
        break;
      case 'email':
        url = `/api/patrons/patron/email/${query}`;
        break;
      default:
        // Fallback endpoint if needed
        url = `/api/search-patrons?field=${searchField}&query=${query}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Some endpoints (like /api/cards) may return a single object,
      // so we wrap it in an array to match the UI's expectations.
      setResults(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Error fetching patrons:', error);
    }
  };

  const handleSelectPatron = (patron: Patron) => {
    // Navigate to the checkout page with the selected patron's id.
    // Adjust "patron.id" as needed if your API returns a different key.
    router.push(`/checkout?patronId=${patron.patronId}`);
  };

  return (
    <div className='p-4'>
      <h1 className='text-3xl font-bold'>Search Patron</h1>
      <div className='mt-4'>
        <label className='mr-2'>Search By:</label>
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value='libraryCard'>Library Card Number</option>
          <option value='patronId'>Patron ID</option>
          <option value='name'>Name</option>
          <option value='dob'>Date of Birth</option>
          <option value='telephone'>Telephone Number</option>
          <option value='email'>Email Address</option>
        </select>
      </div>
      <div className='mt-4'>
        <input
          type='text'
          placeholder='Enter search term'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className='border p-2'
        />
        <button onClick={handleSearch} className='ml-2 border p-2'>
          Search
        </button>
      </div>
      <div className='mt-4'>
        {results.map((patron) => (
          <div
            key={patron.patronId}
            onClick={() => handleSelectPatron(patron)}
            className='p-2 border-b cursor-pointer hover:bg-gray-100'
          >
            {patron.patronName} ({patron.libraryCard})
          </div>
        ))}
      </div>
    </div>
  );
}
