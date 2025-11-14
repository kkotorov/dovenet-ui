import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.dovenet.eu/api',
  withCredentials: true, // if using cookies
});

export default api;
