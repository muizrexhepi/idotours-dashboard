"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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

// Constants for better maintainability
const DATE_RANGES = [
  { key: "today", label: "Sot" },
  { key: "yesterday", label: "Dje" },
  { key: "thisWeek", label: "Këtë Javë" },
  { key: "lastWeek", label: "Javën e Kaluar" },
  { key: "thisMonth", label: "Këtë Muaj" },
  { key: "lastMonth", label: "Muajin e Kaluar" },
] as const;

const LOADING_SKELETON_ROWS = 5;

const BusSchedule = () => {
  const router = useRouter();
  const { user } = useUser();

  // State management
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
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingLines, setLoadingLines] = useState(true);

  // Memoized values
  const allLinesValue = useMemo(
    () => lines.map((route: Route) => route._id).join("-"),
    [lines]
  );

  const selectedLineLabel = useMemo(() => {
    if (!selectedLine) return "Të gjitha linjat";
    if (selectedLine === allLinesValue) return "Të gjitha linjat";
    const line = lines.find((route) => route._id === selectedLine);
    return line?.code || "Të gjitha linjat";
  }, [selectedLine, allLinesValue, lines]);

  // API calls
  const fetchLines = useCallback(async () => {
    if (!user?._id) return;

    setLoadingLines(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/route/operator/${user._id}`
      );
      const fetchedLines = response.data.data;
      setLines(fetchedLines);

      // Set initial selected line to all lines
      const lineIds = fetchedLines.map((route: Route) => route._id).join("-");
      setSelectedLine(lineIds);
    } catch (error) {
      console.error("Error fetching lines:", error);
    } finally {
      setLoadingLines(false);
    }
  }, [user?._id]);

  const fetchCapacityRoutes = useCallback(async () => {
    if (!date?.from || !date?.to || !user?._id || !selectedLine) return;

    setLoadingSchedule(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/ticket/capacity-routes`,
        {
          params: {
            startDate: date.from.toISOString(),
            endDate: date.to.toISOString(),
            line: selectedLine,
            operator_id: user._id,
          },
        }
      );
      setRoutes(response.data.data);
    } catch (error) {
      console.error("Error fetching capacity routes:", error);
    } finally {
      setLoadingSchedule(false);
    }
  }, [date?.from, date?.to, user?._id, selectedLine]);

  // Effects
  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  useEffect(() => {
    fetchCapacityRoutes();
  }, [fetchCapacityRoutes]);

  // Event handlers
  const handleRouteClick = useCallback((id: number) => {
    setExpandedRoute((prev) => (prev === id ? null : id));
  }, []);

  const handleLineChange = useCallback(
    (value: string) => {
      if (value === "all") {
        setSelectedLine(allLinesValue);
      } else {
        setSelectedLine(value);
      }
    },
    [allLinesValue]
  );

  const performStateChange = useCallback(
    async (currentActivationState: boolean, ticketId: string) => {
      // Optimistic update
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
        // Revert on error
        setRoutes(routes);
      }
    },
    [routes]
  );

  const handleUpdateSeats = useCallback(
    async (ticketId: string) => {
      const newSeats = updatedSeats[ticketId];
      if (!newSeats) return;

      try {
        await axios.post(
          `${API_URL}/ticket/update/seats/${ticketId}`,
          { number_of_tickets: newSeats },
          { params: { seats: newSeats } }
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
        console.error("Error updating seats:", error);
      }
    },
    [updatedSeats]
  );

  const handleSeatChange = useCallback((ticketId: string, value: number) => {
    setUpdatedSeats((prev) => ({ ...prev, [ticketId]: value }));
  }, []);

  const handleDeleteRoute = useCallback(async () => {
    if (!deleteRouteId) return;

    try {
      await axios.post(`${API_URL}/ticket/delete/${deleteRouteId}`);
      setRoutes(routes.filter((route) => route.ticket._id !== deleteRouteId));
      setDeleteRouteId(null);
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  }, [deleteRouteId, routes]);

  const setDateRange = useCallback((range: string) => {
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
  }, []);

  // Render helpers
  const renderSkeletonRow = () => (
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
  );

  const renderExpandedRow = (route: IData, idx: number) => (
    <TableRow className="bg-gray-50 border-gray-100">
      <TableCell colSpan={8} className="py-4 px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
              onClick={() => console.log("Shiko raportin e shitjeve")}
            >
              Raporti i Shitjeve
            </Button>
            <Button
              variant="outline"
              className={`${
                route.ticket.is_active
                  ? "border-red-300 text-red-700 hover:bg-red-50"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
              onClick={() =>
                performStateChange(route.ticket.is_active, route.ticket._id)
              }
            >
              {route.ticket.is_active
                ? "Çaktivizo Biletën"
                : "Aktivizo Biletën"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                  onClick={() => setDeleteRouteId(route.ticket._id)}
                >
                  Fshi Linjën
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white p-6 rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                    A jeni i sigurt?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Ky veprim nuk mund të zhbëhet. Kjo do ta fshijë përgjithmonë
                    këtë linjë dhe do ta largojë të dhënat nga serverët tanë.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Anulo
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRoute}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Fshi
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <span className="font-medium text-gray-900 text-sm">
              Linja: {route.ticket.destination.from} →{" "}
              {route.ticket.destination.to}
            </span>
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`seats-${route.ticket._id}`}
                className="text-sm text-gray-700"
              >
                Ulëset:
              </Label>
              <Input
                id={`seats-${route.ticket._id}`}
                className="w-24 border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                type="number"
                min="1"
                value={
                  updatedSeats[route.ticket._id] !== undefined
                    ? updatedSeats[route.ticket._id]
                    : route.ticket.number_of_tickets
                }
                onChange={(e) =>
                  handleSeatChange(route.ticket._id, Number(e.target.value))
                }
              />
              <Button
                onClick={() => handleUpdateSeats(route.ticket._id)}
                className="bg-gray-900 text-white hover:bg-gray-800"
                disabled={
                  updatedSeats[route.ticket._id] === undefined ||
                  updatedSeats[route.ticket._id] ===
                    route.ticket.number_of_tickets
                }
              >
                Ruaj
              </Button>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8">
        <Card className="border-none bg-white">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Kapaciteti i Linjave
            </CardTitle>
            <CardDescription className="text-gray-600">
              Menaxho linjat dhe kapacitetin e autobusëve
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {DATE_RANGES.map((range) => (
                  <Button
                    key={range.key}
                    onClick={() => setDateRange(range.key)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {range.label}
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
                            {format(date.from, "dd LLL, yyyy")} -{" "}
                            {format(date.to, "dd LLL, yyyy")}
                          </>
                        ) : (
                          format(date.from, "dd LLL, yyyy")
                        )
                      ) : (
                        <span>Zgjidh një datë</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-white rounded-lg"
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
                <Select
                  onValueChange={handleLineChange}
                  value={selectedLine === allLinesValue ? "all" : selectedLine}
                >
                  <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 hover:bg-gray-50">
                    <SelectValue>{selectedLineLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-lg">
                    <SelectItem value="all">Të gjitha linjat</SelectItem>
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

        <Card className="border-0 bg-white">
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200">
                    <TableHead className="w-[50px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statusi
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linja
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nga / Në
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ulëset
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rezervimet / Pasagjerët
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Koha e Nisjes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSchedule ? (
                    Array.from({ length: LOADING_SKELETON_ROWS }).map(
                      (_, i) => (
                        <React.Fragment key={i}>
                          {renderSkeletonRow()}
                        </React.Fragment>
                      )
                    )
                  ) : routes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        Nuk u gjetën linja për periudhën e zgjedhur.
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
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              } text-xs font-medium px-2 py-1 rounded-full border`}
                            >
                              {route.ticket.is_active ? "Aktive" : "Jo aktive"}
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
                        {expandedRoute === idx && renderExpandedRow(route, idx)}
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
