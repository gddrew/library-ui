// Format ISBN numbers
export function formatISBN13(isbn: string | number): string {
  const isbnStr = isbn.toString().replace(/[^0-9]/g, '');

  // if (isbnStr.length !== 13) {
  //   throw new Error('Invalid ISBN-13: Must be a 13-digit number.');
  // }
  const prefix = isbnStr.substring(0, 3); // e.g., 978 or 979
  const group = isbnStr.substring(3, 4); // Assuming group is 1 digit
  const publisher = isbnStr.substring(4, 8); // Assuming publisher is 4 digits
  const title = isbnStr.substring(8, 12); // Assuming title is 4 digits
  const checkDigit = isbnStr.substring(12);

  return `${prefix}-${group}-${publisher}-${title}-${checkDigit}`;
}

// Format Barcode
export function formatBarcode(barcodeId: string | number): string {
  const barcodeStr = barcodeId.toString().replace(/[^0-9]/g, '');
  const prefix = barcodeStr.substring(0, 1);
  const library = barcodeStr.substring(1, 5);
  const sequence = barcodeStr.substring(5, 13);
  const checkDigit = barcodeStr.substring(13);

  return `${prefix}-${library}-${sequence}-${checkDigit}`;
  //39900100000014
}

// Format telephone numbers for display
export function formatTelephone(telephone: string): string {
  // Strip out non-digit characters, just in case
  const digits = telephone.replace(/\D/g, '');

  // If exactly 10 digits, format (XXX) XXX-XXXX
  if (digits.length === 10) {
    const area = digits.slice(0, 3);
    const middle = digits.slice(3, 6);
    const last = digits.slice(6);
    return `(${area}) ${middle}-${last}`;
  }

  // Otherwise, return unmodified or handle alternative lengths
  return telephone;
}

// Format patron status
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format currency in US Dollars
export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

// Format dates to US standard MM/DD/YYYY
export const formatDateToLocal = (
  dateStr: Date | string | undefined,
  locale: string = 'en-US'
): string => {
  if (!dateStr) {
    return ''; // Fallback for missing dates
  }

  // If dateStr is a string in YYYY-MM-DD with no "T", append a T
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    dateStr += 'T00:00:00'; // so "1980-04-28" becomes "1980-04-28T00:00:00"
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return 'Invalid Date'; // Fallback for invalid dates
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);

  const formattedDated = formatter.format(date);
  const [month, day, year] = formattedDated.split('/');
  return `${month}/${day}/${year}`;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (
  currentPage: number,
  totalPages: number,
  onPrefetch?: (page: number) => void
): (number | string)[] => {
  const pages: (number | string)[] = [];

  // Prefetch helper
  const prefetchPage = (page: number) => {
    if (onPrefetch && page > 0 && page <= totalPages) {
      onPrefetch(page);
    }
  };

  // If totalPages <= 7, show all pages without ellipsis
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
      prefetchPage(i);
    }
    return pages;
  }

  // If currentPage is among the first 3 pages
  if (currentPage <= 3) {
    pages.push(1, 2, 3, '...', totalPages - 1, totalPages);
    prefetchPage(4); // Prefetch next page after the last visible
    return pages;
  }

  // If currentPage is among the last 3 pages
  if (currentPage >= totalPages - 2) {
    pages.push(1, 2, '...', totalPages - 2, totalPages - 1, totalPages);
    prefetchPage(totalPages - 3); // Prefetch page before the first visible
    return pages;
  }

  // If currentPage is somewhere in the middle
  pages.push(
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages
  );
  prefetchPage(currentPage - 2); // Prefetch two pages before current
  prefetchPage(currentPage + 2); // Prefetch two pages after current
  return pages;
};
