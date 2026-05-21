"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAgencyUser } from "@/context/agency-user";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Receipt,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    label: "Paneli",
    href: "/agency/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Rezervimet",
    href: "/agency/bookings",
    icon: BookOpen,
  },
  {
    label: "Rezervim i Ri",
    href: "/agency/create-booking",
    icon: PlusCircle,
  },
  {
    label: "Borxhet",
    href: "/agency/debts",
    icon: Receipt,
  },
];

export default function AgencySidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { agency, logout } = useAgencyUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show sidebar on login page
  if (pathname === "/agency/login") {
    return <>{children}</>;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-sidebar-foreground">
              {agency?.name || "Agency Portal"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {agency?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Agency info + logout */}
      <div className="space-y-3 border-t border-sidebar-border p-4">
        {agency?.financial_data && (
          <div className="space-y-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/45 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
              Financat
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-sidebar-foreground/58">Komisioni</span>
              <span className="font-semibold text-sidebar-foreground">
                {agency.financial_data.percentage}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-sidebar-foreground/58">Borxhi</span>
              <span className="font-semibold text-orange-300">
                €{(agency.financial_data.debt ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-sidebar-foreground/62 hover:bg-red-500/12 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Dil
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5 text-sidebar-foreground/70" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">
            {agency?.name || "Agency Portal"}
          </span>
        </div>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
