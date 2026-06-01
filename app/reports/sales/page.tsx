"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { sq } from "date-fns/locale";
import {
  getPassengerManifest,
  type PassengerManifestEntry,
} from "@/actions/reports";
import { useUser } from "@/context/user";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Bus,
  CalendarIcon,
  Clock,
  Download,
  FileText,
  MapPin,
  Printer,
  SearchX,
  Users,
} from "lucide-react";
import { generatePassengerManifestPDF } from "@/lib/generatePdf";

export default function ReportsPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [manifest, setManifest] = useState<PassengerManifestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchManifest = useCallback(async () => {
    if (!user?._id || !date) return;

    setIsLoading(true);
    try {
      const data = await getPassengerManifest(user._id, format(date, "yyyy-MM-dd"));
      setManifest(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi nje gabim gjate ngarkimit te listave.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [date, toast, user?._id]);

  useEffect(() => {
    fetchManifest();
  }, [fetchManifest]);

  const totalPassengers = useMemo(
    () => manifest.reduce((sum, entry) => sum + entry.passengers.length, 0),
    [manifest],
  );

  const routesWithBookings = useMemo(
    () => manifest.filter((entry) => entry.passengers.length > 0).length,
    [manifest],
  );

  const handleDownloadPDF = (entry: PassengerManifestEntry) => {
    setDownloadingId(entry.ticket_id);
    try {
      generatePassengerManifestPDF(entry);
      toast({
        title: "Sukses",
        description: "Lista u shkarkua me sukses.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Gabim ne gjenerimin e PDF.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-8 print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
          }

          aside,
          header,
          .print-hide {
            display: none !important;
          }

          .print-list {
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-page-break {
            break-after: page;
            page-break-after: always;
          }
        }
      `}</style>

      <main className="mx-auto flex w-full flex-1 flex-col gap-8">
        <div className="print-hide flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Listat e Pasagjereve
            </h1>
            <p className="mt-1 text-gray-500">
              Te gjitha linjat e dites dhe rezervimet per secilen.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <Button
              onClick={() => window.print()}
              disabled={manifest.length === 0 || isLoading}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Printer className="mr-2 h-4 w-4" />
              Printo te gjitha
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start border-gray-300 text-left font-normal shadow-sm sm:w-[280px]",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {date ? (
                    format(date, "PPP", { locale: sq })
                  ) : (
                    <span>Zgjidh nje date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-xl p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) setDate(newDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="hidden print:block">
          <h1 className="text-2xl font-bold text-gray-950">
            Lista e pasagjereve
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            Data: {date ? format(date, "dd.MM.yyyy") : ""}
          </p>
        </div>

        <div className="print-hide grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            icon={<Bus className="h-6 w-6" />}
            label="Linjat Sot"
            value={manifest.length}
            isLoading={isLoading}
            tone="blue"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Me Rezervime"
            value={routesWithBookings}
            isLoading={isLoading}
            tone="indigo"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Total Pasagjer"
            value={totalPassengers}
            isLoading={isLoading}
            tone="emerald"
          />
        </div>

        <Card className="overflow-hidden border-gray-200 shadow-sm print:border-0 print:shadow-none">
          <CardHeader className="print-hide border-b border-gray-100 bg-white pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <FileText className="h-5 w-5 text-gray-400" />
              Linjat dhe Rezervimet e Dites
            </CardTitle>
            <CardDescription className="text-gray-500">
              {date
                ? `Te gjitha linjat per daten: ${format(date, "PPP", { locale: sq })}`
                : "Zgjidh nje date per te pare raportin."}
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-gray-50/30 p-0 print:bg-white">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : manifest.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <SearchX className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Nuk u gjet asnje linje per kete date
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Nuk ka nisje te regjistruara per kete dite.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 print:space-y-3 print:p-0">
                {manifest.map((entry, index) => (
                  <section
                    key={entry.ticket_id}
                    className={cn(
                      "print-list overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:rounded-none",
                      index < manifest.length - 1 && "print-page-break",
                    )}
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between print:border-b print:border-gray-200">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="border-none bg-gray-100 font-mono text-xs text-gray-700"
                          >
                            {entry.route_code}
                          </Badge>
                          <span className="text-base font-semibold text-gray-900">
                            {entry.route}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {entry.departure_time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="max-w-[220px] truncate">
                              {entry.starting_station}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium",
                              entry.passengers.length > 0
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            <Users className="h-4 w-4" />
                            {entry.passengers.length} Pasagjer
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="print-hide w-full shrink-0 bg-gray-900 text-white hover:bg-gray-800 sm:w-auto"
                        disabled={downloadingId === entry.ticket_id}
                        onClick={() => handleDownloadPDF(entry)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloadingId === entry.ticket_id
                          ? "Po shkarkon..."
                          : "Printo PDF"}
                      </Button>
                    </div>

                    <PassengerTable entry={entry} />
                  </section>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  isLoading,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  isLoading: boolean;
  tone: "blue" | "emerald" | "indigo";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }[tone];

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn("rounded-xl p-3", toneClass)}>{icon}</div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {isLoading ? <Skeleton className="h-9 w-12" /> : value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PassengerTable({ entry }: { entry: PassengerManifestEntry }) {
  return (
    <div className="px-4 pb-4 pt-2 print:p-0">
      <div className="overflow-hidden rounded-lg border border-gray-200 print:rounded-none print:border-0">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="border-gray-200">
              <TableHead className="w-12 text-center text-xs font-semibold text-gray-500">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                Emri dhe Mbiemri
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                Datelindja
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                Telefoni
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-gray-500">
                Cmimi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.passengers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  Nuk ka rezervime per kete linje.
                </TableCell>
              </TableRow>
            ) : (
              entry.passengers.map((passenger, index) => (
                <TableRow
                  key={`${entry.ticket_id}-${index}`}
                  className="border-gray-100 hover:bg-gray-50/50"
                >
                  <TableCell className="text-center text-sm font-medium text-gray-400">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {passenger.full_name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {passenger.birthdate ?? passenger.age ?? "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {passenger.phone || "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-gray-900">
                    {passenger.price != null
                      ? `EUR ${Number(passenger.price).toFixed(2)}`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
