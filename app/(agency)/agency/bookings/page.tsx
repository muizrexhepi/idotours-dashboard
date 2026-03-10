"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Printer,
} from "lucide-react";
import moment from "moment-timezone";

const ITEMS_PER_PAGE = 10;

export default function AgencyBookingsPage() {
  const { agency } = useAgencyUser();
  const printRef = useRef<HTMLDivElement>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!agency?._id) return;
    setIsLoading(true);
    try {
      const data = await getAgencyBookings(agency._id, page, ITEMS_PER_PAGE);
      setBookings(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [agency?._id, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.passengers?.[0]?.full_name?.toLowerCase().includes(q) ||
      b.labels?.from_city?.toLowerCase().includes(q) ||
      b.labels?.to_city?.toLowerCase().includes(q) ||
      b.passengers?.[0]?.email?.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=1000,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Rezervimet - ${agency?.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 28px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 14px; }
            .header h1 { font-size: 18px; font-weight: 700; }
            .header p { font-size: 11px; color: #666; margin-top: 3px; }
            .meta { text-align: right; font-size: 11px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            thead tr { background: #f3f4f6; }
            th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; border-bottom: 1px solid #d1d5db; }
            td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 12px; vertical-align: middle; }
            .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; }
            .paid { background: #dcfce7; color: #16a34a; }
            .unpaid { background: #fef9c3; color: #a16207; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .footer { margin-top: 28px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; }
            @media print { body { padding: 14px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Lista e Rezervimeve</h1>
              <p>${agency?.name} &nbsp;•&nbsp; Faqja ${page}</p>
            </div>
            <div class="meta">
              Gjeneruar: ${new Date().toLocaleDateString("sq", { day: "2-digit", month: "long", year: "numeric" })}<br/>
              ${filtered.length} rezervime
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Pasagjeri</th>
                <th>Email</th>
                <th>Linja</th>
                <th>Data</th>
                <th class="text-center">Pasagjerot</th>
                <th class="text-center">Pagesa</th>
                <th class="text-right">Cmimi</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (b, i) => `
                <tr>
                  <td style="color:#9ca3af">${(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td><strong>${b.passengers?.[0]?.full_name || "—"}</strong></td>
                  <td style="color:#6b7280">${b.passengers?.[0]?.email || "—"}</td>
                  <td>${b.labels?.from_city || ""} &rarr; ${b.labels?.to_city || ""}</td>
                  <td>${moment(b.departure_date).format("DD MMM YYYY")}</td>
                  <td class="text-center">${b.passengers?.length ?? 1}</td>
                  <td class="text-center">
                    <span class="badge ${b.is_paid ? "paid" : "unpaid"}">
                      ${b.is_paid ? "Paguar" : "Pa paguar"}
                    </span>
                  </td>
                  <td class="text-right"><strong>€${(b.price ?? 0).toFixed(2)}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <span>${agency?.name} &mdash; Portali i Agjencise</span>
            <span>Total: €${filtered.reduce((s, b) => s + (b.price ?? 0), 0).toFixed(2)}</span>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervimet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Te gjitha rezervimet e krijuara nga agjencia juaj.
          </p>
        </div>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-2 shrink-0"
          disabled={isLoading || filtered.length === 0}
        >
          <Printer className="h-4 w-4" />
          Printo Listën
        </Button>
      </div>

      {/* Hidden printable reference - not used directly but kept for ref */}
      <div ref={printRef} className="hidden" />

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Lista e Rezervimeve
              </CardTitle>
              <CardDescription>{filtered.length} rezervime</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kerko rezervime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-gray-300 h-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <BookOpen className="h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                {search
                  ? "Nuk u gjet asnje rezervim."
                  : "Nuk ka rezervime ende."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        #
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pasagjeri
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Linja
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Pasagjerot
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Pagesa
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Cmimi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((booking, i) => (
                      <TableRow
                        key={booking._id}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="text-xs text-gray-400 py-3.5">
                          {(page - 1) * ITEMS_PER_PAGE + i + 1}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-900 py-3.5">
                          {booking.passengers?.[0]?.full_name || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {booking.passengers?.[0]?.email || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          <span className="font-medium">
                            {booking.labels?.from_city}
                          </span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="font-medium">
                            {booking.labels?.to_city}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {moment(booking.departure_date).format("DD MMM YYYY")}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {booking.passengers?.length ?? 1}
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

              {/* Table footer total + pagination */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">Faqja {page}</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-sm font-semibold text-gray-700">
                    Total: €
                    {filtered
                      .reduce((s, b) => s + (b.price ?? 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                    className="border-gray-300 text-gray-700 gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Para
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={bookings.length < ITEMS_PER_PAGE || isLoading}
                    className="border-gray-300 text-gray-700 gap-1"
                  >
                    Pas <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
