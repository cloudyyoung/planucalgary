import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5150',
  timeout: 2000,
});

export default api;