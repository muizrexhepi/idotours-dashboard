"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/55 bg-background/72 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-border/70" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  IdoTours Operations
                </p>
                <p className="text-xs text-muted-foreground">
                  Routes, bookings, capacity, and finance
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground shadow-sm md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live workspace
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
