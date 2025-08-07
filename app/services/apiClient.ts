import axios from 'axios';
import { baseUrl } from './utils';

const apiClient = axios.create({
  baseURL: baseUrl(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
