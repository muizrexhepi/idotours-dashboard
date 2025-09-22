"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios, { type AxiosResponse } from "axios";
import { CalendarIcon, ArrowUpDown, RotateCcw, Info, CheckCircle, XCircle } from "lucide-react";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
}

type SortDirection = "asc" | "desc";

const MONTHS = [
  { value: "january", label: "Janar" },
  { value: "february", label: "Shkurt" },
  { value: "march", label: "Mars" },
  { value: "april", label: "Prill" },
  { value: "may", label: "Maj" },
  { value: "june", label: "Qershor" },
  { value: "july", label: "Korrik" },
  { value: "august", label: "Gusht" },
  { value: "september", label: "Shtator" },
  { value: "october", label: "Tetor" },
  { value: "november", label: "Nëntor" },
  { value: "december", label: "Dhjetor" },
] as const;

const YEARS = ["2025", "2026", "2027", "2028"] as const;
const LOADING_SKELETON_ROWS = 3;

const SalesPage = () => {
  const { toast } = useToast();
  const { user, setUser } = useUser();

  const [debts, setDebts] = useState<IDebt[]>([]);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("2025");
  const [sortColumn, setSortColumn] = useState<keyof IDebt>("operator");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<IDebt | null>(null);
  const [notes, setNotes] = useState("");
  const [payouts, setPayouts] = useState<IPayout[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [isTogglingAutomaticPayouts, setIsTogglingAutomaticPayouts] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const automaticPayoutsEnabled = useMemo(() => {
    return user?.company_metadata?.payouts?.automatic_scheduled_payouts || false;
  }, [user]);

  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn])
        return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn])
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [debts, sortColumn, sortDirection]);

  const isPayoutSent = useMemo(() => payouts.length > 0, [payouts.length]);

  const selectedMonthLabel = useMemo(() => {
    const monthObj = MONTHS.find((m) => m.value === month);
    return monthObj?.label || "";
  }, [month]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("sq-AL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const checkUserPayoutStatus = useCallback(async () => {
    if (!user?._id) return;

    setLoadingUserData(true);
    try {
      const response = await axios.get(`${API_URL}/operator/${user._id}`);
      setUser(response.data.data);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingUserData(false);
    }
  }, [user?._id, setUser]);

  const getDebtsByMonth = useCallback(async () => {
    if (!user?._id || !month || !year) return;

    setLoadingDebts(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/operator/reports/debt/owed/${user._id}`,
        {
          params: { month, year },
        }
      );
      setDebts(response.data.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description:
          err.response?.data?.message ||
          "Ndodhi një gabim gjatë ngarkimit të borxheve",
      });
    } finally {
      setLoadingDebts(false);
    }
  }, [user?._id, month, year, toast]);

  const getPayouts = useCallback(async () => {
    if (!user?._id || !month || !year) return;

    setLoadingPayouts(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/payouts/timeperiod/${user._id}`,
        {
          params: { month, year },
        }
      );
      setPayouts(response.data.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description:
          err.response?.data?.message || "Gabim në ngarkimin e pagesave",
      });
    } finally {
      setLoadingPayouts(false);
    }
  }, [user?._id, month, year, toast]);

  const toggleAutomaticPayouts = useCallback(async () => {
    if (!user?._id) return;

    setIsTogglingAutomaticPayouts(true);
    try {
      const response = await axios.post(
        `${API_URL}/operator/automatic-payouts/${user._id}`,
        {
          automatic_scheduled_payouts: !automaticPayoutsEnabled
        }
      );

      setUser(response.data.data);

      toast({
        title: "Sukses",
        description: automaticPayoutsEnabled
          ? "Pagesat automatike u çaktivizuan me sukses"
          : "Pagesat automatike u aktivizuan me sukses. Do të procesohen çdo muaj në datën 5.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description:
          error.response?.data?.message ||
          "Gabim në ndryshimin e cilësimeve të pagesave automatike",
      });
    } finally {
      setIsTogglingAutomaticPayouts(false);
    }
  }, [user?._id, automaticPayoutsEnabled, toast, setUser]);

  useEffect(() => {
    if (user?._id) {
      checkUserPayoutStatus();
    }
  }, [checkUserPayoutStatus]);

  useEffect(() => {
    if (user?._id && month && year) {
      getDebtsByMonth();
      getPayouts();
    }
  }, [getDebtsByMonth, getPayouts]);

  const handleSetMonth = useCallback((selectedMonth: string) => {
    setMonth(selectedMonth);
  }, []);

  const handleSetYear = useCallback((selectedYear: string) => {
    setYear(selectedYear);
  }, []);

  const handleSort = useCallback((column: keyof IDebt) => {
    setSortColumn((prevColumn) => {
      if (column === prevColumn) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return prevColumn;
      } else {
        setSortDirection("asc");
        return column;
      }
    });
  }, []);

  const handlePaymentRequest = useCallback(async () => {
    if (!selectedDebt || !user?._id) return;

    try {
      await axios.post(`${API_URL}/payouts/create`, {
        operator_id: user._id,
        requested_amount_in_cents: Math.round(selectedDebt.debt * 100),
        notes: notes.trim(),
        year,
        month,
      });

      toast({
        title: "Sukses",
        description: "Kërkesa për pagesë u dërgua me sukses",
      });

      setIsModalOpen(false);
      setNotes("");
      setSelectedDebt(null);
      getPayouts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description:
          error.response?.data?.message ||
          "Gabim në dërgimin e kërkesës për pagesë",
      });
    }
  }, [selectedDebt, user?._id, notes, year, month, toast, getPayouts]);

  const handleOpenModal = useCallback((debt: IDebt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setNotes("");
    setSelectedDebt(null);
  }, []);

  const renderSkeletonRow = () => (
    <TableRow className="border-gray-100">
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
  );

  const renderPayoutStatus = useCallback(
    (debt: IDebt) => {
      if (isPayoutSent && payouts[0]) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm font-medium">
              Kërkesa e Dërguar
            </span>
            <Link
              href={`/payouts/${payouts[0]._id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors"
            >
              Shiko Pagesën
            </Link>
          </div>
        );
      }

      if (automaticPayoutsEnabled) {
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Pagesat automatike aktive</span>
            </div>
            <Button
              onClick={toggleAutomaticPayouts}
              disabled={isTogglingAutomaticPayouts}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {isTogglingAutomaticPayouts ? "Duke ndryshuar..." : "Çaktivizo"}
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenModal(debt)}
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            size="sm"
            disabled={automaticPayoutsEnabled}
          >
            Kërko Pagesë
          </Button>
          <Button
            onClick={toggleAutomaticPayouts}
            disabled={isTogglingAutomaticPayouts}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            {isTogglingAutomaticPayouts ? "Duke aktivizuar..." : "Aktivizo automatike"}
          </Button>
        </div>
      );
    },
    [isPayoutSent, payouts, handleOpenModal, automaticPayoutsEnabled, toggleAutomaticPayouts, isTogglingAutomaticPayouts]
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-8">
        {/* Automatic Payouts Status Alert */}
        <Alert className={`border-l-4 ${automaticPayoutsEnabled
          ? 'border-l-green-500 bg-green-50'
          : 'border-l-blue-500 bg-blue-50'}`}>
          {automaticPayoutsEnabled ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Info className="h-4 w-4 text-blue-600" />
          )}
          <AlertTitle className={`${automaticPayoutsEnabled ? 'text-green-800' : 'text-blue-800'}`}>
            {automaticPayoutsEnabled ? 'Pagesat Automatike të Aktivizuara' : 'Pagesat Manuale Aktive'}
          </AlertTitle>

          <AlertDescription className={`${automaticPayoutsEnabled ? 'text-green-700' : 'text-blue-700'}`}>
            {automaticPayoutsEnabled
              ? 'Pagesat tuaja do të procesohen automatikisht çdo muaj në datën 5. Ju nuk keni nevojë të kërkoni pagesa manuale.'
              : 'Aktualisht keni pagesat manuale. Duhet të kërkoni pagesa manualisht ose të aktivizoni pagesat automatike për të marrë pagesa çdo muaj në datën 5.'}
          </AlertDescription>
        </Alert>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Borxhet Mujore të Papaguara
            </CardTitle>
            <CardDescription className="text-gray-600">
              Zgjidh një muaj dhe vit për të parë borxhet që ju detyrohen
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap gap-2">
                {MONTHS.map((monthObj) => (
                  <Button
                    key={monthObj.value}
                    onClick={() => handleSetMonth(monthObj.value)}
                    variant={month === monthObj.value ? "default" : "outline"}
                    className={
                      month === monthObj.value
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {monthObj.label}
                  </Button>
                ))}
                <Select onValueChange={handleSetYear} value={year}>
                  <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 hover:bg-gray-50">
                    <SelectValue placeholder="Zgjidh Vitin" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {YEARS.map((yearOption) => (
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
              Detajet e Borxhit
            </CardTitle>
            <CardDescription className="text-gray-600">
              {month && year
                ? `Borxhet për ${selectedMonthLabel} ${year}`
                : "Zgjidh një muaj dhe vit për të parë borxhet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingDebts ? (
              <div className="p-6">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kompania
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shuma
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veprimet
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: LOADING_SKELETON_ROWS }).map(
                      (_, i) => (
                        <React.Fragment key={i}>
                          {renderSkeletonRow()}
                        </React.Fragment>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : sortedDebts.length > 0 ? (
              <div className="overflow-hidden rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("operator")}
                          className="text-xs text-gray-500 uppercase tracking-wider hover:bg-transparent p-0 h-auto font-medium"
                        >
                          Kompania
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("debt")}
                          className="text-xs  text-gray-500 uppercase tracking-wider hover:bg-transparent p-0 h-auto font-medium"
                        >
                          Shuma
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veprimet
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
                        <TableCell>{renderPayoutStatus(debt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <CalendarIcon className="h-12 w-12 text-gray-300" />
                  <p className="text-lg font-medium">
                    {month && year
                      ? "Nuk u gjetën borxhe për muajin dhe vitin e zgjedhur"
                      : "Zgjidh një muaj për të parë borxhet"}
                  </p>
                  {!month && (
                    <p className="text-sm text-gray-400">
                      Zgjidhni një muaj nga butonat më sipër
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Kërkesë për Pagesë
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="period"
                  className="text-right text-gray-700 font-medium"
                >
                  Periudha:
                </Label>
                <Input
                  id="period"
                  value={`${selectedMonthLabel} ${year}`}
                  className="col-span-3 border-gray-300 text-gray-800 bg-gray-50"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="amount"
                  className="text-right text-gray-700 font-medium"
                >
                  Shuma:
                </Label>
                <Input
                  id="amount"
                  value={
                    selectedDebt
                      ? `${formatCurrency(selectedDebt.debt)} ${SYMBOLS.EURO}`
                      : ""
                  }
                  className="col-span-3 border-gray-300 text-gray-800 bg-gray-50"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="notes"
                  className="text-right text-gray-700 font-medium"
                >
                  Shënime:
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3 border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Shtoni shënime shtesë (opsionale)"
                  maxLength={200}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Anulo
              </Button>
              <Button
                onClick={handlePaymentRequest}
                className="bg-gray-900 text-white hover:bg-gray-800"
                disabled={!selectedDebt}
              >
                Dërgo Kërkesën
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default SalesPage;
