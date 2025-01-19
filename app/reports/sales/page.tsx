"use client";

import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import { CalendarIcon, ArrowUpDown } from "lucide-react";

import { API_URL } from "@/environment";
import { SYMBOLS } from "@/app/Symbols";
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

export interface IDebt {
  operator: string;
  debt: number;
  _id: string;
}

type SortDirection = "asc" | "desc";

const Page = () => {
  const [debts, setDebts] = useState<IDebt[]>([]);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("2024");
  const [sortColumn, setSortColumn] = useState<keyof IDebt>("operator");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();
  const { user } = useUser();

  const getDebtsByMonth = async () => {
    try {
      const operator_id = user?.$id;
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
    }
  };

  useEffect(() => {
    if (user && month) {
      getDebtsByMonth();
    }
  }, [month, year, user]);

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
  const years: string[] = ["2024", "2025", "2026", "2027"];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Charged Debt Owed to You</CardTitle>
          <CardDescription>
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
                  className="capitalize"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {monthName}
                </Button>
              ))}
              <Select onValueChange={handleSetYear} value={year}>
                <SelectTrigger className="w-[180px]">
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

      <Card>
        <CardHeader>
          <CardTitle>Debt Details</CardTitle>
          <CardDescription>
            {month && year
              ? `Showing debts for ${
                  month.charAt(0).toUpperCase() + month.slice(1)
                } ${year}`
              : "Select a month and year to view debts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDebts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("operator")}
                      className="font-bold"
                    >
                      Company
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("debt")}
                      className="font-bold"
                    >
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDebts.map((debt: IDebt) => (
                  <TableRow key={debt._id}>
                    <TableCell>{debt.operator}</TableCell>
                    <TableCell>
                      {debt.debt.toFixed(2)} {SYMBOLS.EURO}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {month
                ? "No debts found for the selected month and year."
                : "Please select a month to view debts."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
