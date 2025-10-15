'use client';

import { useState } from 'react';
import { lusitana } from '@/app/ui/fonts';
import {
  KeyIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get('registered') === '1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SUBMIT fired'); // trying to verify
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else if (res.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('An error occurred while logging in Please try again later.');
    }
  };

  return (
    <form className='space-y-3' onSubmit={handleLogin}>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>

        {justRegistered && (
          <div className='mb-3 flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800'>
            <CheckCircleIcon className='mt-0.5 h-5 w-5' />
            <span>Your account was created. You can sign in now.</span>
          </div>
        )}

        <div className='w-full'>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='username'
            >
              Username
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='username'
                type='text'
                name='username'
                placeholder='Enter your username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete='username'
              />
              <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
          </div>
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='password'
            >
              Password
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='password'
                type='password'
                name='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete='current-password'
              />
              <KeyIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
          </div>
        </div>
        <Button className='mt-4 w-full' type='submit'>
          Log in <ArrowRightIcon className='ml-auto h-5 w-5 text-gray-50' />
        </Button>
        {error && (
          <div className='mt-4 flex items-center text-sm text-red-600'>
            <ExclamationCircleIcon className='h-5 w-5 mr-1' />
            {error}
          </div>
        )}

        {/* New: link to registration */}
        <p className='mt-4 text-center text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/register'
            className='font-medium text-gray-900 underline'
          >
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
