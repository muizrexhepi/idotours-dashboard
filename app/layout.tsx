import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cookies } from "next/headers";
import { RootLayoutClient } from "@/context/root-layout-client";
import { ConvexClientProvider } from "@/providers/convex-provider";
 
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IdoTours Dashboard - Premium Bus Operations Management",
  description:
    "Professional dashboard for bus operators to manage bookings, routes, and analytics with enterprise-grade tools.",
  keywords:
    "IdoTours, bus booking, transport management, operator dashboard, analytics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-background`}>
        {/*
          RootLayoutClient checks the current path:
          - /agency/* routes → renders children directly (no UserProvider, no DashboardLayout)
          - /login        → renders children directly (no UserProvider guard)
          - everything else → wraps in UserProvider + SidebarProvider + DashboardLayout
        */}
        <ConvexClientProvider>
          <RootLayoutClient defaultSidebarOpen={defaultOpen}>
            {children}
          </RootLayoutClient>
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
