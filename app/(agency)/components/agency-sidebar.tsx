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
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {agency?.name || "Agency Portal"}
            </p>
            <p className="text-xs text-gray-400 truncate">{agency?.email}</p>
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
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
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
      <div className="p-4 border-t border-gray-100 space-y-3">
        {agency?.financial_data && (
          <div className="px-3 py-2.5 bg-gray-50 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Financat
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Komisioni</span>
              <span className="font-semibold text-gray-900">
                {agency.financial_data.percentage}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Borxhi</span>
              <span className="font-semibold text-red-600">
                €{(agency.financial_data.debt ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
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
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-gray-200 h-screen sticky top-0">
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
          "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">
            {agency?.name || "Agency Portal"}
          </span>
        </div>

        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
