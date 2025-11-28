import api from "./api";

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
