import { getCardsByPatronId } from '@/app/services/cardService';
import {
  capitalizeFirstLetter,
  formatBarcode,
  formatDateToLocal,
} from '@/app/services/utils';
import Link from 'next/link';
import { IssueCardButton } from '@/app/ui/cards/buttons';

export default async function PatronCards({
  params: promisedParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promisedParams;
  const patronId = Number(id);
  const cards = await getCardsByPatronId(patronId);
  const patronName = cards.length > 0 ? cards[0].patronName : 'Unknown Patron';

  return (
    <div>
      <h1 className='text-xl font-semibold mb-4'>
        Library Card Issue History for patron: {patronName}
      </h1>

      {cards.length === 0 ? (
        <>
          <p>No cards found for this patron.</p>
          <IssueCardButton patronId={patronId} />
        </>
      ) : (
        <table className='w-full border-collapse'>
          <thead>
            <tr className='border-b'>
              <th className='px-3 py-2 text-left'>Card ID</th>
              <th className='px-3 py-2 text-left'>Barcode</th>
              <th className='px-3 py-2 text-left'>Status</th>
              <th className='px-3 py-2 text-left'>Created Date</th>
              <th className='px-3 py-2 text-left'>Last Update</th>
              <th className='px-3 py-2 text-left'>Last Used</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.cardId} className='border-b hover:bg-gray-50'>
                <td className='px-3 py-2'>{card.cardId}</td>
                <td className='px-3 py-2'>{formatBarcode(card.barCodeId)}</td>
                <td className='px-3 py-2'>
                  {capitalizeFirstLetter(card.cardStatus)}
                </td>
                <td className='px-3 py-2'>
                  {formatDateToLocal(card.createdDate)}
                </td>
                <td className='px-3 py-2'>
                  {formatDateToLocal(card.lastUpdateDate)}
                </td>
                <td className='px-3 py-2'>
                  {card.lastUsedDate
                    ? formatDateToLocal(card.lastUsedDate)
                    : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className='mt-4'>
        <Link
          href={`/dashboard/patrons/${patronId}`}
          className='inline-block px-4 py-2 rounded bg-gray-200 hover:bg-gray-300'
        >
          Back to Details
        </Link>
      </div>
    </div>
  );
}
