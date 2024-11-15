"use client"

import { API_URL } from '../../../environment'
import { useEffect, useState } from 'react'
import axios, { AxiosResponse } from 'axios'
import { Button } from '../../../components/ui/button'
import { CalendarIcon, ArrowUpDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {SYMBOLS} from '../../Symbols';
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/context/user'

export interface IDebt {
  operator: string
  debt: number
  _id: string
}

type SortDirection = 'asc' | 'desc'

const Page = () => {
  const [debts, setDebts] = useState<IDebt[]>([])
  const [month, setMonth] = useState<string>('')
  const [year, setYear] = useState<string>('2024')
  const [sortColumn, setSortColumn] = useState<keyof IDebt>('operator')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const {toast} = useToast()

    const {user} = useUser();

  const getDebtsByMonth = async () => {
    try {
        const operator_id = user?.$id;
        const response: AxiosResponse = await axios.get(`${API_URL}/operator/reports/debt/owed/${operator_id}?month=${month}&year=${year}`)
        setDebts(response.data.data)
        console.log(response.data.data)
    } catch (err: any) {
        toast({
            variant: "default",
            description: err.response.data.message
        })
        console.log(err)
    }
  }

  useEffect(() => {
    if(user) {
      getDebtsByMonth()
    }
  }, [month, user])

  const handleSetMonth = (selectedMonth: string) => {
    console.log({ selectedMonth })
    setMonth(selectedMonth)
  }

  const handleSetYear = (selectedYear: string) => {
    console.log({ selectedYear })
    setYear(selectedYear)
  }

  const handleSort = (column: keyof IDebt) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedDebts = [...debts].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const years: string[] = ["2024", "2025", "2026", "2027"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">Busly Monthly Debt Owed to You</h1>
    <div className="mb-6 flex flex-wrap items-center gap-4">
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
        </div>
        <Select onValueChange={handleSetYear} value={year}>
          <SelectTrigger className="w-[180px]" defaultValue={years[0]}>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years?.map((yearOption) => (
              <SelectItem key={yearOption} value={yearOption}>
                {yearOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sortedDebts.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                <th className="py-3 px-4 font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('operator')}
                    className="hover:bg-gray-200"
                  >
                    Operator
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('debt')}
                    className="hover:bg-gray-200"
                  >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDebts?.map((debt: IDebt) => (
                <tr key={debt?._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{debt?.operator}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {debt?.debt?.toFixed(2)} {SYMBOLS.EURO}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {month ? "No debts found for the selected month and year." : "Please select a month to view debts."}
        </div>
      )}
    </div>
  )
}


export default Page;