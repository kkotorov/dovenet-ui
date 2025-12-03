import api from "./api";
import type { AppUser } from "../components/utilities/UserContext";

// Register user
export const registerUser = (username: string, email: string, password: string) => {
  return api.post("/users/register", { username, email, password });
};

// Login — store token only, UserContext will fetch the profile
export const loginUser = async (
  username: string,
  password: string
): Promise<{ token: string }> => {
  const res = await api.post("/auth/login", { username, password });

  const token = res.data?.token;
  if (!token) throw new Error("No token received");

  localStorage.setItem("token", token);
  return { token };
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  // UserContext will detect removal and clear the user
  window.dispatchEvent(new StorageEvent("storage", { key: "token", newValue: null }));
};

// Check if logged in (just check token)
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("token");
};

export async function fetchCurrentUser(): Promise<AppUser> {
  const res = await api.get<AppUser>("/users/me");
  return res.data; 
}

// Trigger verification email
export async function sendVerificationEmail(): Promise<{ message?: string }> {
  const res = await api.get("/users/trigger-verify");
  return res.data;
}

// Change email
export async function updateEmail(newEmail: string, password: string): Promise<void> {
  await api.patch("/users/me/change-email", { newEmail, password });
}

// Change password
export async function updatePassword(oldPassword: string, newPassword: string): Promise<void> {
  await api.patch("/users/me/change-password", { oldPassword, newPassword });
}

// Update profile settings
export async function updateProfile(profile: Partial<AppUser>): Promise<AppUser> {
  const res = await api.patch<AppUser>("/users/me/update-settings", profile);
  return res.data;
}

export async function sendForgotPasswordEmail(email: string): Promise<{ message: string }> {
  const res = await api.post("/users/forgot-password", { email });
  return res.data; // return only the data
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.post("/users/reset-password", { token, newPassword });
  return res.data; // only return data
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await api.get(`/users/verify?token=${token}`);
  return res.data; // return only the data
}