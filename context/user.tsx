"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { account } from "@/appwrite.config"; 
import { useRouter } from "next/navigation";
import { AppwriteException } from "appwrite";
import { AppwriteUser } from "@/models/user";

interface UserContextType {
  user: AppwriteUser | null;
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

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getUser = async () => {
    try {
      const currentUser = await account.get();
      if(currentUser.labels[0] !== "operator") {
        return router.push('/login')
      }
      setUser(currentUser);  
    } catch (error) {
      if (error instanceof AppwriteException) {
        setError(error.message);

        // if (error.code === 401 || error.message.includes("missing scope")) {
        //   router.push("/login");
        // }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current"); 
      setUser(null); 
      router.push("/login");
    } catch (error) {
      setError("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </UserContext.Provider>
  );
};
