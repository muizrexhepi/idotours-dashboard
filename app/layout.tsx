import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "../context/user";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import SupportChat from "./live-chat-support/page";
import { DashboardLayout } from "@/context/dashboard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gobusly Dashboard - Premium Bus Operations Management",
  description:
    "Professional dashboard for bus operators to manage bookings, routes, and analytics with enterprise-grade tools.",
  keywords:
    "Gobusly, bus booking, transport management, operator dashboard, analytics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false"; // Default to true on desktop

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <UserProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardLayout>{children}</DashboardLayout>
            <SupportChat />
            <Toaster />
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
