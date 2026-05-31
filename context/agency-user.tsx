"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Agency } from "@/models/agency";
import { getAgencyById } from "@/actions/agency";

interface AgencyUserContextType {
  agency: Agency | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  setAgency: (agency: Agency) => void;
}

const AgencyUserContext = createContext<AgencyUserContextType | undefined>(
  undefined,
);

export const useAgencyUser = () => {
  const context = useContext(AgencyUserContext);
  if (context === undefined) {
    throw new Error("useAgencyUser must be used within an AgencyUserProvider");
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
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AgencyUserProvider = ({ children }: { children: ReactNode }) => {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getAgency = useCallback(async () => {
    try {
      const token = localStorage.getItem("agencyAuthToken");

      if (!token) {
        setLoading(false);
        return router.push("/agency/login");
      }

      const decoded = decodeJWT(token);

      if (!decoded || !decoded.data) {
        localStorage.removeItem("agencyAuthToken");
        setLoading(false);
        return router.push("/agency/login");
      }

      if (decoded.data.role !== "agency") {
        localStorage.removeItem("agencyAuthToken");
        setLoading(false);
        return router.push("/agency/login");
      }

      const freshAgency = decoded.data._id
        ? await getAgencyById(decoded.data._id)
        : null;

      setAgency(freshAgency ?? decoded.data);
      setError(null);
    } catch (err: any) {
      console.error("Agency auth error:", err);
      setError("Authentication failed.");
      localStorage.removeItem("agencyAuthToken");
      router.push("/agency/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("agencyAuthToken");
    setAgency(null);
    router.push("/agency/login");
  };

  useEffect(() => {
    const handleAgencyChange = () => getAgency();
    window.addEventListener("agencyUserChange", handleAgencyChange);
    return () =>
      window.removeEventListener("agencyUserChange", handleAgencyChange);
  }, [getAgency]);

  useEffect(() => {
    getAgency();
  }, [getAgency]);

  return (
    <AgencyUserContext.Provider
      value={{ agency, loading, error, logout, setAgency }}
    >
      {children}
    </AgencyUserContext.Provider>
  );
};
