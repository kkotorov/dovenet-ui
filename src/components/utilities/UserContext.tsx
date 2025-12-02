// src/UserContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import i18n from "../../i18n";

export type AppUser = {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  phoneNumber?: string;
  address?: string;
  emailVerified?: boolean;
};

type UserContextType = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/me");
      setUser(res.data);

      // sync i18n immediately
      if (res.data?.language && res.data.language !== i18n.language) {
        i18n.changeLanguage(res.data.language);
        localStorage.setItem("lang", res.data.language);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // mount: attempt to fetch if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }

    // keep context in sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const newToken = e.newValue;
        if (newToken) {
          // token added/updated -> fetch user
          refreshUser();
        } else {
          // token removed -> logged out
          setUser(null);
        }
      }
      if (e.key === "lang" && e.newValue) {
        i18n.changeLanguage(e.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
