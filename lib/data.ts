import {
  Home,
  Package,
  Box,
  Truck,
  QrCode,
  BookOpen,
  Users2,
  Globe,
  BarChart2Icon,
} from "lucide-react";

export const NAV_LINKS = [
  {
    title: "Linjat",
    icon: Package,
    description: "Menaxhoni linjat e autobusëve, itineraret dhe biletat.",
    items: [
      {
        title: "Te gjitha linjat",
        href: "/capacity",
        description: "Shikoni kapacitetin e rrugëve, kohën e fillimit dhe raportin e shitjeve.",
      },
      {
        title: "Linjat tona",
        href: "/lines/create",
        description: "Eksploroni linjat tona të disponueshme të autobusëve për planifikim të përshtatshëm të udhëtimit.",
      }
    ],
  },
  // {
  //   title: "Agencies",
  //   icon: Package,
  //   description: "Manage agencies/partners.",
  //   items: [
  //     {
  //       title: "Agencies",
  //       href: "/agencies/create",
  //       description: "View existing agents or create new ones with ease.",
  //     },
  //   ],
  // },
  // {
  //   title: "Documents",
  //   icon: BookOpen,
  //   description: "Manage and review necessary documents.",
  //   items: [
  //     {
  //       title: "Driver Documents",
  //       href: "/documents/driver",
  //       description: "View and upload documents required for drivers.",
  //     },
  //     {
  //       title: "Bus Documents",
  //       href: "/documents/bus",
  //       description: "Manage documents related to buses, such as licenses.",
  //     },
  //     {
  //       title: "Expired Documents",
  //       href: "/documents/expired",
  //       description: "Review and renew expired or expiring documents.",
  //     },
  //   ],
  // },
  // {
  //   title: "Employees",
  //   icon: Users2,
  //   description: "Manage your staff and their roles.",
  //   items: [
  //     {
  //       title: "Manage Employees",
  //       href: "/employees/manage",
  //       description: "View and manage employee information and roles.",
  //     },
  //     {
  //       title: "Add Employee",
  //       href: "/employees/add",
  //       description: "Add new employees to your organization.",
  //     },
  //   ],
  // },
  {
    title: "Raporte",
    icon: BarChart2Icon,
    description: "Analizoni prenotimet dhe performancën e shitjeve.",
    items: [
      {
        title: "Raportet e rezervimit",
        href: "/reports/bookings",
        description: "Shikoni raporte të detajuara për rezervimet e bëra.",
      },
      {
        title: "Borxhet",
        href: "/reports/sales",
        description: "Shihni sa borxh ju kemi.",
      },
      {
        title: "Online Services",
        href: "/online",
        description: "Access and manage online services related to your operations.",
      },
    ],
  },
  {
    title: "Seanca të drejtpërdrejta",
    icon: BarChart2Icon,
    description: "Shikoni seancat drejtpërdrejt nga punonjësit tuaj.",
    items: [
      {
        title: "Seanca të drejtpërdrejta",
        href: "/live-sessions",
        description: "Shikoni seancat drejtpërdrejt nga punonjësit tuaj.",
      },
      {
        title: "Chat support",
        href: "/live-chat-support",
        description: "Shikoni mbështetjen tuaj të bisedës live me Go Busly.",
      },
    ],
  },

];


export const SYMBOLS = {
  EURO : "€",
}


export const USER_LABELS = {
  OPERATOR: "operator",
}