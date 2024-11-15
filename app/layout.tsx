import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "../context/user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Busly Dashboard - Manage Your Bus Ticket Bookings",
  description: "Busly Dashboard provides a comprehensive solution for managing bus ticket bookings, schedules, and customer data. Streamline your operations and offer a seamless experience for passengers.",
  keywords: "Busly, bus booking, bus ticket management, transport, scheduling, customer service, dashboard",
  openGraph: {
    title: "Busly Portal - Manage Your Business Efficiently",
    description: "Access Busly Portal to streamline business operations and improve productivity with cutting-edge tools and resources.",
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            <div className="flex min-h-screen w-full flex-col">
              <div className="z-[100]">
                <Header />
              </div>
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
