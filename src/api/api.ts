import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://api.dovenet.eu/api', // Caddy HTTPS backend
  baseURL:'http://localhost:8080/api',
  withCredentials: true,
});

// Add interceptor to include token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
