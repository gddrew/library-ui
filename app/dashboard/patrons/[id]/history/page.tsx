import { fetchCheckoutHistory, LoanRecord } from '@/app/services/patronService';
import { capitalizeFirstLetter, formatDateToLocal } from '@/app/services/utils';
import Link from 'next/link';

export default async function PatronHistoryPage({
  params: promisedParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promisedParams;
  const patronIdNum = Number(id);

  let history: LoanRecord[] = [];
  try {
    history = await fetchCheckoutHistory(patronIdNum);
  } catch (error) {
    console.error('Error fetching checkout history:', error);
    history = [];
  }

  const patronName =
    history.length > 0 ? history[0].patronName : 'Unknown Patron';

  return (
    <div>
      <h1 className='text-xl font-semibold mb-4'>
        Checkout History for patron: {patronName}
      </h1>

      {/* If you are returning data in the same shape as you shared, 
                you'll have an array of top-level objects, each with an `items` array. */}
      {history.length > 0 ? (
        <table className='w-full table-auto border-collapse'>
          <thead>
            <tr>
              <th className='border-b p-2 text-left'>Loan ID</th>
              <th className='border-b p-2 text-left'>Checkout Date</th>
              <th className='border-b p-2 text-left'>Due Date</th>
              <th className='border-b p-2 text-left'>Return Date</th>
              <th className='border-b p-2 text-left'>Item Title</th>
              <th className='border-b p-2 text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((loanRecord) =>
              loanRecord.items.map((item, itemIndex) => (
                <tr key={`${loanRecord.loanId}-${itemIndex}`}>
                  <td className='border-b p-2'>{loanRecord.loanId}</td>
                  <td className='border-b p-2'>
                    {formatDateToLocal(item.checkoutDate)}
                  </td>
                  <td className='border-b p-2'>
                    {formatDateToLocal(item.dueDate)}
                  </td>
                  <td className='border-b p-2'>
                    {formatDateToLocal(item.returnDate ?? 'Not Returned')}
                  </td>
                  <td className='border-b p-2'>
                    {item.mediaDetails?.media_title}
                  </td>
                  <td className='border-b p-2'>
                    {capitalizeFirstLetter(item.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p>No checkout history available.</p>
      )}

      <div className='mt-4'>
        {/* Option 1: Use Link to go back to Media Details (if route is /dashboard/media/:mediaId) */}
        <Link
          href={`/dashboard/patrons/${patronIdNum}`}
          className='inline-block px-4 py-2 rounded bg-gray-200 hover:bg-gray-300'
        >
          Back to Details
        </Link>
      </div>
    </div>
  );
}
