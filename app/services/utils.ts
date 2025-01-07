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

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string | undefined,
  locale: string = 'en-US'
) => {
  if (!dateStr) {
    return 'N/A'; // Fallback for missing dates
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

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
