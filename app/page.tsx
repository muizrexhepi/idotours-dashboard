"use client"

import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  Route,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Booking } from "@/models/booking";
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
  const router = useRouter()
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalPassengers, setTotalPassengers] = useState<number>(0);
  const [topRoute, setTopRoute] = useState<ITopRoute>();
  const [lastFiveBookings, setLastFiveBookings] = useState<Booking[]>([]);
  const [thisMonthsRevenue, setThisMonthsRevenue] = useState<number>(0);

  const { user } = useUser();

  const fetchAnalytics = async () => {
    try {
      const operator_id = user?.$id;

      const res = await axios.get(`${API_URL}/operator/reports/revenue/${operator_id}`)
      console.log({data: res.data.data});
      setTotalRevenue(res.data.data.revenueData[0].revenue);
      setTotalPassengers(res.data.data.revenueData[0].total_passengers);
      setTopRoute(res.data.data.topRoute[0]);
      setThisMonthsRevenue(res.data.data.this_months_revenue[0].revenue);
    } catch (error) {
      console.log(error)
    }
  }

  const fetchLastFiveBookings = async () => {
    try {
      const operator_id = user?.$id;
      const res = await axios.get(`${API_URL}/operator/reports/last-five-bookings/${operator_id}`)
      console.log({bokings: res.data.data});
      setLastFiveBookings(res.data.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(user) {
      fetchAnalytics();
      fetchLastFiveBookings();
    }
  }, [user])
  
  const calculateTimePassed = (booking: Booking) => {
    try {
      console.log({cat: booking.createdAt})
      const createdAt = moment.utc(booking.createdAt);
      const now = moment.utc();
      const duration = moment.duration(now.diff(createdAt));
      console.log({createdAt:createdAt.toString(), now:now.toString(), duration:duration.toString()})

      let days = "";
      let hrs = "";
      let mins = "";
      
      days = duration.days() > 0 ? `${duration.days()} days` : "";
      hrs = duration.hours() > 0 ? `${duration.hours()} hours` : "";
      mins = duration.minutes() > 0 ? `${duration.minutes()} minutes ago` : "0 minutes ago";
      
      const timePassed = [days, hrs, mins].filter(Boolean).join(", ");
      
      return timePassed;
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <CardTitle className="text-xl font-medium text-blue-500">
              Welcome back, {user && user?.name}
          </CardTitle>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue && totalRevenue.toFixed(2)} {SYMBOLS.EURO}</div>
         
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue this month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthsRevenue && thisMonthsRevenue.toFixed(2) } {SYMBOLS.EURO}</div>
         
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total sales
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPassengers && totalPassengers}</div>
         
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most viewed route by clients</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topRoute?.from_station} - {topRoute?.to_station}</div>
           
            </CardContent>
          </Card>

      
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from Busly.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/reports/bookings">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                      <TableHead className="hidden xl:table-column">
                        Type
                      </TableHead>
                      <TableHead className="hidden xl:table-column">
                        Status
                      </TableHead>
                      <TableHead className="hidden xl:table-column">
                        Date
                      </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastFiveBookings?.map((booking, index) => (
                    <TableRow key={index} onClick={() => router.push(`/reports/bookings/${booking?._id}`)}>
                      <TableCell>
                        <div className="font-medium">{booking.passengers[0].full_name}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {booking.passengers[0].email}
                        </div>  
                      </TableCell>
                      <TableCell className="hidden xl:table-column">
                        {booking.is_paid}
                      </TableCell>
                      <TableCell className="hidden xl:table-column">
                        <Badge className="text-xs" variant={booking.is_paid === true ? "outline" : "destructive"}>
                          {booking.is_paid}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                        {new Date(booking.departure_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                      {(booking?.price - booking?.service_fee).toFixed(2)} {SYMBOLS.EURO}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
             {lastFiveBookings?.map((booking) => (
               <div key={booking?._id} className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback className="uppercase">{booking.passengers[0].full_name.charAt(0)} {booking.passengers[0].full_name.split(" ")[1].charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">
                    {calculateTimePassed(booking)}
                  </p>
                </div>
                <div className="ml-auto font-medium">{booking?.labels?.from_city} - {booking?.labels?.to_city}</div>
              </div>
            )) 
          }
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
