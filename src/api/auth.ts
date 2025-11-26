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
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      // Token expired
      logoutUser();
      return null;
    }
    return JSON.parse(user);
  } catch (err) {
    // Invalid token
    logoutUser();
    return null;
  }
};

// Check if logged in
export const isLoggedIn = (): boolean => !!getCurrentUser();

// Check if verified
export const isVerified = (): boolean => getCurrentUser()?.verified ?? false;
