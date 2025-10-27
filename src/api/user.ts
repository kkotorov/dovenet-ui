import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const registerUser = (username: string, email: string, password: string) => {
  return axios.post(`${API_BASE}/users/register`, { username, email, password });
};

export const loginUser = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
  const token = res.data.token;
  localStorage.setItem('token', token);
  // Set default Authorization header for future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return res.data;
};

// Optional: helper to check if user is logged in
export const isLoggedIn = () => !!localStorage.getItem('token');