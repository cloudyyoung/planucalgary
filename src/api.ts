import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5150',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzYzc3MWNiLWI4NjctNGVjNC1hOTYyLThiYWZlMDhkNjE5NSIsImVtYWlsIjoiY2xvdWR5LnlvdW5nQG91dGxvb2suY29tIiwiaWF0IjoxNzQwMzc5NjU5LCJleHAiOjE3NDEyNDM2NTksImlzcyI6InBsYW4tdWNhbGdhcnktYXBpIn0.VmsC4GJel-nIfIeI0SPP2s7_ntO4KXllQl2Cm1LLgSg',
  },
});

export default api;