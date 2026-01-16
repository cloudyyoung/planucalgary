import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5150',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4OGI1OTVhLTU1NmMtNDQ0YS1iYjExLTk4ZjY1OTg2YWJjMSIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaWF0IjoxNzY4NTUxOTU1LCJleHAiOjE3Njk0MTU5NTUsImlzcyI6InBsYW4tdWNhbGdhcnktYXBpIn0.RqC6twD-06Rdxt5vQiHkaK2snctl_DX7NlfyNrmc-dQ',
  },
});


export const queryClient = new QueryClient();

export default api;
