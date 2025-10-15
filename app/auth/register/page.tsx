'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setU] = useState('');
  const [email, setE] = useState('');
  const [password, setP] = useState('');
  const [confirm, setC] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.status === 201) {
        // Option A: send them to login page
        router.push('/auth/login?registered=1');
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 409)
        setError(data?.message || 'Username or email already exists.');
      else if (res.status === 400) setError(data?.message || 'Invalid input.');
      else setError('Registration failed. Please try again.');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <form
        onSubmit={onSubmit}
        className='w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm'
      >
        <h1 className='text-xl font-semibold'>Create your account</h1>

        <div>
          <label className='block text-sm mb-1'>Username</label>
          <input
            className='w-full rounded-md border p-2'
            value={username}
            onChange={(e) => setU(e.target.value)}
            required
            minLength={3}
            maxLength={32}
          />
        </div>

        <div>
          <label className='block text-sm mb-1'>Email</label>
          <input
            className='w-full rounded-md border p-2'
            type='email'
            value={email}
            onChange={(e) => setE(e.target.value)}
            required
          />
        </div>

        <div>
          <label className='block text-sm mb-1'>Password</label>
          <input
            className='w-full rounded-md border p-2'
            type='password'
            value={password}
            onChange={(e) => setP(e.target.value)}
            required
            minLength={8}
            autoComplete='new-password'
          />
        </div>

        <div>
          <label className='block text-sm mb-1'>Confirm password</label>
          <input
            className='w-full rounded-md border p-2'
            type='password'
            value={confirm}
            onChange={(e) => setC(e.target.value)}
            required
            minLength={8}
            autoComplete='new-password'
          />
        </div>

        {error && <p className='text-sm text-red-600'>{error}</p>}

        <button
          type='submit'
          disabled={busy}
          className='w-full rounded-md border bg-black text-white py-2'
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className='text-xs text-gray-500'>
          By continuing you agree to the Terms & Privacy.
        </p>
      </form>
    </div>
  );
}
