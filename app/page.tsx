"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  Route,
  Users,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { SYMBOLS } from "@/lib/data";
import type { Booking } from "@/models/booking";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import moment from "moment-timezone";
import {
  getOperatorAnalytics,
  getLastFiveBookings,
  type ITopRoute,
} from "@/actions/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPassengers, setTotalPassengers] = useState(0);
  const [topRoute, setTopRoute] = useState<ITopRoute | undefined>();
  const [lastFiveBookings, setLastFiveBookings] = useState<Booking[]>([]);
  const [thisMonthsRevenue, setThisMonthsRevenue] = useState(0);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const load = async () => {
      const [analytics, bookings] = await Promise.all([
        getOperatorAnalytics(user._id),
        getLastFiveBookings(user._id),
      ]);

      if (analytics) {
        setTotalRevenue(analytics.revenueData[0]?.revenue ?? 0);
        setTotalPassengers(analytics.revenueData[0]?.total_passengers ?? 0);
        setTopRoute(analytics.topRoute[0]);
        setThisMonthsRevenue(analytics.this_months_revenue[0]?.revenue ?? 0);
      }
      setLoadingAnalytics(false);
      setLastFiveBookings(bookings);
      setLoadingBookings(false);
    };

    load();
  }, [user]);

  const calculateTimePassed = (booking: Booking) => {
    try {
      const d = moment.duration(
        moment.utc().diff(moment.utc(booking?.createdAt)),
      );
      return [
        d.days() > 0 ? `${d.days()}d` : "",
        d.hours() > 0 ? `${d.hours()}h` : "",
        `${d.minutes()}m ago`,
      ]
        .filter(Boolean)
        .join(" ");
    } catch {
      return "";
    }
  };

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount ?? 0);

  const initials = (name?: string) => {
    if (!name) return "?";
    const p = name.split(" ");
    return (p[0]?.charAt(0) ?? "") + (p[1]?.charAt(0) ?? "");
  };

  const statCards = [
    {
      label: "Te ardhurat totale",
      value: `${SYMBOLS.EURO}${fmt(totalRevenue)}`,
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      trendColor: "text-green-600",
      trend: "+12.5%",
      sub: "nga muaji i kaluar",
    },
    {
      label: "Ky muaj",
      value: `${SYMBOLS.EURO}${fmt(thisMonthsRevenue)}`,
      icon: DollarSign,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trendColor: "text-blue-600",
      trend: "+8.2%",
      sub: "nga muaji i kaluar",
    },
    {
      label: "Pasagjer gjithsej",
      value: totalPassengers?.toLocaleString() || "0",
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      trendColor: "text-purple-600",
      trend: "+15.3%",
      sub: "nga muaji i kaluar",
    },
    {
      label: "Rruga me e perdorur",
      value: topRoute
        ? `${topRoute.from_station} -> ${topRoute.to_station}`
        : "—",
      icon: Route,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      trendColor: "text-gray-500",
      trend: null,
      sub: topRoute ? `${topRoute.total_views} shikime kete muaj` : "",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Paneli</h1>
          <p className="text-gray-600 mt-1">Mire se u ktheve, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="border-0 shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.label}
                  </CardTitle>
                  <div
                    className={`h-8 w-8 rounded-full ${card.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <Skeleton className="h-8 w-32 mb-2" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900 truncate">
                      {card.value}
                    </div>
                  )}
                  <div className="flex items-center mt-2 gap-1">
                    {card.trend && (
                      <>
                        <TrendingUp className={`h-3 w-3 ${card.trendColor}`} />
                        <span
                          className={`text-xs font-medium ${card.trendColor}`}
                        >
                          {card.trend}
                        </span>
                      </>
                    )}
                    {card.sub && (
                      <span className="text-xs text-gray-500">{card.sub}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Transactions table */}
          <Card className="lg:col-span-4 border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Transaksionet e fundit
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Rezervimet me te fundit nga platforma juaj
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/reports/bookings"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Shiko te gjitha <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klienti
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                      Shuma
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingBookings
                    ? [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-gray-50">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="space-y-1.5">
                                <Skeleton className="h-3.5 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    : lastFiveBookings?.map((booking, i) => (
                        <TableRow
                          key={i}
                          className="border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                          onClick={() =>
                            router.push(`/reports/bookings/${booking?._id}`)
                          }
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                                  {initials(booking.passengers[0]?.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {booking.passengers[0]?.full_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.passengers[0]?.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold text-gray-900">
                              {SYMBOLS.EURO}
                              {fmt(booking?.price - booking?.service_fee)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card className="lg:col-span-3 border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Aktivitetet e fundit
              </CardTitle>
              <CardDescription className="text-gray-600">
                Rezervimet me te fundit te pasagjereve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {loadingBookings
                ? [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24 ml-auto" />
                        <Skeleton className="h-3 w-14 ml-auto" />
                      </div>
                    </div>
                  ))
                : lastFiveBookings?.map((booking) => (
                    <div
                      key={booking?._id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/reports/bookings/${booking?._id}`)
                      }
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                          {initials(booking.passengers[0]?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {booking.passengers[0]?.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculateTimePassed(booking)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-gray-900">
                          {booking?.labels?.from_city} {"->"}{" "}
                          {booking?.labels?.to_city}
                        </div>
                        <div className="text-xs text-gray-500">
                          {SYMBOLS.EURO}
                          {fmt(booking?.price - booking?.service_fee)}
                        </div>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
