import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5150',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4OGI1OTVhLTU1NmMtNDQ0YS1iYjExLTk4ZjY1OTg2YWJjMSIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaWF0IjoxNzcwNTY0ODEwLCJleHAiOjE3NzE0Mjg4MTAsImlzcyI6InBsYW4tdWNhbGdhcnktYXBpIn0.5J-K131SHywnwSvj0iqS8QjjpJ7n_FZPp_ayAXWk66E',
  },
});


export const queryClient = new QueryClient();

export default api;
