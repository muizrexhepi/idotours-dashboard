"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface UserContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  console.log({ user });
  const getUser = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return router.push("/login");
      }

      // Decode the JWT to get user data
      const decoded = decodeJWT(token);

      if (!decoded || !decoded.data) {
        localStorage.removeItem("authToken");
        setLoading(false);
        return router.push("/login");
      }

      // Check if user is an operator
      if (decoded.data.role !== "operator") {
        localStorage.removeItem("authToken");
        setLoading(false);
        return router.push("/login");
      }

      setUser(decoded.data);
      setError(null);
    } catch (error: any) {
      console.error("Get user error:", error);
      setError("Failed to authenticate user.");
      localStorage.removeItem("authToken");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("authToken");
      setUser(null);
      setError(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Logout failed. Please try again.");
    }
  };

  // Listen for the userChange event (dispatched on login)
  useEffect(() => {
    const handleUserChange = () => {
      getUser();
    };

    window.addEventListener("userChange", handleUserChange);
    return () => window.removeEventListener("userChange", handleUserChange);
  }, []);

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </UserContext.Provider>
  );
};
