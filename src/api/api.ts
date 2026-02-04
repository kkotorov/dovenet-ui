import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.dovenet.eu/api', // Caddy HTTPS backend
  //baseURL:'http://localhost:8080/api',
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


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired — logging out automatically");

      // Remove expired token
      localStorage.removeItem("token");

      // Notify UserContext
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "token",
          newValue: null,
        })
      );
    }
    return Promise.reject(error);
  }
);
export default api;
