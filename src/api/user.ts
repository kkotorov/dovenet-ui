import axios from 'axios';

const API_BASE = 'https://api.dovenet.eu/api';

export interface User {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  token: string;
}

// Register user
export const registerUser = (username: string, email: string, password: string) => {
  return axios.post(`${API_BASE}/users/register`, { username, email, password });
};

// Login user
export const loginUser = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
  const user: User = res.data;

  // Save token in localStorage
  localStorage.setItem('token', user.token);

  // Save user info in localStorage
  localStorage.setItem('user', JSON.stringify(user));

  // Set default Authorization header for future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

  return user;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

// Get current user
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if logged in
export const isLoggedIn = (): boolean => !!localStorage.getItem('token');

// Check if verified
export const isVerified = (): boolean => getCurrentUser()?.verified ?? false;
