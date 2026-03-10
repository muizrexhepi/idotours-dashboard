"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAgencyUser } from "@/context/agency-user";
import {
  getAgencyMonthlyReport,
  type IMonthlyReport,
} from "@/actions/agency-bookings";
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
  TrendingUp,
  AlertTriangle,
  Printer,
  Receipt,
  CalendarDays,
  ShoppingBag,
  Percent,
} from "lucide-react";

const MONTH_NAMES = [
  "",
  "Janar",
  "Shkurt",
  "Mars",
  "Prill",
  "Maj",
  "Qershor",
  "Korrik",
  "Gusht",
  "Shtator",
  "Tetor",
  "Nentor",
  "Dhjetor",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);

export default function AgencyDebtsPage() {
  const { agency } = useAgencyUser();
  const [report, setReport] = useState<IMonthlyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(async () => {
    if (!agency?._id) return;
    setIsLoading(true);
    try {
      const data = await getAgencyMonthlyReport(agency._id);
      setReport(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [agency?._id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Raporti i Borxhit - ${agency?.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
            h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
            .subtitle { font-size: 12px; color: #666; margin-bottom: 24px; }
            .summary { display: flex; gap: 24px; margin-bottom: 28px; }
            .stat-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 20px; flex: 1; }
            .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
            .stat-value { font-size: 20px; font-weight: 700; }
            .stat-value.red { color: #dc2626; }
            .stat-value.green { color: #16a34a; }
            table { width: 100%; border-collapse: collapse; }
            thead tr { background: #f9fafb; }
            th { text-align: left; padding: 10px 14px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
            td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
            .badge-red { background: #fef2f2; color: #dc2626; }
            .badge-green { background: #f0fdf4; color: #16a34a; }
            .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">
            Gjeneruar me: ${new Date().toLocaleDateString("sq", { day: "2-digit", month: "long", year: "numeric" })}
            &nbsp;•&nbsp; ${agency?.name}
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

  const totalDebt = report.reduce((s, r) => s + (r.debt ?? 0), 0);
  const totalSales = report.reduce((s, r) => s + (r.total_sales ?? 0), 0);
  const totalProfit = report.reduce((s, r) => s + (r.profit ?? 0), 0);
  const totalBookings = report.reduce((s, r) => s + (r.booking_count ?? 0), 0);
  const percentage = agency?.financial_data?.percentage ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Borxhet & Raportet
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Shiko borxhin mujor dhe totalet financiare te agjencise suaj.
          </p>
        </div>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-2 shrink-0"
          disabled={isLoading || report.length === 0}
        >
          <Printer className="h-4 w-4" />
          Printo Raportin
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Shitje",
            value: `€${fmt(totalSales)}`,
            icon: ShoppingBag,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Fitimi Juaj",
            value: `€${fmt(totalProfit)}`,
            icon: TrendingUp,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Borxhi Total",
            value: `€${fmt(totalDebt)}`,
            icon: AlertTriangle,
            color: "bg-red-50 text-red-500",
          },
          {
            label: "Komisioni",
            value: `${percentage}%`,
            icon: Percent,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-gray-200 shadow-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${s.color.split(" ")[0]}`}
                >
                  <Icon className={`h-5 w-5 ${s.color.split(" ")[1]}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">
                    {s.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current debt call-out */}
      {!isLoading && totalDebt > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Borxhi aktual: €{fmt(totalDebt)}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Kjo eshte shuma totale qe i detyroheni operatorit nga te gjitha
              muajt. Komisioni juaj prej {percentage}% mbahet nga te ardhurat.
            </p>
          </div>
        </div>
      )}

      {/* Printable area */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Raporti Mujor
              </CardTitle>
              <CardDescription>
                Ndarja e shitjeve, fitimit dhe borxhit sipas muajit
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-xs border-gray-200 text-gray-600 gap-1"
            >
              <CalendarDays className="h-3 w-3" />
              {report.length} muaj
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Printable content div */}
          <div ref={printRef} style={{ display: "none" }}>
            <h1>{agency?.name} - Raporti i Borxhit</h1>
            <p className="subtitle">
              Komisioni: {percentage}% • Gjeneruar:{" "}
              {new Date().toLocaleDateString("sq")}
            </p>

            <div className="summary">
              <div className="stat-box">
                <div className="stat-label">Total Shitje</div>
                <div className="stat-value">€{fmt(totalSales)}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Fitimi</div>
                <div className="stat-value green">€{fmt(totalProfit)}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Borxhi Total</div>
                <div className="stat-value red">€{fmt(totalDebt)}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Rezervime</div>
                <div className="stat-value">{totalBookings}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Muaji</th>
                  <th>Viti</th>
                  <th className="text-center">Rezervime</th>
                  <th className="text-right">Total Shitje</th>
                  <th className="text-right">Fitimi ({percentage}%)</th>
                  <th className="text-right">Borxhi</th>
                  <th className="text-center">Statusi</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, i) => (
                  <tr key={i}>
                    <td>{MONTH_NAMES[row.month]}</td>
                    <td>{row.year}</td>
                    <td className="text-center">{row.booking_count}</td>
                    <td className="text-right">€{fmt(row.total_sales)}</td>
                    <td className="text-right">€{fmt(row.profit)}</td>
                    <td
                      className="text-right"
                      style={{ color: "#dc2626", fontWeight: 600 }}
                    >
                      €{fmt(row.debt)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${row.debt > 0 ? "badge-red" : "badge-green"}`}
                      >
                        {row.debt > 0 ? "I papaguar" : "I shlyer"}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ borderTop: "2px solid #e5e7eb", fontWeight: 700 }}>
                  <td colSpan={2}>TOTALI</td>
                  <td className="text-center">{totalBookings}</td>
                  <td className="text-right">€{fmt(totalSales)}</td>
                  <td className="text-right">€{fmt(totalProfit)}</td>
                  <td className="text-right" style={{ color: "#dc2626" }}>
                    €{fmt(totalDebt)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Screen table */}
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : report.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Receipt className="h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Nuk ka te dhena per te shfaqur ende.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Muaji
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viti
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Rezervime
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Total Shitje
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Fitimi ({percentage}%)
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Borxhi
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Statusi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.map((row, i) => (
                      <TableRow
                        key={i}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="text-sm font-semibold text-gray-900 py-3.5">
                          {MONTH_NAMES[row.month]}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {row.year}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700 font-medium">
                            <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                            {row.booking_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-gray-900">
                          €{fmt(row.total_sales)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-green-600">
                          €{fmt(row.profit)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-red-600">
                          €{fmt(row.debt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              row.debt > 0
                                ? "bg-red-50 text-red-600 border-red-200 text-xs"
                                : "bg-green-50 text-green-700 border-green-200 text-xs"
                            }
                          >
                            {row.debt > 0 ? "I papaguar" : "I shlyer"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals footer */}
              <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 grid grid-cols-3 sm:grid-cols-6 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Total
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {totalBookings} rezervime
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Shitjet
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    €{fmt(totalSales)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Fitimi
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    €{fmt(totalProfit)}
                  </p>
                </div>
                <div className="text-right sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Borxhi Total
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    €{fmt(totalDebt)}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
