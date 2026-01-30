// src/UserContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import i18n from "../../i18n";
import { fetchCurrentUser } from "../../api/auth";
import api from "../../api/api";

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
  subscription?: string;
  subscriptionValidUntil?: string;
  subscriptionActive?: boolean;
  autoRenew?: boolean;
};

type UserContextType = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  isSubscriptionActive: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isSubscriptionActive = React.useMemo(() => {
    if (!user) return false;
    if (typeof user.subscriptionActive === "boolean") return user.subscriptionActive;
    if (user.subscription && user.subscription !== 'free') return true;
    if (user.subscriptionValidUntil) {
      const validUntil = new Date(user.subscriptionValidUntil);
      return validUntil > new Date();
    }
    return false;
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);

      const userData = await fetchCurrentUser();

      try {
        // Fetch subscription status from the new endpoint
        const { data: subData } = await api.get("/users/me/subscription-status");
        userData.subscriptionActive = subData.active;
        userData.subscription = subData.type;
        userData.subscriptionValidUntil =
          subData.validUntil && subData.validUntil !== "null"
            ? subData.validUntil
            : undefined;
        userData.autoRenew = subData.autoRenew;
      } catch (err) {
        console.error("Failed to fetch subscription status", err);
        // If fetching subscription fails, treat user as having no active subscription
        userData.subscriptionActive = false;
        userData.subscription = undefined;
        userData.subscriptionValidUntil = undefined;
        userData.autoRenew = false;
      }

      setUser(userData);

      // Sync language preferences
      if (userData?.language && userData.language !== i18n.language) {
        i18n.changeLanguage(userData.language);
        localStorage.setItem("lang", userData.language);
      }
    } catch (err) {
      // Token invalid or expired → user is logged out
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }

    // Synchronize auth + language across browser tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          // Login on another tab
          refreshUser();
        } else {
          // Logout on another tab
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
    <UserContext.Provider value={{ user, setUser, loading, refreshUser, isSubscriptionActive }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
