// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useDebouncedCallback } from 'use-debounce';
// import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// import { useSearchParams, usePathname, useRouter } from 'next/navigation';

// export default function Search({ placeholder }: { placeholder: string }) {
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const router = useRouter();

//   // Initialize input value from URL's 'query' parameter
//   const initialQuery = searchParams.get('query') || '';
//   const [inputValue, setInputValue] = useState<string>(initialQuery);

//   const debouncedUpdateURL = useDebouncedCallback((term: string) => {
//     console.log(`Searching... ${term}`);

//     const params = new URLSearchParams(searchParams);
//     params.set('page', '1');

//     if (term) {
//       params.set('query', term);
//     } else {
//       params.delete('query');
//     }

//     router.replace(`${pathname}?${params.toString()}`);
//   }, 300);

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value);
//     debouncedUpdateURL(e.target.value);
//   };

//   // Sync inputValue with URL changes (e.g., when navigating back)
//   useEffect(() => {
//     const currentQuery = searchParams.get('query') || '';
//     if (currentQuery !== inputValue) {
//       setInputValue(currentQuery);
//     }
//   }, [searchParams, inputValue]);

//   return (
//     <div className='relative flex flex-1 flex-shrink-0'>
//       <label htmlFor='search' className='sr-only'>
//         Search
//       </label>
//       <input
//         id='search'
//         type='text'
//         className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
//         placeholder={placeholder}
//         value={inputValue}
//         onChange={handleChange}
//       />
//       <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
//     </div>
//   );
// }
'use client';

import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Debounced URL updater
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Always reset to page 1 on new search
    params.set('page', '1');

    if (term) {
      // Store exactly what the user typed, spaces included
      params.set('query', term);
    } else {
      params.delete('query');
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className='relative flex flex-1 flex-shrink-0'>
      <label htmlFor='search' className='sr-only'>
        Search
      </label>
      <input
        id='search'
        type='text'
        className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
        placeholder={placeholder}
        // Use defaultValue so the browser manages the text,
        // we just listen and push to the URL.
        defaultValue={searchParams.get('query') || ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
    </div>
  );
}
