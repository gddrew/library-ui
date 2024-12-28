import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LIBRARY_API_URL,
  withCredentials: true,
});

// Interceptor to attach the token
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  console.log('Axios Interceptor -  Retrieved Token:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization Header Set:', config.headers.Authorization);
  } else {
    console.warn('No token found in cookies. Authorization header not set.');
  }
  return config;
});

export default apiClient;
