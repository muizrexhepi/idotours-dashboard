"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  Route,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useEffect, useState } from "react";
import { API_URL } from "@/environment";
import axios from "axios";
import { SYMBOLS } from "@/lib/data";
import type { Booking } from "@/models/booking";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import moment from "moment-timezone";

export interface ITopRoute {
  total_views: number;
  from_station: string;
  to_station: string;
  _id: {
    from: string;
    to: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalPassengers, setTotalPassengers] = useState<number>(0);
  const [topRoute, setTopRoute] = useState<ITopRoute>();
  const [lastFiveBookings, setLastFiveBookings] = useState<Booking[]>([]);
  const [thisMonthsRevenue, setThisMonthsRevenue] = useState<number>(0);
  const { user } = useUser();

  const fetchAnalytics = async () => {
    try {
      const operator_id = user?._id;
      const res = await axios.get(
        `${API_URL}/operator/reports/revenue/${operator_id}`
      );
      setTotalRevenue(res?.data?.data?.revenueData[0]?.revenue);
      setTotalPassengers(res?.data?.data?.revenueData[0]?.total_passengers);
      setTopRoute(res?.data?.data?.topRoute[0]);
      setThisMonthsRevenue(res?.data?.data?.this_months_revenue[0]?.revenue);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLastFiveBookings = async () => {
    try {
      const operator_id = user?._id;
      const res = await axios.get(
        `${API_URL}/operator/reports/last-five-bookings/${operator_id}`
      );
      setLastFiveBookings(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      fetchLastFiveBookings();
    }
  }, [user]);

  const calculateTimePassed = (booking: Booking) => {
    try {
      const createdAt = moment.utc(booking?.createdAt);
      const now = moment.utc();
      const duration = moment.duration(now.diff(createdAt));
      let days = "";
      let hrs = "";
      let mins = "";
      days = duration.days() > 0 ? `${duration.days()} days` : "";
      hrs = duration.hours() > 0 ? `${duration.hours()} hours` : "";
      mins =
        duration.minutes() > 0
          ? `${duration.minutes()} minutes ago`
          : "0 minutes ago";
      const timePassed = [days, hrs, mins].filter(Boolean).join(", ");
      return timePassed;
    } catch (error) {
      console.log(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Paneli</h1>
            <p className="text-gray-600 mt-1">Mirë se u ktheve, {user?.name}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Të ardhurat totale
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {SYMBOLS.EURO}
                {formatCurrency(totalRevenue || 0)}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-medium">
                  +12.5%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  nga muaji i kaluar
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ky muaj
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {SYMBOLS.EURO}
                {formatCurrency(thisMonthsRevenue || 0)}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600 font-medium">+8.2%</span>
                <span className="text-xs text-gray-500 ml-1">
                  nga muaji i kaluar
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pasagjerë gjithsej
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {totalPassengers?.toLocaleString() || 0}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 font-medium">
                  +15.3%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  nga muaji i kaluar
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rruga më e përdorur
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                <Route className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-gray-900">
                {topRoute?.from_station} → {topRoute?.to_station}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">
                  {topRoute?.total_views} shikime këtë muaj
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Recent Transactions */}
          <Card className="lg:col-span-4 border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Transaksionet e fundit
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Rezervimet më të fundit nga platforma juaj
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/reports/bookings"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Shiko të gjitha
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
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
                    {lastFiveBookings?.map((booking, index) => (
                      <TableRow
                        key={index}
                        className="border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() =>
                          router.push(`/reports/bookings/${booking?._id}`)
                        }
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                                {booking.passengers[0].full_name?.charAt(0)}
                                {booking.passengers[0].full_name
                                  ?.split(" ")[1]
                                  ?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {booking.passengers[0].full_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking?.passengers[0]?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="font-semibold text-gray-900">
                            {SYMBOLS.EURO}
                            {formatCurrency(
                              booking?.price - booking?.service_fee
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3 border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Aktivitetet e fundit
              </CardTitle>
              <CardDescription className="text-gray-600">
                Rezervimet më të fundit të pasagjerëve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastFiveBookings?.slice(0, 5).map((booking) => (
                <div
                  key={booking?._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50/50 transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                      {booking?.passengers[0]?.full_name?.charAt(0)}
                      {booking?.passengers[0]?.full_name
                        ?.split(" ")[1]
                        ?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {booking?.passengers[0]?.full_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculateTimePassed(booking)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {booking?.labels?.from_city} → {booking?.labels?.to_city}
                    </div>
                    <div className="text-xs text-gray-500">
                      {SYMBOLS.EURO}
                      {formatCurrency(booking?.price - booking?.service_fee)}
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
