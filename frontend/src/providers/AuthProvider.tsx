import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
  isAdmin: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setLoading(false);
        return;
      }

      const userData = (await apiClient.get("/auth/me")) as UserProfile;
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // If token is invalid, clear it
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - check if user is logged in
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const signInWithGoogle = () => {
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${backendUrl}/auth/google`;
  };

  const signOut = () => {
    // Clear token from localStorage
    localStorage.removeItem("auth_token");
    setUser(null);

    // Optionally call backend logout endpoint
    apiClient.post("/auth/logout", {}).catch(() => {
      // Ignore errors on logout
    });

    // Redirect to login page
    window.location.href = "/login";
  };

  const refetchUser = async () => {
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
        isAdmin: user?.is_admin ?? false,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
