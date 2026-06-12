"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Circle,
  LogOut,
  Menu,
  Settings,
  User2,
} from "lucide-react";

import { useUser } from "@/context/user";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppNavbar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allLinks = useMemo(
    () => NAV_LINKS.flatMap((group) => group.items),
    [],
  );

  const activeHref = useMemo(() => {
    return (
      allLinks
        .filter((item) => {
          if (item.href === "/") return pathname === "/";
          return pathname === item.href || pathname.startsWith(`${item.href}/`);
        })
        .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null
    );
  }, [allLinks, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ID";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-sidebar text-sidebar-foreground shadow-lg shadow-slate-950/10">
      <div className="flex min-h-[72px] w-full items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md bg-white px-2 py-1 shadow-sm"
          aria-label="Ido Tours dashboard"
        >
          <Image
            src="/logo.png"
            alt="Ido Tours"
            width={270}
            height={95}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 min-[1180px]:flex"
          aria-label="Main navigation"
        >
          {allLinks.map((item) => {
            const isActive = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white text-sidebar shadow-sm"
                    : "text-sidebar-foreground/78 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <nav
          className="hidden flex-1 items-center justify-center gap-2 lg:flex min-[1180px]:hidden"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((group) => {
            const groupIsActive = group.items.some(
              (item) => activeHref === item.href,
            );

            return (
              <DropdownMenu key={group.title}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-sidebar-foreground hover:bg-white/10 hover:text-white",
                      groupIsActive && "bg-white text-sidebar hover:bg-white",
                    )}
                  >
                    {group.title}
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {group.items.map((item) => {
                    const isActive = activeHref === item.href;

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3",
                            isActive && "bg-secondary font-medium",
                          )}
                        >
                          <item.icon className="h-4 w-4 text-primary" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          <div className="hidden items-center gap-2 text-xs text-sidebar-foreground/65 xl:flex">
            <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
            Sistemi aktiv
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 gap-2 px-2 text-sidebar-foreground hover:bg-white/10 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-sidebar">
                  {initials}
                </span>
                <span className="hidden max-w-28 flex-col items-start xl:flex">
                  <span className="w-full truncate text-sm font-medium">
                    {user?.name || "Operator"}
                  </span>
                  <span className="text-xs capitalize text-sidebar-foreground/55">
                    {user?.role || "Operator"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-65" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block truncate">
                  {user?.name || "Operator"}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Operator Console
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Cilësimet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Dilni nga llogaria
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-sidebar-foreground hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-[88vw] max-w-sm flex-col border-white/10 bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetHeader className="border-b border-white/10 px-5 pb-5 pt-6 text-left">
              <SheetTitle className="text-white">Ido Tours</SheetTitle>
              <SheetDescription className="text-sidebar-foreground/60">
                Operator Console
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((group) => (
                <div key={group.title} className="mb-5">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeHref === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-white text-sidebar shadow-sm"
                              : "text-sidebar-foreground/78 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-sidebar">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.name || "Operator"}
                  </p>
                  <p className="truncate text-xs capitalize text-sidebar-foreground/55">
                    {user?.role || "Operator"}
                  </p>
                </div>
                <User2 className="h-4 w-4 text-sidebar-foreground/45" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start text-sidebar-foreground hover:bg-white/10 hover:text-white"
                >
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Cilësimet
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="justify-start text-red-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Dilni
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
