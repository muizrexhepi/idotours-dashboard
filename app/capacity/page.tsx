"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { CalendarIcon, Save, Trash2, Power, FileText } from "lucide-react";
import type { Ticket } from "@/models/ticket";
import type { Booking } from "@/models/booking";
import type { Route } from "@/models/route";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import { useToast } from "@/components/ui/use-toast"; // <-- UI Improvement: Added Toast for feedback
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import moment from "moment";

// Component Imports
import { Input } from "@/components/ui/input";
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

// Actions Imports
import { getOperatorRoutes } from "@/actions/route";
import {
  getCapacityRoutes,
  updateTicketSeats,
  deleteTicketLine,
  deactivateTicket,
  reactivateTicket,
} from "@/actions/ticket";

interface IData {
  ticket: Ticket;
  bookings: Booking[];
}

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
  const { toast } = useToast();

  const [routes, setRoutes] = useState<IData[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [updatedSeats, setUpdatedSeats] = useState<{ [key: string]: number }>(
    {},
  );
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
  const [lines, setLines] = useState<Route[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingLines, setLoadingLines] = useState(true);

  const allLinesValue = useMemo(
    () => lines.map((route: Route) => route._id).join("-"),
    [lines],
  );

  const selectedLineLabel = useMemo(() => {
    if (!selectedLine || selectedLine === allLinesValue)
      return "Të gjitha linjat";
    const line = lines.find((route) => route._id === selectedLine);
    return line?.code || "Të gjitha linjat";
  }, [selectedLine, allLinesValue, lines]);

  const fetchLines = useCallback(async () => {
    if (!user?._id) return;
    setLoadingLines(true);
    try {
      const fetchedLines = await getOperatorRoutes(user._id);
      setLines(fetchedLines || []);
      const lineIds =
        fetchedLines?.map((route: Route) => route._id).join("-") || "";
      setSelectedLine(lineIds);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Nuk u ngarkuan linjat.",
      });
    } finally {
      setLoadingLines(false);
    }
  }, [user?._id, toast]);

  const fetchCapacityRoutesData = useCallback(async () => {
    if (!date?.from || !date?.to || !user?._id || !selectedLine) return;
    setLoadingSchedule(true);
    try {
      const data = await getCapacityRoutes({
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        line: selectedLine,
        operator_id: user._id,
      });
      setRoutes(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Nuk u ngarkua orari.",
      });
    } finally {
      setLoadingSchedule(false);
    }
  }, [date?.from, date?.to, user?._id, selectedLine, toast]);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  useEffect(() => {
    fetchCapacityRoutesData();
  }, [fetchCapacityRoutesData]);

  const handleRouteClick = useCallback((id: number) => {
    setExpandedRoute((prev) => (prev === id ? null : id));
  }, []);

  const handleLineChange = useCallback(
    (value: string) => {
      setSelectedLine(value === "all" ? allLinesValue : value);
    },
    [allLinesValue],
  );

  const performStateChange = useCallback(
    async (currentActivationState: boolean, ticketId: string) => {
      const updatedRoutes = routes.map((route) => {
        if (route.ticket._id === ticketId) {
          return {
            ...route,
            ticket: { ...route.ticket, is_active: !currentActivationState },
          };
        }
        return route;
      });
      setRoutes(updatedRoutes);

      try {
        if (currentActivationState) {
          await deactivateTicket(ticketId);
          toast({ title: "Sukses", description: "Bileta u çaktivizua." });
        } else {
          await reactivateTicket(ticketId);
          toast({ title: "Sukses", description: "Bileta u aktivizua." });
        }
      } catch (error) {
        setRoutes(routes); // Revert
        toast({
          variant: "destructive",
          title: "Gabim",
          description: "Ndryshimi i statusit dështoi.",
        });
      }
    },
    [routes, toast],
  );

  const handleUpdateSeats = useCallback(
    async (ticketId: string) => {
      const newSeats = updatedSeats[ticketId];
      if (!newSeats) return;

      try {
        await updateTicketSeats(ticketId, newSeats);
        setRoutes((prevRoutes) =>
          prevRoutes.map((route) =>
            route.ticket._id === ticketId
              ? {
                  ...route,
                  ticket: { ...route.ticket, number_of_tickets: newSeats },
                }
              : route,
          ),
        );
        toast({
          title: "Sukses",
          description: "Kapaciteti u përditësua me sukses.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Gabim",
          description: "Përditësimi i kapacitetit dështoi.",
        });
      }
    },
    [updatedSeats, toast],
  );

  const handleSeatChange = useCallback((ticketId: string, value: number) => {
    setUpdatedSeats((prev) => ({ ...prev, [ticketId]: value }));
  }, []);

  const handleDeleteRoute = useCallback(async () => {
    if (!deleteRouteId) return;
    try {
      await deleteTicketLine(deleteRouteId);
      setRoutes(routes.filter((route) => route.ticket._id !== deleteRouteId));
      setDeleteRouteId(null);
      toast({ title: "Sukses", description: "Linja u fshi me sukses." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Fshirja e linjës dështoi.",
      });
    }
  }, [deleteRouteId, routes, toast]);

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

  const renderSkeletonRow = () => (
    <TableRow className="border-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <TableCell key={i} className="py-4">
          <Skeleton className="h-4 w-full max-w-[80px]" />
        </TableCell>
      ))}
    </TableRow>
  );

  const renderExpandedRow = (route: IData, idx: number) => (
    <TableRow className="bg-slate-50 border-x border-b border-gray-100 shadow-inner">
      <TableCell colSpan={8} className="py-6 px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-200 bg-white"
              onClick={() => console.log("Shiko raportin e shitjeve")}
            >
              <FileText className="w-4 h-4 mr-2" /> Raporti i Shitjeve
            </Button> */}

            <Button
              variant="outline"
              size="sm"
              className={cn(
                "bg-white",
                route.ticket.is_active
                  ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                  : "border-green-300 text-green-700 hover:bg-green-50",
              )}
              onClick={() =>
                performStateChange(route.ticket.is_active, route.ticket._id)
              }
            >
              <Power className="w-4 h-4 mr-2" />
              {route.ticket.is_active
                ? "Çaktivizo Biletën"
                : "Aktivizo Biletën"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 bg-white"
                  onClick={() => setDeleteRouteId(route.ticket._id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Fshi Linjën
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

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded border border-gray-100">
            <span className="font-medium text-gray-900 text-sm">
              <span className="text-gray-500 font-normal mr-2">Itinerari:</span>
              {route.ticket.destination.from} → {route.ticket.destination.to}
            </span>
            <div className="flex items-center gap-3">
              <Label
                htmlFor={`seats-${route.ticket._id}`}
                className="text-sm font-medium text-gray-700"
              >
                Përditëso Ulëset:
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
                size="sm"
                onClick={() => handleUpdateSeats(route.ticket._id)}
                className="bg-gray-900 text-white hover:bg-gray-800"
                disabled={
                  updatedSeats[route.ticket._id] === undefined ||
                  updatedSeats[route.ticket._id] ===
                    route.ticket.number_of_tickets
                }
              >
                <Save className="w-4 h-4 mr-2" /> Ruaj
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
        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Kapaciteti i Linjave
            </CardTitle>
            <CardDescription className="text-gray-600">
              Menaxho linjat dhe kapacitetin e autobusëve
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
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
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal border-gray-300 text-gray-700 hover:bg-gray-50",
                        !date && "text-muted-foreground",
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
                  disabled={loadingLines}
                >
                  <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 hover:bg-gray-50">
                    <SelectValue>
                      {loadingLines ? "Duke u ngarkuar..." : selectedLineLabel}
                    </SelectValue>
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

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-lg">
              <Table>
                <TableHeader className="bg-gray-50 border-b border-gray-200">
                  <TableRow>
                    <TableHead className="w-[50px] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statusi
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Linja
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nga / Në
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ulëset
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rezervimet / Pasagjerët
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      ),
                    )
                  ) : routes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-gray-500"
                      >
                        Nuk u gjetën linja për periudhën e zgjedhur.
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes?.map((route: IData, idx: number) => (
                      <React.Fragment key={route.ticket._id}>
                        <TableRow
                          className={cn(
                            "border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                            expandedRoute === idx &&
                              "bg-gray-50 border-b-transparent",
                          )}
                          onClick={() => handleRouteClick(idx)}
                        >
                          <TableCell className="py-4 text-sm text-gray-700">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "text-xs font-medium px-2.5 py-1 rounded-full border",
                                route.ticket.is_active
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                              )}
                            >
                              {route.ticket.is_active ? "Aktive" : "Jo aktive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-gray-900">
                            {route.ticket.route_number.code}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {moment
                              .utc(route.ticket.departure_date)
                              .format("DD-MM-YYYY")}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {route.ticket.destination.from} →{" "}
                            {route.ticket.destination.to}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 font-medium">
                            {route.ticket.number_of_tickets}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium mr-1">
                              {route.bookings.length}
                            </span>{" "}
                            /{" "}
                            {route.bookings.reduce(
                              (total, booking) =>
                                total + (booking?.passengers?.length || 0),
                              0,
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900">
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
