import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // change to your backend
  withCredentials: true, // if using cookies
});

export default api;
