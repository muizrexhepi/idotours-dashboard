"use client";
import { useEffect, useState } from "react";
import React from "react";

import axios, { type AxiosResponse } from "axios";
import { CalendarIcon } from "lucide-react";
import { API_URL } from "@/environment";
import type { Ticket } from "@/models/ticket";
import type { Booking } from "@/models/booking";
import type { Route } from "@/models/route";
import { useRouter } from "next/navigation";
import { deactivateTicket, reactivateTicket } from "@/actions/ticket";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/context/user";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

interface IData {
  ticket: Ticket;
  bookings: Booking[];
}

const BusSchedule = () => {
  const router = useRouter();
  const [routes, setRoutes] = useState<IData[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [updatedSeats, setUpdatedSeats] = useState<{ [key: string]: number }>(
    {}
  );
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
  const [lines, setLines] = useState<Route[]>([]);
  const { user } = useUser();
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingLines, setLoadingLines] = useState(true);

  const fetchLines = async () => {
    setLoadingLines(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/route/operator/${user?.$id}`
      );
      const lineIds = response.data.data
        .map((route: Route) => route._id)
        .join("-");
      setLines(response.data.data);
      setSelectedLine(lineIds);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingLines(false);
    }
  };

  const fetchCapacityRoutes = async () => {
    if (!date?.from || !date?.to) return;
    setLoadingSchedule(true);
    try {
      const operator_id = user?.$id;
      const response: AxiosResponse = await axios.get(
        `${API_URL}/ticket/capacity-routes?startDate=${date.from.toISOString()}&endDate=${date.to.toISOString()}&line=${selectedLine}&operator_id=${operator_id}`
      );
      setRoutes(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLines();
    }
  }, [user]);

  useEffect(() => {
    if (selectedLine && user && date?.from && date?.to) {
      fetchCapacityRoutes();
    }
  }, [selectedLine, date, user]);

  const handleRouteClick = (id: number) => {
    setExpandedRoute(expandedRoute === id ? null : id);
  };

  const handleLineChange = (value: string) => {
    if (value === "all") {
      const allLineIds = lines.map((route: Route) => route._id).join("-");
      setSelectedLine(allLineIds);
    } else {
      setSelectedLine(value);
    }
  };

  const performStateChange = async (
    currentActivationState: boolean,
    ticketId: string
  ) => {
    const updatedRoutes = routes.map((route) => {
      if (route.ticket._id === ticketId) {
        return {
          ...route,
          ticket: {
            ...route.ticket,
            is_active: !currentActivationState,
          },
        };
      }
      return route;
    });
    setRoutes(updatedRoutes);
    try {
      if (currentActivationState) {
        await deactivateTicket(ticketId);
      } else {
        await reactivateTicket(ticketId);
      }
    } catch (error) {
      console.error("Error changing ticket state:", error);
      setRoutes(routes); // Revert on error
    }
  };

  const handleUpdateSeats = async (ticketId: string) => {
    const newSeats = updatedSeats[ticketId];
    try {
      await axios.post(
        `${API_URL}/ticket/update/seats/${ticketId}?seats=${newSeats}`,
        {
          number_of_tickets: newSeats,
        }
      );
      setRoutes((prevRoutes) =>
        prevRoutes.map((route) =>
          route.ticket._id === ticketId
            ? {
                ...route,
                ticket: { ...route.ticket, number_of_tickets: newSeats },
              }
            : route
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeatChange = (ticketId: string, value: number) => {
    setUpdatedSeats((prev) => ({ ...prev, [ticketId]: value }));
  };

  const handleDeleteRoute = async () => {
    if (deleteRouteId) {
      try {
        await axios.post(`${API_URL}/ticket/delete/${deleteRouteId}`);
        setRoutes(routes.filter((route) => route.ticket._id !== deleteRouteId));
        setDeleteRouteId(null);
      } catch (error) {
        console.error("Error deleting route:", error);
      }
    }
  };

  const setDateRange = (range: string) => {
    let start, end;
    switch (range) {
      case "today":
        start = moment.utc().startOf("day");
        end = moment.utc().endOf("day");
        break;
      case "yesterday":
        start = moment.utc().subtract(1, "day").startOf("day");
        end = moment.utc().subtract(1, "day").endOf("day");
        break;
      case "thisWeek":
        start = moment.utc().startOf("isoWeek");
        end = moment.utc().endOf("isoWeek");
        break;
      case "lastWeek":
        start = moment.utc().subtract(1, "week").startOf("isoWeek");
        end = moment.utc().subtract(1, "week").endOf("isoWeek");
        break;
      case "thisMonth":
        start = moment.utc().startOf("month");
        end = moment.utc().endOf("month");
        break;
      case "lastMonth":
        start = moment.utc().subtract(1, "month").startOf("month");
        end = moment.utc().subtract(1, "month").endOf("month");
        break;
      default:
        start = moment().startOf("day");
        end = moment().endOf("day");
    }
    setDate({ from: start.toDate(), to: end.toDate() });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Lines Capacity
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage your routes and capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "today",
                  "yesterday",
                  "thisWeek",
                  "lastWeek",
                  "thisMonth",
                  "lastMonth",
                ].map((range) => (
                  <Button
                    key={range}
                    onClick={() => setDateRange(range)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal border-gray-300 text-gray-700 hover:bg-gray-50",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-white shadow-lg rounded-lg"
                    align="start"
                  >
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Select onValueChange={handleLineChange} value={selectedLine}>
                  <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 hover:bg-gray-50">
                    <SelectValue placeholder="All lines" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg rounded-lg">
                    <SelectItem value="all">All lines</SelectItem>
                    {lines?.map((route: Route) => (
                      <SelectItem key={route._id} value={route._id!}>
                        {route.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Routes
            </CardTitle>
            <CardDescription className="text-gray-600">
              Overview of your bus routes and their capacity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200">
                    <TableHead className="w-[50px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Line
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From / To
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales / Passengers
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSchedule ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <React.Fragment key={i}>
                        <TableRow className="border-gray-100">
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : routes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No routes found for the selected period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes?.map((route: IData, idx: number) => (
                      <React.Fragment key={route.ticket._id}>
                        <TableRow
                          className="border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors"
                          onClick={() => handleRouteClick(idx)}
                        >
                          <TableCell className="py-4 text-sm text-gray-700">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`${
                                route.ticket.is_active
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              } text-xs font-medium px-2 py-1 rounded-full border ${
                                route.ticket.is_active
                                  ? "border-green-200"
                                  : "border-red-200"
                              }`}
                            >
                              {route.ticket.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900">
                            {route.ticket.route_number.code}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {moment
                              .utc(route.ticket.departure_date)
                              .format("DD-MM-YYYY")}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {route.ticket.destination.from} →{" "}
                            {route.ticket.destination.to}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {route.ticket.number_of_tickets}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {route.bookings.length} /{" "}
                            {route.bookings.reduce(
                              (totalPassengers, booking) =>
                                totalPassengers +
                                (booking?.passengers?.length || 0),
                              0
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {moment
                              .utc(route.ticket.departure_date)
                              .format("HH:mm")}
                          </TableCell>
                        </TableRow>
                        {expandedRoute === idx && (
                          <TableRow className="bg-gray-50 border-gray-100">
                            <TableCell colSpan={8} className="py-4 px-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-3">
                                  <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                                    onClick={() =>
                                      console.log("View sales report")
                                    }
                                  >
                                    Sales Report
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className={`${
                                      route.ticket.is_active
                                        ? "border-red-300 text-red-700 hover:bg-red-50"
                                        : "border-green-300 text-green-700 hover:bg-green-50"
                                    }`}
                                    onClick={() =>
                                      performStateChange(
                                        route.ticket.is_active,
                                        route.ticket._id
                                      )
                                    }
                                  >
                                    {route.ticket.is_active
                                      ? "Deactivate Ticket"
                                      : "Activate Ticket"}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                                        onClick={() =>
                                          setDeleteRouteId(route.ticket._id)
                                        }
                                      >
                                        Delete Route
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                                          Are you sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600">
                                          This action cannot be undone. This
                                          will permanently delete this route and
                                          remove its data from our servers.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={handleDeleteRoute}
                                          className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                  <span className="font-medium text-gray-900 text-sm">
                                    Route: {route.ticket.destination.from} →{" "}
                                    {route.ticket.destination.to}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Label
                                      htmlFor={`seats-${route.ticket._id}`}
                                      className="text-sm text-gray-700"
                                    >
                                      Seats:
                                    </Label>
                                    <Input
                                      id={`seats-${route.ticket._id}`}
                                      className="w-24 border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                                      type="number"
                                      value={
                                        updatedSeats[route.ticket._id] ||
                                        route.ticket.number_of_tickets
                                      }
                                      onChange={(e) =>
                                        handleSeatChange(
                                          route.ticket._id,
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                    <Button
                                      onClick={() =>
                                        handleUpdateSeats(route.ticket._id)
                                      }
                                      className="bg-gray-900 text-white hover:bg-gray-800"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusSchedule;
