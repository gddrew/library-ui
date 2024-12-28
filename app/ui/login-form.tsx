'use client';

import { useState } from 'react';
import { lusitana } from '@/app/ui/fonts';
import {
  KeyIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import apiClient from '../lib/apiClient';
import Cookies from 'js-cookie';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleLogin called');
    setError('');

    try {
      console.log('Attempting login with:', { username, password });
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });

      console.log('Response received:', response);
      const token = response.data;

      if (response.status === 200 && response.data) {
        console.log('Login successful. Token received:', response.data);

        // Store the JWT token
        Cookies.set('token', token, {
          secure: false,
          sameSite: 'strict',
        });
        console.log('Token stored in cookie:', token);

        // Redirect to the dashboard or another protected route
        router.push('/dashboard');
      } else {
        console.error('Unexpected response format:', response);
        setError('Failed to log in. Please try again.');
      }
    } catch (err) {
      console.error('Login falied:', err);

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred while logging in. Please try again later.');
      }
    }
  };

  return (
    <form className='space-y-3' onSubmit={handleLogin}>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
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
                minLength={6}
              />
              <KeyIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
          </div>
        </div>
        <Button className='mt-4 w-full'>
          Log in <ArrowRightIcon className='ml-auto h-5 w-5 text-gray-50' />
        </Button>
        {error && (
          <div className='mt-4 flex items-center text-sm text-red-600'>
            <ExclamationCircleIcon className='h-5 w-5 mr-1' />
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
