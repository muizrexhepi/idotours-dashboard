"use client";

import { AppNavbar } from "@/components/app-navbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <AppNavbar />
      <main className="flex w-full flex-1 flex-col gap-4 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
