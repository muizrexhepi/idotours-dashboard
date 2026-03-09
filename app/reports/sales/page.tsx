"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  CalendarIcon,
  Download,
  ChevronDown,
  ChevronRight,
  Users,
  Bus,
  MapPin,
  Clock,
  FileText,
  SearchX,
} from "lucide-react";
import { generatePassengerManifestPDF } from "@/lib/generatePdf";

export default function ReportsPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [manifest, setManifest] = useState<PassengerManifestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [openTickets, setOpenTickets] = useState<Set<string>>(new Set());

  const fetchManifest = useCallback(async () => {
    if (!user?._id || !date) return;
    const dateString = format(date, "yyyy-MM-dd");
    setIsLoading(true);
    try {
      const data = await getPassengerManifest(user._id, dateString);
      setManifest(data);
      setOpenTickets(new Set(data.map((e) => e.ticket_id)));
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim gjatë ngarkimit të manifestit",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, date, toast]);

  useEffect(() => {
    fetchManifest();
  }, [fetchManifest]);

  const handleDownloadPDF = (entry: PassengerManifestEntry) => {
    setDownloadingId(entry.ticket_id);
    try {
      generatePassengerManifestPDF(entry);
      toast({
        title: "Sukses",
        description: "Manifesti u shkarkua me sukses.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Gabim në gjenerimin e PDF.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleTicket = (ticket_id: string) => {
    setOpenTickets((prev) => {
      const next = new Set(prev);
      next.has(ticket_id) ? next.delete(ticket_id) : next.add(ticket_id);
      return next;
    });
  };

  const totalPassengers = manifest.reduce(
    (sum, entry) => sum + entry.passengers.length,
    0,
  );

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-8">
      <main className="mx-auto flex w-full flex-1 flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Raportet e Pasagjereve
            </h1>
            <p className="text-gray-500 mt-1">
              Shiko dhe shkarko manifestin e udhetareve per nje date specifike.
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-[280px] justify-start text-left font-normal border-gray-300 shadow-sm",
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
            <PopoverContent className="w-auto p-0 rounded-xl" align="end">
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Linjat Aktive
                </p>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? (
                    <Skeleton className="h-9 w-12" />
                  ) : (
                    manifest.length
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Total Pasagjer
                </p>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    totalPassengers
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manifest */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              Lista e Manifesteve
            </CardTitle>
            <CardDescription className="text-gray-500">
              {date
                ? `Te dhenat per daten: ${format(date, "PPP", { locale: sq })}`
                : "Zgjidh nje date per te pare raportin."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 bg-gray-50/30">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : manifest.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <SearchX className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Nuk u gjet asnje rezervim
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Nuk ka asnje pasagjer te regjistruar per kete date. Provoni
                    te zgjidhni nje dite tjeter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {manifest.map((entry) => (
                  <Collapsible
                    key={entry.ticket_id}
                    open={openTickets.has(entry.ticket_id)}
                    onOpenChange={() => toggleTicket(entry.ticket_id)}
                    className="border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer gap-4">
                        <div className="flex items-start sm:items-center gap-4 flex-1">
                          <div className="mt-1 sm:mt-0">
                            {openTickets.has(entry.ticket_id) ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="font-mono text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
                              >
                                {entry.route_code}
                              </Badge>
                              <span className="font-semibold text-gray-900 text-base">
                                {entry.route}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {entry.departure_time}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="truncate max-w-[150px]">
                                  {entry.starting_station}
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                <Users className="h-4 w-4" />
                                {entry.passengers.length} Pasagjer
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="shrink-0 bg-gray-900 text-white hover:bg-gray-800 self-start sm:self-auto w-full sm:w-auto"
                          disabled={downloadingId === entry.ticket_id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(entry);
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadingId === entry.ticket_id
                            ? "Po shkarkon..."
                            : "Printo PDF"}
                        </Button>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-2">
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
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
                              {entry.passengers.map((passenger, idx) => (
                                <TableRow
                                  key={idx}
                                  className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                                >
                                  <TableCell className="text-center text-sm text-gray-400 font-medium">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="text-sm font-medium text-gray-900">
                                    {passenger.full_name}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {passenger.birthdate ??
                                      passenger.age ??
                                      "—"}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600 font-mono">
                                    {passenger.phone || "—"}
                                  </TableCell>
                                  <TableCell className="text-sm font-semibold text-gray-900 text-right">
                                    {passenger.price != null
                                      ? `EUR ${Number(passenger.price).toFixed(2)}`
                                      : "—"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
