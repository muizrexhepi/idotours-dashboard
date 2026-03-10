import type { Metadata } from "next";
import { AgencyUserProvider } from "@/context/agency-user";
import AgencySidebar from "../components/agency-sidebar";

export const metadata: Metadata = {
  title: "Agency Portal - IdoTours",
  description: "Portal per agjencite partnere te IdoTours.",
};

// This is a nested layout inside root layout — no html/body tags
export default function AgencyGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgencyUserProvider>
      <AgencySidebar>{children}</AgencySidebar>
    </AgencyUserProvider>
  );
}
