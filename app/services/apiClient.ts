import axios from 'axios';

const isServer = typeof window === 'undefined';
const appOrigin =
  process.env.NEXT_PUBLIC_LIBRARY_APP_URL || 'http://localhost:3000';

// Use absolute URL on the server (Node), relative on the browser
const baseURL = isServer ? `${appOrigin}/backend` : '/backend';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default apiClient;
