"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  DollarSign,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Receipt,
  Shield,
  Hash
} from "lucide-react"
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
  const [payoutHash, setPayoutHash] = useState<string>("")

  // Generate SHA-256 hash of payout data
  const generatePayoutHash = async (payoutData: Payout): Promise<string> => {
    try {
      const dataString = JSON.stringify({
        id: payoutData._id,
        operator_id: payoutData.operator_id,
        requested_amount: payoutData.requested_amount_in_cents,
        paid_amount: payoutData.paid_amount_in_cents,
        status: payoutData.payment_status,
        period: payoutData.time_period,
        created: payoutData.createdAt,
        transaction_id: payoutData.transaction_d || "",
        confirmed: payoutData.is_confirmed_by_gobusly
      })

      const encoder = new TextEncoder()
      const data = encoder.encode(dataString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex.toUpperCase()
    } catch (error) {
      return "ERROR-GENERATING-HASH"
    }
  }

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const response = await fetch(`${API_URL}/payouts/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch payout")
        }
        const data = await response.json()
        setPayout(data.data)

        // Generate hash for payout data
        const hash = await generatePayoutHash(data.data)
        setPayoutHash(hash)
      } catch (err) {
        setError("Gabim në marrjen e detajeve të pagesës")
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
    return <ErrorDisplay message="Pagesa nuk u gjet" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case "pending": return <Clock className="h-5 w-5 text-amber-600" />
      case "failed": return <XCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "E Paguar"
      case "pending": return "Në Pritje"
      case "failed": return "Dështuar"
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Fatura e Pagesës</h1>
          <p className="text-sm text-gray-500 mt-1">Detajet e Transaksionit</p>
        </div>

        {/* Main Transaction Card */}
        <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden mb-4">
          {/* Status Banner */}
          <div className={`h-2 ${payout.payment_status === "paid" ? "bg-emerald-500" :
              payout.payment_status === "pending" ? "bg-amber-500" : "bg-red-500"
            }`} />

          <CardContent className="p-6">
            {/* Amount Section */}
            <div className="text-center border-b pb-6 mb-6">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(payout.payment_status)}
                <span className={`ml-2 text-sm font-medium ${payout.payment_status === "paid" ? "text-emerald-600" :
                    payout.payment_status === "pending" ? "text-amber-600" : "text-red-600"
                  }`}>
                  {getStatusText(payout.payment_status)}
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {formatCurrency(payout.paid_amount_in_cents)}
              </div>
              {payout.requested_amount_in_cents !== payout.paid_amount_in_cents && (
                <div className="text-sm text-gray-500">
                  Kërkuar: {formatCurrency(payout.requested_amount_in_cents)}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                Pagesa e {payout.time_period.month} {payout.time_period.year}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <DetailRow
                label="Numri i Referencës"
                value={payout._id}
                icon={<ClipboardCheck className="h-4 w-4 text-gray-400" />}
                copyable
              />

              <DetailRow
                label="Hash-i i Pagesës"
                value={payoutHash}
                icon={<Hash className="h-4 w-4 text-blue-500" />}
                copyable
                isHash
              />

              {payout.transaction_d && (
                <DetailRow
                  label="ID e Transaksionit"
                  value={payout.transaction_d}
                  icon={<Receipt className="h-4 w-4 text-gray-400" />}
                  copyable
                />
              )}

              <Separator className="my-4" />

              <DetailRow
                label="ID e Operatorit"
                value={payout.operator_id}
                icon={<Building2 className="h-4 w-4 text-gray-400" />}
              />

              <DetailRow
                label="E Krijuar"
                value={new Date(payout.createdAt).toLocaleDateString('sq-AL', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                icon={<CalendarIcon className="h-4 w-4 text-gray-400" />}
              />

              {payout.paid_at && (
                <DetailRow
                  label="E Përfunduar"
                  value={new Date(payout.paid_at).toLocaleDateString('sq-AL', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                />
              )}

              {/* Verification Status */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Verifikimi i Gobusly</span>
                </div>
                <Badge variant={payout.is_confirmed_by_gobusly ? "default" : "secondary"} className="text-xs">
                  {payout.is_confirmed_by_gobusly ? "E Verifikuar" : "Në Pritje"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        {payout.notes && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                Shënime Shtesë
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 p-4 rounded-xl">
                {payout.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="bg-white border border-blue-100 rounded-2xl p-4 mt-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <p className="font-medium text-gray-900 mb-1">Siguria e Transaksionit</p>
              <p>Ky hash-i kriptogarfik siguron integritetin e të dhënave të pagesës dhe nuk mund të falsifikohet. Ruajeni këtë faturë për arkivat tuaja.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>© 2025 Gobusly. Të gjitha të drejtat e rezervuara.</p>
          <p className="mt-1">Përpunim i sigurt i transaksioneve</p>
        </div>
      </div>
    </div>
  )
}

// Enhanced Detail Row Component
function DetailRow({
  label,
  value,
  icon,
  copyable = false,
  isHash = false
}: {
  label: string
  value: string
  icon: React.ReactNode
  copyable?: boolean
  isHash?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (copyable) {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const displayValue = isHash && value ? `${value.slice(0, 8)}...${value.slice(-8)}` : value

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center text-sm text-gray-500">
        {icon}
        <span className="ml-2">{label}</span>
      </div>
      <div
        className={`text-sm font-mono ${isHash ? 'text-blue-600' : 'text-gray-900'} ${copyable ? 'cursor-pointer hover:text-blue-600' : ''} ${isHash ? 'font-medium' : 'font-normal'}`}
        onClick={handleCopy}
        title={copyable ? (isHash ? `Kliko për të kopjuar hash-in e plotë: ${value}` : 'Kliko për të kopjuar') : ''}
      >
        {copied ? "U Kopjua!" : displayValue}
      </div>
    </div>
  )
}

// Enhanced Status Badge
function StatusBadge({ status }: { status: "pending" | "paid" | "failed" }) {
  const statusConfig = {
    pending: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Clock className="h-3 w-3" />,
      text: "Në Pritje"
    },
    paid: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: "E Paguar"
    },
    failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <XCircle className="h-3 w-3" />,
      text: "Dështuar"
    },
  }

  const config = statusConfig[status]

  return (
    <Badge className={`${config.color} border flex items-center gap-1 px-3 py-1`}>
      {config.icon}
      <span className="font-medium">{config.text}</span>
    </Badge>
  )
}

// Enhanced Skeleton
function PayoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-gray-200" />
          <CardContent className="p-6">
            <div className="text-center border-b pb-6 mb-6">
              <Skeleton className="h-12 w-40 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>

            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Enhanced Error Display
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gabim në Transaksion</h3>
          <p className="text-red-600 text-sm">{message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Provo Përsëri
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Currency Formatter
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100)
}
