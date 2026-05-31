"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgencyUser } from "@/context/agency-user";
import { useToast } from "@/components/ui/use-toast";
import {
  createAgencyBooking,
  type IAgencyPassenger,
} from "@/actions/agency-bookings";
import apiClient from "@/lib/axios";

import { format } from "date-fns";
import { sq } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Trash2,
  CalendarIcon,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Users,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Loader2,
  Plus,
  Bus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface ITicketOption {
  _id: string;
  time: string;
  departure_date: string;
  number_of_tickets: number;
  route_number?: {
    _id: string;
    code: string;
    destination?: { from: string; to: string };
  };
  destination?: { from: string; to: string };
  // Backend populates stops.from / stops.to
  stops?: {
    from?: IStationOption;
    to?: IStationOption;
    price?: number;
    children_price?: number;
  }[];
  price?: number;
}

interface IStationOption {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  code?: string;
}

type IStopOption = NonNullable<ITicketOption["stops"]>[number];

interface IRouteOption {
  _id: string;
  code: string;
  destination?: { from: string; to: string };
}

const EMPTY_PASSENGER: IAgencyPassenger = {
  full_name: "",
  phone: "",
  email: "",
  price: 0,
  birthdate: "",
};

const parseBirthdate = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const localMatch = trimmed.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  const year = isoMatch ? Number(isoMatch[1]) : Number(localMatch?.[3]);
  const month = isoMatch ? Number(isoMatch[2]) : Number(localMatch?.[2]);
  const day = isoMatch ? Number(isoMatch[3]) : Number(localMatch?.[1]);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getAgeOnDate = (birthdate?: string, travelDate = new Date()) => {
  const parsed = parseBirthdate(birthdate);
  if (!parsed) return null;

  let age = travelDate.getFullYear() - parsed.getFullYear();
  const hasBirthdayPassed =
    travelDate.getMonth() > parsed.getMonth() ||
    (travelDate.getMonth() === parsed.getMonth() &&
      travelDate.getDate() >= parsed.getDate());

  if (!hasBirthdayPassed) age -= 1;
  return age;
};

const getStationId = (station?: IStationOption) => station?._id ?? "";

const getStationLabel = (station?: IStationOption) =>
  [station?.city, station?.name].filter(Boolean).join(" - ") ||
  station?.name ||
  "";

const getStationMeta = (station?: IStationOption) =>
  [station?.country, station?.code].filter(Boolean).join(" / ");

const getUniqueStations = (stations: (IStationOption | undefined)[]) => {
  const seen = new Set<string>();
  return stations.filter((station): station is IStationOption => {
    const id = getStationId(station);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const getStartCountry = (ticket: ITicketOption | null) =>
  ticket?.stops?.find((stop) => stop.from?.country)?.from?.country ?? "";

const getStartStations = (ticket: ITicketOption | null) => {
  const startCountry = getStartCountry(ticket);
  const stops = ticket?.stops ?? [];
  const startStops = startCountry
    ? stops.filter((stop) => stop.from?.country === startCountry)
    : stops;

  return getUniqueStations(startStops.map((stop) => stop.from));
};

const getArrivalStations = (
  ticket: ITicketOption | null,
  departureStationId?: string,
) => {
  const startCountry = getStartCountry(ticket);
  const matchingDepartureStops = (ticket?.stops ?? []).filter((stop) => {
    const matchesDeparture =
      !departureStationId || getStationId(stop.from) === departureStationId;
    return matchesDeparture;
  });
  const arrivalStops = startCountry
    ? matchingDepartureStops.filter((stop) => stop.to?.country !== startCountry)
    : matchingDepartureStops;

  return getUniqueStations(
    (arrivalStops.length ? arrivalStops : matchingDepartureStops).map(
      (stop) => stop.to,
    ),
  );
};

const getSelectedStop = (
  ticket: ITicketOption | null,
  departureStationId?: string,
  arrivalStationId?: string,
) => {
  if (!ticket?.stops?.length) return undefined;
  if (!departureStationId && !arrivalStationId) return ticket.stops[0];

  return ticket.stops.find((stop) => {
    const matchesDeparture =
      !departureStationId || getStationId(stop.from) === departureStationId;
    const matchesArrival =
      !arrivalStationId || getStationId(stop.to) === arrivalStationId;

    return matchesDeparture && matchesArrival;
  });
};

const getTicketAdultPrice = (
  ticket: ITicketOption | null,
  stop?: IStopOption,
) => {
  const price = Number(stop?.price ?? ticket?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
};

const getTicketChildrenPrice = (
  ticket: ITicketOption | null,
  stop?: IStopOption,
) => {
  const childPrice = Number(stop?.children_price);
  return Number.isFinite(childPrice)
    ? childPrice
    : getTicketAdultPrice(ticket, stop);
};

const getPassengerTicketPrice = (
  passenger: IAgencyPassenger,
  ticket: ITicketOption | null,
  stop?: IStopOption,
  travelDate?: Date,
) => {
  const age = getAgeOnDate(passenger.birthdate, travelDate ?? new Date());
  return age !== null && age < 10
    ? getTicketChildrenPrice(ticket, stop)
    : getTicketAdultPrice(ticket, stop);
};

// ─── Step indicator ───────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Zgjidhni Linjën", icon: Bus },
  { id: 2, label: "Pasagjerët", icon: Users },
  { id: 3, label: "Konfirmim", icon: CheckCircle2 },
];

export default function AgencyCreateBookingPage() {
  const router = useRouter();
  const { agency } = useAgencyUser();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — ticket search
  const [routeSearch, setRouteSearch] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<IRouteOption | null>(null);
  const [routeOpen, setRouteOpen] = useState(false);

  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    new Date(),
  );
  const [datepickerOpen, setDatepickerOpen] = useState(false);

  const [tickets, setTickets] = useState<ITicketOption[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicketOption | null>(
    null,
  );
  const [stopPickerOpen, setStopPickerOpen] = useState(false);
  const [selectedDepartureStationId, setSelectedDepartureStationId] =
    useState("");
  const [selectedArrivalStationId, setSelectedArrivalStationId] = useState("");

  // Step 2 — passengers
  const [passengers, setPassengers] = useState<IAgencyPassenger[]>([
    { ...EMPTY_PASSENGER },
  ]);
  const [isPaid, setIsPaid] = useState(true);

  // ─── Load all routes once on mount ────────────────────────────
  const [allRoutes, setAllRoutes] = useState<IRouteOption[]>([]);

  useEffect(() => {
    if (!agency?._id) return;
    setLoadingRoutes(true);
    apiClient
      .get(`/route`)
      .then((res) =>
        setAllRoutes(
          (res?.data?.data ?? []).filter((r: IRouteOption) => !!r._id),
        ),
      )
      .catch(() => setAllRoutes([]))
      .finally(() => setLoadingRoutes(false));
  }, [agency?._id]);

  // Filter client-side based on search input
  const routes =
    routeSearch.trim().length === 0
      ? allRoutes
      : allRoutes.filter((r) => {
          const q = routeSearch.toLowerCase();
          return (
            r.code?.toLowerCase().includes(q) ||
            r.destination?.from?.toLowerCase().includes(q) ||
            r.destination?.to?.toLowerCase().includes(q)
          );
        });

  // ─── Fetch tickets for route + date ────────────────────────────
  const fetchTickets = useCallback(async () => {
    if (!selectedRoute?._id || !departureDate) return;
    setLoadingTickets(true);
    setSelectedTicket(null);
    setSelectedDepartureStationId("");
    setSelectedArrivalStationId("");
    setStopPickerOpen(false);
    setTickets([]);
    try {
      // Backend expects DD-MM-YYYY and route_number = route _id
      const dateStr = format(departureDate, "dd-MM-yyyy");
      const res = await apiClient.get(
        `/ticket/by-route-date/${selectedRoute._id}`,
        {
          params: { date: dateStr },
        },
      );
      // Backend returns a single ticket object, wrap in array for consistent UI
      const ticket = res?.data?.data;
      setTickets(ticket ? [ticket] : []);
    } catch {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, [selectedRoute, departureDate]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const startStations = useMemo(
    () => getStartStations(selectedTicket),
    [selectedTicket],
  );

  const arrivalStations = useMemo(
    () => getArrivalStations(selectedTicket, selectedDepartureStationId),
    [selectedTicket, selectedDepartureStationId],
  );

  const selectedStop = useMemo(
    () =>
      getSelectedStop(
        selectedTicket,
        selectedDepartureStationId,
        selectedArrivalStationId,
      ),
    [selectedTicket, selectedDepartureStationId, selectedArrivalStationId],
  );

  const selectedDepartureStation = selectedStop?.from;
  const selectedArrivalStation = selectedStop?.to;
  const selectedAdultPrice = getTicketAdultPrice(selectedTicket, selectedStop);
  const selectedChildPrice = getTicketChildrenPrice(selectedTicket, selectedStop);
  const selectedHasChildrenPrice = selectedStop?.children_price != null;

  useEffect(() => {
    if (!selectedTicket) return;

    const firstDeparture = getStartStations(selectedTicket)[0];
    const firstArrival = getArrivalStations(
      selectedTicket,
      getStationId(firstDeparture),
    )[0];

    setSelectedDepartureStationId(getStationId(firstDeparture));
    setSelectedArrivalStationId(getStationId(firstArrival));
    setStopPickerOpen(false);
  }, [selectedTicket]);

  useEffect(() => {
    if (!selectedTicket || !selectedDepartureStationId) return;
    if (
      arrivalStations.some(
        (station) => getStationId(station) === selectedArrivalStationId,
      )
    ) {
      return;
    }

    setSelectedArrivalStationId(getStationId(arrivalStations[0]));
  }, [
    arrivalStations,
    selectedArrivalStationId,
    selectedDepartureStationId,
    selectedTicket,
  ]);

  useEffect(() => {
    if (!selectedTicket) return;

    setPassengers((prev) =>
      prev.map((p) => ({
        ...p,
        price: getPassengerTicketPrice(
          p,
          selectedTicket,
          selectedStop,
          departureDate,
        ),
      })),
    );
  }, [selectedTicket, selectedStop, departureDate]);

  // ─── Passenger helpers ──────────────────────────────────────────
  const addPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      {
        ...EMPTY_PASSENGER,
        price: getPassengerTicketPrice(
          EMPTY_PASSENGER,
          selectedTicket,
          selectedStop,
          departureDate,
        ),
      },
    ]);
  };

  const removePassenger = (idx: number) => {
    setPassengers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePassenger = (
    idx: number,
    field: keyof IAgencyPassenger,
    value: string | number,
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;

        const nextPassenger = { ...p, [field]: value };
        if (field === "birthdate") {
          nextPassenger.price = getPassengerTicketPrice(
            nextPassenger,
            selectedTicket,
            selectedStop,
            departureDate,
          );
        }

        return nextPassenger;
      }),
    );
  };

  const totalPrice = passengers.reduce(
    (sum, p) => sum + (Number(p.price) || 0),
    0,
  );

  // ─── Validation ─────────────────────────────────────────────────
  const step1Valid = !!selectedTicket && !!selectedStop;
  const step2Valid = passengers.every((p) => p.full_name.trim().length >= 2);

  // ─── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedTicket || !selectedStop || !departureDate || !agency?._id)
      return;
    setIsSubmitting(true);

    const depStation = selectedStop.from;
    const arrStation = selectedStop.to;
    const fromCity =
      depStation?.city ??
      selectedTicket.route_number?.destination?.from ??
      selectedTicket.destination?.from ??
      "";
    const toCity =
      arrStation?.city ??
      selectedTicket.route_number?.destination?.to ??
      selectedTicket.destination?.to ??
      "";

    try {
      await createAgencyBooking(agency._id, selectedTicket._id, {
        passengers,
        total_price: totalPrice,
        stop: {
          departure_date: format(departureDate, "yyyy-MM-dd"),
          from: { city: fromCity },
          to: { city: toCity },
        },
        departure_station: depStation?._id ?? "",
        arrival_station: arrStation?._id ?? "",
        departure_station_label: depStation?.name ?? "",
        arrival_station_label: arrStation?.name ?? "",
        is_paid: isPaid,
        language: "sq",
      });

      toast({ title: "Sukses!", description: "Rezervimi u krijua me sukses." });
      router.push("/agency/bookings");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description:
          err?.response?.data?.message ?? "Ndodhi nje gabim. Provo perseri.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromCity =
    selectedDepartureStation?.city ??
    selectedTicket?.route_number?.destination?.from ??
    selectedTicket?.destination?.from ??
    "";
  const toCity =
    selectedArrivalStation?.city ??
    selectedTicket?.route_number?.destination?.to ??
    selectedTicket?.destination?.to ??
    "";

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/40">
      <main className="flex flex-1 flex-col gap-8 max-w-3xl mx-auto w-full py-8 px-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervim i Ri</h1>
          <p className="text-sm text-gray-500 mt-1">
            Krijo nje rezervim per klientin tuaj.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <button
                  onClick={() => isDone && setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all",
                    isActive && "bg-gray-900 text-white",
                    isDone && "text-gray-700 cursor-pointer hover:bg-gray-100",
                    !isActive && !isDone && "text-gray-400 cursor-not-allowed",
                  )}
                >
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      isActive && "bg-white text-gray-900",
                      isDone && "bg-green-100 text-green-700",
                      !isActive && !isDone && "bg-gray-200 text-gray-400",
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300 mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Ticket Selection ──────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Zgjidhni Linjën dhe Datën
                </CardTitle>
                <CardDescription>
                  Kerko linjën dhe zgjidh orarin e nisjes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Route search */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Linja (Route)
                  </Label>
                  <Popover open={routeOpen} onOpenChange={setRouteOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between border-gray-300 text-gray-700 font-normal h-10"
                      >
                        {selectedRoute ? (
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {selectedRoute.code}
                            </span>
                            {selectedRoute.destination?.from} →{" "}
                            {selectedRoute.destination?.to}
                          </span>
                        ) : (
                          <span className="text-gray-400">Kerko linjën...</span>
                        )}
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[420px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Kerko sipas kodit ose destinacionit..."
                          value={routeSearch}
                          onValueChange={setRouteSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {loadingRoutes ? (
                              <div className="flex items-center justify-center py-4 gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                Duke kerkuar...
                              </div>
                            ) : (
                              "Nuk u gjet asnje linje."
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {routes.map((route) => (
                              <CommandItem
                                key={route._id}
                                value={route._id}
                                onSelect={() => {
                                  setSelectedRoute(route);
                                  setRouteOpen(false);
                                  setRouteSearch("");
                                }}
                                className="flex items-center gap-3 cursor-pointer"
                              >
                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                  {route.code}
                                </span>
                                <span className="text-sm text-gray-800">
                                  {route.destination?.from} →{" "}
                                  {route.destination?.to}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date picker */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Data e Nisjes
                  </Label>
                  <Popover
                    open={datepickerOpen}
                    onOpenChange={setDatepickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-300 text-gray-700 font-normal h-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        {departureDate ? (
                          format(departureDate, "PPP", { locale: sq })
                        ) : (
                          <span className="text-gray-400">Zgjidh datën</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={(d) => {
                          if (d) {
                            setDepartureDate(d);
                            setDatepickerOpen(false);
                          }
                        }}
                        initialFocus
                        disabled={(d) =>
                          d < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Ticket list */}
            {selectedRoute && departureDate && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Oraret e disponueshme
                </h3>

                {loadingTickets ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center bg-white rounded-xl border border-gray-200">
                    <AlertCircle className="h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">
                      Nuk ka orare per kete date
                    </p>
                    <p className="text-xs text-gray-400">
                      Provo nje date tjeter
                    </p>
                  </div>
                ) : (
                  tickets.map((ticket) => {
                    const isSelected = selectedTicket?._id === ticket._id;
                    const firstStop = getSelectedStop(ticket);
                    const depStation = firstStop?.from?.name;
                    const from =
                      ticket.route_number?.destination?.from ??
                      ticket.destination?.from;
                    const to =
                      ticket.route_number?.destination?.to ??
                      ticket.destination?.to;
                    const adultPrice = getTicketAdultPrice(ticket, firstStop);
                    const childPrice = getTicketChildrenPrice(ticket, firstStop);
                    const hasChildrenPrice = firstStop?.children_price != null;

                    return (
                      <button
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all bg-white",
                          isSelected
                            ? "border-gray-900 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                isSelected
                                  ? "bg-gray-900 text-white"
                                  : "bg-gray-100 text-gray-600",
                              )}
                            >
                              <Bus className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {from} → {to}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs border-gray-200 text-gray-600"
                                >
                                  {ticket.route_number?.code}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {ticket.time}
                                </span>
                                {depStation && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {depStation}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {ticket.number_of_tickets} vende
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              €{adultPrice}
                            </span>
                            <div className="text-xs text-gray-400">
                              per person
                            </div>
                            {hasChildrenPrice && (
                              <div className="text-xs text-gray-500">
                                femije €{childPrice}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {selectedTicket && (
              <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Nisja dhe mberritja
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {getStationLabel(selectedDepartureStation) ||
                            "Zgjidh nisjen"}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {getStationLabel(selectedArrivalStation) ||
                            "Zgjidh mberritjen"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-bold text-gray-900">
                          €{selectedAdultPrice}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedHasChildrenPrice
                            ? `femije €${selectedChildPrice}`
                            : "per person"}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStopPickerOpen((open) => !open)}
                        className="h-9 border-gray-300 text-gray-700"
                      >
                        Ndrysho nisjet
                      </Button>
                    </div>
                  </div>

                  {stopPickerOpen && (
                    <div className="border-t border-gray-100 bg-gray-50/70 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Stacioni i nisjes
                            </Label>
                            <p className="mt-0.5 text-xs text-gray-400">
                              Vetem stacionet nga shteti i pare i linjes.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            {startStations.map((station) => {
                              const isActive =
                                selectedDepartureStationId === getStationId(station);
                              return (
                                <button
                                  key={station._id}
                                  type="button"
                                  onClick={() => {
                                    const stationId = getStationId(station);
                                    const firstArrival = getArrivalStations(
                                      selectedTicket,
                                      stationId,
                                    )[0];
                                    setSelectedDepartureStationId(stationId);
                                    setSelectedArrivalStationId(
                                      getStationId(firstArrival),
                                    );
                                  }}
                                  className={cn(
                                    "w-full rounded-lg border p-3 text-left transition-all",
                                    isActive
                                      ? "border-gray-900 bg-white shadow-sm"
                                      : "border-gray-200 bg-white hover:border-gray-300",
                                  )}
                                >
                                  <div className="text-sm font-semibold text-gray-900">
                                    {getStationLabel(station)}
                                  </div>
                                  {getStationMeta(station) && (
                                    <div className="mt-0.5 text-xs text-gray-500">
                                      {getStationMeta(station)}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Stacioni i mberritjes
                            </Label>
                            <p className="mt-0.5 text-xs text-gray-400">
                              Stacionet tjera te disponueshme per kete nisje.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            {arrivalStations.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                                Nuk ka mberritje per kete stacion.
                              </div>
                            ) : (
                              arrivalStations.map((station) => {
                                const stop = getSelectedStop(
                                  selectedTicket,
                                  selectedDepartureStationId,
                                  getStationId(station),
                                );
                                const isActive =
                                  selectedArrivalStationId === getStationId(station);
                                return (
                                  <button
                                    key={station._id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedArrivalStationId(
                                        getStationId(station),
                                      )
                                    }
                                    className={cn(
                                      "w-full rounded-lg border p-3 text-left transition-all",
                                      isActive
                                        ? "border-gray-900 bg-white shadow-sm"
                                        : "border-gray-200 bg-white hover:border-gray-300",
                                    )}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="text-sm font-semibold text-gray-900">
                                          {getStationLabel(station)}
                                        </div>
                                        {getStationMeta(station) && (
                                          <div className="mt-0.5 text-xs text-gray-500">
                                            {getStationMeta(station)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="shrink-0 text-right">
                                        <div className="text-sm font-bold text-gray-900">
                                          €{getTicketAdultPrice(selectedTicket, stop)}
                                        </div>
                                        {stop?.children_price != null && (
                                          <div className="text-xs text-gray-500">
                                            femije €
                                            {getTicketChildrenPrice(
                                              selectedTicket,
                                              stop,
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8"
              >
                Vazhdo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Passengers ────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {/* Selected ticket summary */}
            {selectedTicket && (
              <div className="flex items-center gap-3 p-3 bg-gray-900 text-white rounded-xl">
                <Bus className="h-5 w-5 shrink-0 opacity-60" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold">
                    {fromCity} → {toCity}
                  </span>
                  {selectedDepartureStation && selectedArrivalStation && (
                    <>
                      <span className="opacity-60 mx-2">•</span>
                      <span className="opacity-80">
                        {selectedDepartureStation.name} →{" "}
                        {selectedArrivalStation.name}
                      </span>
                    </>
                  )}
                  <span className="opacity-60 mx-2">•</span>
                  <span className="opacity-80">{selectedTicket.time}</span>
                  <span className="opacity-60 mx-2">•</span>
                  <span className="opacity-80">
                    {departureDate && format(departureDate, "dd MMM yyyy")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setStep(1);
                    setStopPickerOpen(true);
                  }}
                  className="text-xs opacity-60 hover:opacity-100 underline"
                >
                  Ndrysho nisjet
                </button>
              </div>
            )}

            {/* Passenger forms */}
            <div className="flex flex-col gap-4">
              {passengers.map((p, idx) => (
                <Card key={idx} className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        Pasagjeri {idx + 1}
                      </CardTitle>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-gray-600">
                        Emri dhe Mbiemri *
                      </Label>
                      <Input
                        placeholder="p.sh. Arben Krasniqi"
                        value={p.full_name}
                        onChange={(e) =>
                          updatePassenger(idx, "full_name", e.target.value)
                        }
                        className="border-gray-300 h-9 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-gray-600">
                        Telefoni
                      </Label>
                      <Input
                        placeholder="+383 44 000 000"
                        value={p.phone}
                        onChange={(e) =>
                          updatePassenger(idx, "phone", e.target.value)
                        }
                        className="border-gray-300 h-9 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-gray-600">
                        Email
                      </Label>
                      <Input
                        placeholder="email@shembull.com"
                        value={p.email}
                        onChange={(e) =>
                          updatePassenger(idx, "email", e.target.value)
                        }
                        className="border-gray-300 h-9 text-sm"
                        type="email"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-gray-600">
                        Datelindja
                      </Label>
                      <Input
                        placeholder="dd.mm.yyyy"
                        value={p.birthdate ?? ""}
                        onChange={(e) =>
                          updatePassenger(idx, "birthdate", e.target.value)
                        }
                        className="border-gray-300 h-9 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-gray-600">
                        Cmimi (EUR) *
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0.00"
                        value={p.price || ""}
                        onChange={(e) =>
                          updatePassenger(
                            idx,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="border-gray-300 h-9 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <button
              onClick={addPassenger}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-3.5 transition-all w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Shto pasagjer tjeter
            </button>

            {/* Payment toggle */}
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Pagesa e kryer
                    </p>
                    <p className="text-xs text-gray-500">
                      Sheno nese klienti ka paguar
                    </p>
                  </div>
                </div>
                <Switch checked={isPaid} onCheckedChange={setIsPaid} />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-gray-300 text-gray-700"
              >
                Mbrapa
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8"
              >
                Rishiko <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ───────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            {/* Trip summary */}
            <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
              <div className="h-1.5 bg-gray-900 w-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Permbledhje e Rezervimit
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-gray-900">
                        {fromCity}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-base font-bold text-gray-900">
                        {toCity}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {selectedTicket?.route_number?.code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {departureDate && format(departureDate, "dd MMM yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {selectedTicket?.time}
                      </span>
                      {selectedDepartureStation && selectedArrivalStation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedDepartureStation.name} →{" "}
                          {selectedArrivalStation.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Passengers summary */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Pasagjerët ({passengers.length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {passengers.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {p.full_name}
                            </span>
                            {p.phone && (
                              <span className="text-xs text-gray-500 ml-2">
                                {p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          €{Number(p.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total + paid status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Pagesa:</span>
                    <Badge
                      className={
                        isPaid
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }
                      variant="outline"
                    >
                      {isPaid ? "E paguar" : "E papaguar"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      €{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-gray-300 text-gray-700"
              >
                Mbrapa
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 min-w-[160px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Duke krijuar...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Konfirmo Rezervimin
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
