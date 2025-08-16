import {
  CheckIcon,
  LockClosedIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function PatronStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-green-500 text-white': status === 'ACTIVE',
          'bg-gray-100 text-gray-500': status === 'INACTIVE',
          'bg-red-100 text-gray-500': status === 'SUSPENDED',
        }
      )}
    >
      {status === 'ACTIVE' ? (
        <>
          Active
          <CheckIcon className='ml-1 w-4 text-white' />
        </>
      ) : null}
      {status === 'INACTIVE' ? (
        <>
          Inactive
          <XCircleIcon className='ml-1 w-4 text-white' />
        </>
      ) : null}
      {status === 'SUSPENDED' ? (
        <>
          Suspended
          <LockClosedIcon className='ml-1 w-4 text-white' />
        </>
      ) : null}
    </span>
  );
}
