"use client";

import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios, { AxiosResponse } from "axios";
import { API_URL } from "../../environment";
import moment from "moment";
import { Ticket } from "@/models/ticket";
import { Booking } from "@/models/booking";
import { Route } from "@/models/route";
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
import { DateRange } from "react-day-picker";
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

interface IData {
  ticket: Ticket;
  bookings: Booking[];
}

const BusSchedule = () => {
  const router = useRouter();
  const [routes, setRoutes] = useState<IData[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [updatedSeats, setUpdatedSeats] = useState<{ [key: string]: number }>(
    {}
  );
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
  const [lines, setLines] = useState<Route[]>([]);

  const { user } = useUser();

  const fetchLines = async () => {
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
    }
  };

  const fetchCapacityRoutes = async () => {
    if (!date?.from || !date?.to) return;
    try {
      const operator_id = user?.$id;
      const response: AxiosResponse = await axios.get(
        `${API_URL}/ticket/capacity-routes?startDate=${date.from.toISOString()}&endDate=${date.to.toISOString()}&line=${selectedLine}&operator_id=${operator_id}`
      );
      setRoutes(response.data.data);
    } catch (error) {
      console.log(error);
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

  const handleLineChange = (e: any) => {
    const selectedValue = e.target.value;
    if (selectedValue === "all") {
      const allLineIds = lines.map((route: Route) => route._id).join("-");
      setSelectedLine(allLineIds);
    } else {
      setSelectedLine(selectedValue);
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
      setRoutes(routes);
    }
  };

  const handleUpdateSeats = async (ticketId: string) => {
    const newSeats = updatedSeats[ticketId];

    try {
      await axios.post(
        `${API_URL}/ticket/update/seats/${ticketId}?seats=${newSeats}`,
        { number_of_tickets: newSeats }
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
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lines capacity</CardTitle>
          <CardDescription>Manage your routes and capacity</CardDescription>
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
                <Button key={range} onClick={() => setDateRange(range)}>
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
                      "w-[300px] justify-start text-left font-normal",
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
                <PopoverContent className="w-auto p-0" align="start">
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All lines" />
                </SelectTrigger>
                <SelectContent>
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

      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>From / To</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Sales / Passengers</TableHead>
                <TableHead>Departure Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes?.map((route: IData, idx: number) => (
                <React.Fragment key={route.ticket._id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => handleRouteClick(idx)}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <span
                        className={`${route.ticket.is_active ? "bg-green-500" : "bg-red-500"
                          } text-white px-2 py-1 rounded-full text-xs`}
                      >
                        {route.ticket.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{route.ticket.route_number.code}</TableCell>
                    <TableCell>
                      {moment
                        .utc(route.ticket.departure_date)
                        .format("dddd, DD-MM-YYYY")}
                    </TableCell>
                    <TableCell>
                      {route.ticket.destination.from} /{" "}
                      {route.ticket.destination.to}
                    </TableCell>
                    <TableCell>{route.ticket.number_of_tickets}</TableCell>
                    <TableCell>
                      {route.bookings.length} /{" "}
                      {route.bookings.reduce(
                        (totalPassengers, booking) =>
                          totalPassengers + (booking?.passengers?.length || 0),
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      {moment.utc(route.ticket.departure_date).format("HH:mm")}
                    </TableCell>
                  </TableRow>
                  {expandedRoute === idx && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <Button
                                variant="outline"
                                className="bg-blue-500 text-white"
                                onClick={() => console.log("View sales report")}
                              >
                                Sales Report
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-yellow-500 text-white"
                                onClick={() => console.log("Toggle sales")}
                              >
                                {route.ticket.is_active
                                  ? "Stop Sales"
                                  : "Resume Sales"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="bg-red-500 text-white"
                                  >
                                    Delete Route
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. Are you sure
                                      you want to delete this route?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteRoute}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                              <span className="font-medium">
                                {route.ticket.destination.from} -{" "}
                                {route.ticket.destination.to}
                              </span>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`seats-${route.ticket._id}`}>
                                  Seats:
                                </Label>
                                <Input
                                  id={`seats-${route.ticket._id}`}
                                  className="w-20"
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
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusSchedule;
