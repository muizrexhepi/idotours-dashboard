import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "../context/user";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies } from "next/headers";
import SupportChat from "./live-chat-support/page";

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
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <UserProvider>
            <div className="flex h-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
            <SupportChat />
            <Toaster />
          </UserProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
