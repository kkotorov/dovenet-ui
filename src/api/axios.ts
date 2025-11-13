import axios from 'axios';

const api = axios.create({
  baseURL: 'http://161.35.73.100:8080',
  withCredentials: true, // if using cookies
});

export default api;
