"use client";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Settings, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/data";
import { HeaderNavigationMenu } from "./navigation-menu";
import { ThemeToggle } from "./theme-toggle";
import ProfileButton from "./profile-button";

const Header = () => {
  const path = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
        {
          hidden: path == "/login",
        }
      )}
    >
      <nav className="hidden flex-col gap-6 text-lg font-medium xl:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href={"/"}
          className="flex items-center gap-2 text-lg font-semibold"
        >
          BUSLY
          <span className="sr-only">Busly</span>
        </Link>
        {/* {NAV_LINKS.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            className={cn("text-muted-foreground hover:text-foreground", {
              "text-foreground": path == link.url,
            })}
          >
            {link.title}
          </Link>
        ))} */}
        <HeaderNavigationMenu />
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 xl:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href={"/"}
              className="flex items-center gap-2 text-2xl font-semibold"
            >
              BUSLY
              <span className="sr-only">Busly</span>
            </Link>
            <div className="space-y-2">
              {NAV_LINKS.map((link) =>
                link.items?.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      {
                        "bg-muted": path.includes(item.href),
                      }
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.title}
                  </Link>
                ))
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <ThemeToggle />
        <ProfileButton />
      </div>
    </header>
  );
};

export default Header;
