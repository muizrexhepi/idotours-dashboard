import {
  LayoutDashboard,
  Bus,
  Route,
  Users,
  BarChart3,
  DollarSign,
  Settings,
  KanbanIcon,
} from "lucide-react";

export const NAV_LINKS = [
  {
    title: "Kryesore",
    items: [
      {
        title: "Paneli",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Kapaciteti",
        href: "/capacity",
        icon: KanbanIcon,
      },
      {
        title: "Agjencitë",
        href: "/agencies",
        icon: Users,
      },
    ],
  },
  {
    title: "Menaxhimi",
    items: [
      {
        title: "Raportet ditore",
        href: "/reports/sales",
        icon: DollarSign,
      },
      {
        title: "Krijo Rezervim",
        href: "/reports/bookings/new",
        icon: Route,
      },
      {
        title: "Rezervimet",
        href: "/reports/bookings",
        icon: Users,
      },
    ],
  },
  // {
  //   title: "Analitika",
  //   items: [
  //     {
  //       title: "Të Ardhurat",
  //       href: "/revenue",
  //       icon: DollarSign,
  //     },
  //     {
  //       title: "Raportet",
  //       href: "/reports/bookings",
  //       icon: BarChart3,
  //     },
  //   ],
  // },
  // {
  //   title: "Sistemi",
  //   items: [
  //     {
  //       title: "Cilësimet",
  //       href: "/settings",
  //       icon: Settings,
  //     },
  //   ],
  // },
];
export const SYMBOLS = {
  EURO: "€",
};

export const USER_LABELS = {
  OPERATOR: "operator",
};
