"use client";

import { usePathname } from "next/navigation";
import { UserProvider } from "@/context/user";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/context/dashboard";
import SupportChat from "@/app/live-chat-support/page";

interface Props {
  children: React.ReactNode;
  defaultSidebarOpen: boolean;
}

export function RootLayoutClient({ children, defaultSidebarOpen }: Props) {
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
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <DashboardLayout>{children}</DashboardLayout>
        {/* <SupportChat /> */}
      </SidebarProvider>
    </UserProvider>
  );
}
