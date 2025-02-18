"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, DollarSign, ClipboardCheck, AlertCircle } from "lucide-react"
import { API_URL } from "@/environment"

interface Payout {
  _id: string
  operator_id: string
  requested_amount_in_cents: number
  paid_amount_in_cents: number
  payment_status: "pending" | "paid" | "failed"
  time_period: { month: string; year: string }
  paid_at?: string
  reference_umber: string
  notes?: string
  transaction_d?: string
  is_confirmed_by_gobusly?: boolean
  createdAt: string
  updatedAt: string
}

export default function PayoutDetails({ id }: { id: string }) {
  const [payout, setPayout] = useState<Payout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const response = await fetch(`${API_URL}/payouts/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch payout")
        }
        const data = await response.json()
        setPayout(data.data)
      } catch (err) {
        setError("Error fetching payout details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayout()
  }, [id])

  if (isLoading) {
    return <PayoutSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  if (!payout) {
    return <ErrorDisplay message="Payout not found" />
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Payout Details</CardTitle>
          <CardDescription>Payout information for {payout?.reference_umber}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              label="Requested Amount"
              value={formatCurrency(payout?.requested_amount_in_cents)}
            />
            <InfoItem
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              label="Paid Amount"
              value={formatCurrency(payout?.paid_amount_in_cents)}
            />
            <InfoItem
              icon={<CalendarIcon className="h-5 w-5 text-muted-foreground" />}
              label="Time Period"
              value={`${payout?.time_period?.month} ${payout?.time_period?.year}`}
            />
            <InfoItem
              icon={<ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
              label="Status"
              value={<StatusBadge status={payout?.payment_status} />}
            />
            {payout?.paid_at && (
              <InfoItem
                icon={<CalendarIcon className="h-5 w-5 text-muted-foreground" />}
                label="Paid At"
                value={new Date(payout?.paid_at).toLocaleString()}
              />
            )}
            {payout?.transaction_d && (
              <InfoItem
                icon={<ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
                label="Transaction ID"
                value={payout?.transaction_d}
              />
            )}
            <InfoItem
              icon={<ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
              label="Confirmed by Gobusly"
              value={payout?.is_confirmed_by_gobusly ? "Yes" : "No"}
            />
          </div>
          {payout?.notes && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-sm text-muted-foreground">{payout?.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: "pending" | "paid" | "failed" }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  }

  return <Badge className={`${statusColors[status]} capitalize`}>{status}</Badge>
}

function PayoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto bg-red-50">
        <CardContent className="flex items-center justify-center p-6">
          <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
          <p className="text-red-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

