"use client";

import { usePathname } from "next/navigation";
import { UserProvider } from "@/context/user";
import { DashboardLayout } from "@/context/dashboard";

interface Props {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: Props) {
  const pathname = usePathname();

  // Agency portal and login page bypass the operator auth wrapper entirely
  const isAgencyRoute = pathname.startsWith("/agency");
  const isLoginRoute = pathname === "/login";

  if (isAgencyRoute || isLoginRoute) {
    // Render naked — the (agency) route group layout provides its own AgencyUserProvider
    return <>{children}</>;
  }

  // All other routes go through the operator auth stack
  return (
    <UserProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </UserProvider>
  );
}
