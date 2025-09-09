"use client";
import { useEffect, useState } from "react";
import axios, { type AxiosResponse } from "axios";
import { CalendarIcon, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/environment";
import { SYMBOLS } from "@/lib/data";
import { useUser } from "@/context/user";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export interface IDebt {
  operator: string;
  debt: number;
  _id: string;
}

interface IPayout {
  _id: string;
  amount: number;
  status: string;
  // Add other relevant fields
}

type SortDirection = "asc" | "desc";

const SalesPage = () => {
  const [debts, setDebts] = useState<IDebt[]>([]);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("2025");
  const [sortColumn, setSortColumn] = useState<keyof IDebt>("operator");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<IDebt | null>(null);
  const [notes, setNotes] = useState("");
  const [payouts, setPayouts] = useState<IPayout[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  const getDebtsByMonth = async () => {
    setLoadingDebts(true);
    try {
      const operator_id = user?._id;
      const response: AxiosResponse = await axios.get(
        `${API_URL}/operator/reports/debt/owed/${operator_id}?month=${month}&year=${year}`
      );
      setDebts(response.data.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "An error occurred",
      });
    } finally {
      setLoadingDebts(false);
    }
  };

  const getPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/payouts/timeperiod/${user?._id}?month=${month}&year=${year}`
      );
      setPayouts(response.data.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch payouts",
      });
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    if (user && month && year) {
      getDebtsByMonth();
      getPayouts();
    }
  }, [user, month, year]);

  const handleSetMonth = (selectedMonth: string) => {
    setMonth(selectedMonth);
  };

  const handleSetYear = (selectedYear: string) => {
    setYear(selectedYear);
  };

  const handleSort = (column: keyof IDebt) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedDebts = [...debts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const years: string[] = ["2025", "2026", "2027", "2028"];

  const handlePaymentRequest = async () => {
    if (!selectedDebt) return;
    try {
      const response = await axios.post(`${API_URL}/payouts/create`, {
        operator_id: user?._id,
        requested_amount_in_cents: Math.round(selectedDebt.debt * 100),
        notes: notes,
        year: year,
        month: month,
      });
      toast({
        title: "Success",
        description: "Payment request submitted successfully",
      });
      setIsModalOpen(false);
      setNotes("");
      getPayouts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to submit payment request",
      });
    }
  };

  const isPayoutSent = payouts.length > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Monthly Charged Debt Owed to You
            </CardTitle>
            <CardDescription className="text-gray-600">
              Select a month and year to view the debts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap gap-2">
                {months.map((monthName: string) => (
                  <Button
                    key={monthName}
                    onClick={() => handleSetMonth(monthName)}
                    variant={month === monthName ? "default" : "outline"}
                    className={
                      month === monthName
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                  </Button>
                ))}
                <Select onValueChange={handleSetYear} value={year}>
                  <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 hover:bg-gray-50">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((yearOption) => (
                      <SelectItem key={yearOption} value={yearOption}>
                        {yearOption}
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
              Debt Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              {month && year
                ? `Showing debts for ${
                    month.charAt(0).toUpperCase() + month.slice(1)
                  } ${year}`
                : "Select a month and year to view debts"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingDebts ? (
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manage
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-gray-100">
                        <TableCell className="py-4">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-32" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : sortedDebts.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-gray-200">
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("operator")}
                        className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-transparent"
                      >
                        Company
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("debt")}
                        className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-transparent"
                      >
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manage
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDebts.map((debt: IDebt) => (
                    <TableRow
                      key={debt._id}
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-4 text-sm font-medium text-gray-900">
                        {debt.operator}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {formatCurrency(debt.debt)} {SYMBOLS.EURO}
                      </TableCell>
                      <TableCell>
                        {isPayoutSent ? (
                          <div className="flex items-center">
                            <span className="text-green-600 text-sm mr-2">
                              Request Sent
                            </span>
                            <Link
                              href={`/payouts/${payouts[0]._id}`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Payout
                            </Link>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedDebt(debt);
                              setIsModalOpen(true);
                            }}
                            className="bg-gray-900 text-white hover:bg-gray-800"
                          >
                            Request Payout
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {month
                  ? "No debts found for the selected month and year."
                  : "Please select a month to view debts."}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Payment Request
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right text-gray-700">
                  Period
                </Label>
                <Input
                  id="period"
                  value={`${
                    month.charAt(0).toUpperCase() + month.slice(1)
                  } ${year}`}
                  className="col-span-3 border-gray-300 text-gray-800"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-gray-700">
                  Amount
                </Label>
                <Input
                  id="amount"
                  value={
                    selectedDebt
                      ? `${formatCurrency(selectedDebt.debt)} ${SYMBOLS.EURO}`
                      : ""
                  }
                  className="col-span-3 border-gray-300 text-gray-800"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right text-gray-700">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3 border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any relevant notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handlePaymentRequest}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};
export default SalesPage;
