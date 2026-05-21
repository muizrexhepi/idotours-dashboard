"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { NAV_LINKS } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronUp, User2, Circle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

export function AppSidebar() {
  const { user, logout } = useUser();
  const { state } = useSidebar();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  // Mock notifications count (replace with real data)
  const notificationCount = 3;
  const urgentMessages = 1;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
      variant="sidebar"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="flex items-center justify-center px-4 pb-4 pt-6">
          <Link href="/" className="flex items-center gap-3">
            {state === "expanded" ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground shadow-sm">
                  ID
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    IdoTours
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/55">
                    Operator Console
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                ID
              </div>
            )}
          </Link>
        </div>

        {/* Status Indicator for Expanded Sidebar */}
        {state === "expanded" && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3">
              <Circle className="size-2 fill-emerald-400 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-100">
                Sistemi Aktiv
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto">
          {NAV_LINKS.map((link, index) => (
            <SidebarGroup key={index}>
              {state === "expanded" && (
                <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/42">
                  {link.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {link?.items.map((item) => {
                    const isActive = pathname === item.href;
                    const hasNotification =
                      item.href === "/njoftimet" && notificationCount > 0;
                    const hasUrgent =
                      item.href === "/mesazhet" && urgentMessages > 0;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={
                            state === "collapsed" ? item.title : undefined
                          }
                          className={`w-full transition-colors ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                              : "text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 relative"
                          >
                            <item.icon
                              className={`size-4 flex-shrink-0 ${
                                isActive ? "text-sidebar-primary-foreground" : ""
                              }`}
                            />
                            {state === "expanded" && (
                              <span className="truncate">{item.title}</span>
                            )}

                            {/* Notification badges */}
                            {hasNotification && (
                              <Badge
                                variant="destructive"
                                className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                              >
                                {notificationCount}
                              </Badge>
                            )}
                            {hasUrgent && (
                              <div className="ml-auto">
                                <Circle className="size-2 fill-red-500 text-red-500 animate-pulse" />
                              </div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      {/* User Menu Footer */}
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={state === "collapsed" ? user?.name : undefined}
                  className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
                      <User2 className="size-4 text-sidebar-foreground" />
                      {/* Online status indicator */}
                      <div className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-sidebar bg-emerald-400"></div>
                    </div>
                    {state === "expanded" && user && (
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="text-sm font-medium truncate w-full">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {user.role || "Operator"}
                        </span>
                      </div>
                    )}
                    {state === "expanded" && (
                      <ChevronUp className="ml-auto size-4 flex-shrink-0" />
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={state === "collapsed" ? "right" : "top"}
                align="start"
                className="w-56"
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    <span>Cilësimet</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <span>Dilni nga Llogaria</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
