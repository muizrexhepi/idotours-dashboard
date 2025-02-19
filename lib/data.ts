import {
  Package,
  BarChart2Icon,
  List,
  PlusCircle,
  Calendar,
  DollarSign,
  Globe2,
  Activity,
  MessageCircle,
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
        description:
          "Shikoni kapacitetin e rrugëve, kohën e fillimit dhe raportin e shitjeve.",
        icon: List,
      },
      {
        title: "Linjat tona",
        href: "/lines/create",
        description:
          "Eksploroni linjat tona të disponueshme të autobusëve për planifikim të përshtatshëm të udhëtimit.",
        icon: PlusCircle,
      },
    ],
  },
  {
    title: "Raporte",
    icon: BarChart2Icon,
    description: "Analizoni prenotimet dhe performancën e shitjeve.",
    items: [
      {
        title: "Raportet e rezervimit",
        href: "/reports/bookings",
        description: "Shikoni raporte të detajuara për rezervimet e bëra.",
        icon: Calendar,
      },
      {
        title: "Pagesat",
        href: "/reports/sales",
        description: "Shihni pagesat dhe borxhet.",
        icon: DollarSign,
      },
      // {
      //   title: "Online Services",
      //   href: "/online",
      //   description:
      //     "Access and manage online services related to your operations.",
      //   icon: Globe2,
      //   disabled:
      // },
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
        icon: Activity,
      },
      // {
      //   title: "Chat support",
      //   href: "/live-chat-support",
      //   description: "Shikoni mbështetjen tuaj të bisedës live me Go Busly.",
      //   icon: MessageCircle,
      // },
    ],
  },
];

export const SYMBOLS = {
  EURO: "€",
};

export const USER_LABELS = {
  OPERATOR: "operator",
};
