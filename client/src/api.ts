import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5150',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2YTc5ZTY0LTM0MzUtNGIxYS04NzM2LWEwYmE4NTY5NGJiNCIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaWF0IjoxNzUxODUzODk0LCJleHAiOjE4MzgyNTM4OTQsImlzcyI6InBsYW4tdWNhbGdhcnktYXBpIn0.VjxLbikNV2s1YNyAaYJXEcECOTGPlF8qp34nVmTY1SI',
  },
});


export const queryClient = new QueryClient();

export default api;
