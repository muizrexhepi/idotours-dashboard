"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAgencyUser } from "@/context/agency-user";
import { getAgencyBookings } from "@/actions/agency-bookings";
import type { Booking } from "@/models/booking";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  Users,
  Percent,
} from "lucide-react";
import moment from "moment-timezone";

export default function AgencyDashboardPage() {
  const { agency } = useAgencyUser();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!agency?._id) return;
    setIsLoading(true);
    getAgencyBookings(agency._id, 1, 5)
      .then(setRecentBookings)
      .finally(() => setIsLoading(false));
  }, [agency?._id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n ?? 0);

  const totalSales = agency?.financial_data?.total_sales ?? 0;
  const profit = agency?.financial_data?.profit ?? 0;
  const debt = agency?.financial_data?.debt ?? 0;
  const percentage = agency?.financial_data?.percentage ?? 0;

  const statCards = [
    {
      label: "Total Shitje",
      value: `€${fmt(totalSales)}`,
      icon: ShoppingBag,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Fitimi",
      value: `€${fmt(profit)}`,
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Borxhi",
      value: `€${fmt(debt)}`,
      icon: Users,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Komisioni",
      value: `${percentage}%`,
      icon: Percent,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mirë se vini, {agency?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ketu mund te menaxhoni rezervimet dhe te shihni statistikat tuaja.
          </p>
        </div>
        <Button
          asChild
          className="bg-gray-900 text-white hover:bg-gray-800 shrink-0"
        >
          <Link href="/agency/create-booking">
            <PlusCircle className="h-4 w-4 mr-2" />
            Rezervim i Ri
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-gray-200 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-2.5 ${card.iconBg} rounded-xl shrink-0`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                    {card.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent bookings */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Rezervimet e Fundit
              </CardTitle>
              <CardDescription className="text-gray-500">
                5 rezervimet me te fundit te agjencise suaj
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/agency/bookings"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                Shiko te gjitha <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
              <ShoppingBag className="h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Nuk ka rezervime ende.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Link href="/agency/create-booking">
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Krijo Rezervimin e Pare
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-100">
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasagjeri
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linja
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Statusi
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                      Cmimi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow
                      key={booking._id}
                      className="border-gray-100 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-sm font-medium text-gray-900 py-3.5">
                        {booking.passengers?.[0]?.full_name}
                        {booking.passengers?.length > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            +{booking.passengers.length - 1}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {booking.labels?.from_city} → {booking.labels?.to_city}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {moment(booking.departure_date).format("DD MMM YYYY")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            booking.is_paid
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                          }
                        >
                          {booking.is_paid ? "Paguar" : "Pa paguar"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-gray-900">
                        €{(booking.price ?? 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
