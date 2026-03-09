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
import { ChevronUp, Palette, User2, Circle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
    <Sidebar collapsible="icon" className="border-r" variant="sidebar">
      <SidebarContent className="bg-background">
        {/* Logo Section */}
        <div className="flex items-center justify-center px-4 pt-6 pb-4">
          <Link href="/" className="flex items-center">
            {state === "expanded" ? (
              <Image
                src={`/logo.png`}
                alt="Gobusly Logo"
                className="h-12 w-auto"
                width={180}
                height={60}
              />
            ) : null}
          </Link>
        </div>

        {/* Status Indicator for Expanded Sidebar */}
        {state === "expanded" && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <Circle className="size-2 fill-green-500 text-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
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
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                              ? "bg-primary/10 text-primary border-r-2 border-primary"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 relative"
                          >
                            <item.icon
                              className={`size-4 flex-shrink-0 ${
                                isActive ? "text-primary" : ""
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
      <SidebarFooter className="bg-background border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={state === "collapsed" ? user?.name : undefined}
                  className="w-full hover:bg-accent"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 flex-shrink-0 relative">
                      <User2 className="size-4 text-primary" />
                      {/* Online status indicator */}
                      <div className="absolute -bottom-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-background"></div>
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
