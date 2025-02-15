import {
  fetchCheckoutHistory,
  HistoryRecord,
  LoanItem,
} from '@/app/services/mediaService';
import { capitalizeFirstLetter, formatDateToLocal } from '@/app/services/utils';
import Link from 'next/link';

interface Props {
  params: {
    id: string;
  };
}

export default async function MediaHistoryPage({ params }: Props) {
  const mediaIdNum = Number(params.id);

  let history: HistoryRecord[] = [];
  try {
    history = await fetchCheckoutHistory(mediaIdNum);
  } catch (error) {
    console.error('Error fetching checkout history:', error);
    history = [];
  }

  return (
    <div>
      <h1 className='text-xl font-semibold mb-4'>Checkout History</h1>

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
              <th className='border-b p-2 text-left'>Borrower</th>
              <th className='border-b p-2 text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record: HistoryRecord, recordIndex: number) =>
              record.items.map((loan: LoanItem, loanIndex: number) => (
                <tr key={`${recordIndex}-${loanIndex}`}>
                  <td className='border-b p-2'>{loan.loanId}</td>
                  <td className='border-b p-2'>
                    {formatDateToLocal(loan.checkoutDate)}
                  </td>
                  <td className='border-b p-2'>
                    {formatDateToLocal(loan.dueDate)}
                  </td>
                  <td className='border-b p-2'>
                    {formatDateToLocal(
                      loan.returnDate ? loan.returnDate : 'Not Returned'
                    )}
                  </td>
                  <td className='border-b p-2'>{loan.patronName}</td>
                  <td className='border-b p-2'>
                    {capitalizeFirstLetter(loan.status)}
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
          href={`/dashboard/media/${mediaIdNum}`}
          className='inline-block px-4 py-2 rounded bg-gray-200 hover:bg-gray-300'
        >
          Back to Details
        </Link>
      </div>
    </div>
  );
}
