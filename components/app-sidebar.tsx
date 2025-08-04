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
import { ChevronUp, Palette, User2, LayoutDashboard } from "lucide-react";
import { account } from "@/appwrite.config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useUser } from "@/context/user";

export function AppSidebar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useUser();
  const { state } = useSidebar();

  const handleLogout = async () => {
    await account.deleteSessions();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-background">
        <div className="flex items-center justify-start px-4 pt-4">
          <Link href={"/"}>
            {state === "expanded" ? (
              <Image
                src={`/assets/icons/${
                  resolvedTheme === "light" ? "dark-logo.svg" : "dark-logo.svg"
                }`}
                alt="Logo"
                className="h-7 w-auto"
                width={180}
                height={60}
              />
            ) : (
              <Image
                src={`/assets/icons/logo-icon.svg`}
                alt="Logo"
                className="size-8 object-fill"
                width={180}
                height={180}
              />
            )}
          </Link>
        </div>
        {NAV_LINKS.map((link, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{link.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {link?.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarFooter className="bg-background">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Palette />
                      <span>Change appearance</span>
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </SidebarFooter>
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
