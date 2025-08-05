import {
  CheckIcon,
  ClockIcon,
  LockClosedIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function MediaStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-green-500 text-white': status === 'AVAILABLE',
          'bg-gray-100 text-gray-500': status === 'CHECKED_OUT',
          'bg-red-100 text-gray-500': status === 'LOST_OR_DAMAGED',
          'bg-yellow-500 text-white': status === 'OTHER',
        }
      )}
    >
      {status === 'CHECKED_OUT' ? (
        <>
          Checked Out
          <ClockIcon className='ml-1 w-4 text-gray-500' />
        </>
      ) : null}
      {status === 'AVAILABLE' ? (
        <>
          Avalailable
          <CheckIcon className='ml-1 w-4 text-white' />
        </>
      ) : null}
      {status === 'LOST_OR_DAMAGED' ? (
        <>
          Lost/Damaged
          <XCircleIcon className='ml-1 w-4 text-white' />
        </>
      ) : null}
      {status === 'AVAILABLE' ? (
        <>
          Other
          <LockClosedIcon className='ml-1 w-4 text-white' />
        </>
      ) : null}
    </span>
  );
}
