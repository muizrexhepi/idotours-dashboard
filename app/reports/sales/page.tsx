"use client"

import { useEffect, useState } from "react"
import axios, { type AxiosResponse } from "axios"
import { CalendarIcon, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

import { API_URL } from "@/environment"
import { SYMBOLS } from "@/app/Symbols"
import { useUser } from "@/context/user"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface IDebt {
  operator: string
  debt: number
  _id: string
}

interface IPayout {
  _id: string
  amount: number
  status: string
  // Add other relevant fields
}

type SortDirection = "asc" | "desc"

const Page = () => {
  const [debts, setDebts] = useState<IDebt[]>([])
  const [month, setMonth] = useState<string>("")
  const [year, setYear] = useState<string>("2025")
  const [sortColumn, setSortColumn] = useState<keyof IDebt>("operator")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const { toast } = useToast()
  const { user } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<IDebt | null>(null)
  const [notes, setNotes] = useState("")
  const [payouts, setPayouts] = useState<IPayout[]>([])

  const getDebtsByMonth = async () => {
    try {
      const operator_id = user?.$id
      const response: AxiosResponse = await axios.get(
        `${API_URL}/operator/reports/debt/owed/${operator_id}?month=${month}&year=${year}`,
      )
      setDebts(response.data.data)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "An error occurred",
      })
    }
  }

  const getPayouts = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/payouts/timeperiod/${user?.$id}?month=${month}&year=${year}`
      )
      setPayouts(response.data.data)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch payouts",
      })
    }
  }

  useEffect(() => {
    if (user && month && year) {
      getDebtsByMonth()
      getPayouts()
    }
  }, [user, month, year])

  const handleSetMonth = (selectedMonth: string) => {
    setMonth(selectedMonth)
  }

  const handleSetYear = (selectedYear: string) => {
    setYear(selectedYear)
  }

  const handleSort = (column: keyof IDebt) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedDebts = [...debts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
    return 0
  })

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
  ]
  const years: string[] = ["2025", "2026", "2027", "2028"]

  const handlePaymentRequest = async () => {
    if (!selectedDebt) return;

    try {
      const response = await axios.post(`${API_URL}/payouts/create`, {
        operator_id: user?.$id,
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
      setNotes('');
      getPayouts(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit payment request",
      });
    }
  };

  const isPayoutSent = payouts.length > 0
  console.log({isPayoutSent})
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Charged Debt Owed to You</CardTitle>
          <CardDescription>Select a month and year to view the debts</CardDescription>
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
              ? `Showing debts for ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
              : "Select a month and year to view debts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDebts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("operator")} className="font-bold">
                      Company
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("debt")} className="font-bold">
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("debt")} className="font-bold">
                      Manage
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
                    <TableCell>
                      {isPayoutSent ? (
                        <div>
                          <span className="text-green-500 mr-2">Kerkesa eshte derguar</span>
                          <Link href={`/payouts/${payouts[0]._id}`} className="text-blue-500 hover:underline">
                            Shiko pagesen
                          </Link>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedDebt(debt)
                            setIsModalOpen(true)
                          }}
                        >
                          Kerkese per pagese
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {month ? "No debts found for the selected month and year." : "Please select a month to view debts."}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Period
              </Label>
              <Input
                id="period"
                value={`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                value={selectedDebt ? `${selectedDebt.debt.toFixed(2)} ${SYMBOLS.EURO}` : ''}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePaymentRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Page
