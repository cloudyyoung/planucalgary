import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5150',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4OGI1OTVhLTU1NmMtNDQ0YS1iYjExLTk4ZjY1OTg2YWJjMSIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaWF0IjoxNzczNDcwMTU5LCJleHAiOjE3NzQzMzQxNTksImlzcyI6InBsYW4tdWNhbGdhcnktYXBpIn0.n6fDyJw0VZgnbqTBpiTYppGpBWNtaJ1Y-PTYWDjAmd0',
  },
});


export const queryClient = new QueryClient();

export default api;
