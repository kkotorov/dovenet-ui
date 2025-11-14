import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  token: string;
}

// Register user
export const registerUser = (username: string, email: string, password: string) => {
  return api.post('/users/register', { username, email, password });
};

// Login user
export const loginUser = async (username: string, password: string): Promise<User> => {
  const res = await api.post('/auth/login', { username, password });
  const user: User = res.data;

  // Save token and user info
  localStorage.setItem('token', user.token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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
