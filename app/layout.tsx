import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "../context/user";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Busly Dashboard - Manage Your Bus Ticket Bookings",
  description:
    "Busly Dashboard provides a comprehensive solution for managing bus ticket bookings, schedules, and customer data. Streamline your operations and offer a seamless experience for passengers.",
  keywords:
    "Busly, bus booking, bus ticket management, transport, scheduling, customer service, dashboard",
  openGraph: {
    title: "Busly Portal - Manage Your Business Efficiently",
    description:
      "Access Busly Portal to streamline business operations and improve productivity with cutting-edge tools and resources.",
    url: "https://portal.busly.eu",
    type: "website",
    images: [
      {
        url: "/assets/images/portal-og-image.png",
        width: 1200,
        height: 630,
        alt: "Busly Portal Overview",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <UserProvider>
              <AppSidebar />
              <SidebarTrigger className="m-2" />
              {children}
              <Toaster />
            </UserProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
