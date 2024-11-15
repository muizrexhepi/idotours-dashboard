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
    title: "Routes",
    icon: Package,
    description: "Manage bus lines, routes, and ticketing.",
    items: [
      {
        title: "Route capacity",
        href: "/capacity",
        description: "See routes capacity, start time and sales report.",
      },
      {
        title: "Our routes",
        href: "/lines/create",
        description: "Explore our available bus routes for convenient travel planning.",
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
    title: "Reports",
    icon: BarChart2Icon,
    description: "Analyze bookings and sales performance.",
    items: [
      {
        title: "Booking Reports",
        href: "/reports/bookings",
        description: "View detailed reports on bookings made.",
      },
      {
        title: "Debts",
        href: "/reports/sales",
        description: "See how much debt we owe you.",
      },
      {
        title: "Online Services",
        href: "/online",
        description: "Access and manage online services related to your operations.",
      },
    ],
  },
  {
    title: "Live sessions",
    icon: BarChart2Icon,
    description: "View live sessions by your employees.",
    items: [
      {
        title: "Live sessions",
        href: "/live-sessions",
        description: "View live sessions by your employees.",
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