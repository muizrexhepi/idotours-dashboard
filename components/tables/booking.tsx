'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Booking } from '@/models/booking'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Laptop, Smartphone, Globe, Loader2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface BookingsTableProps {
  bookings: Booking[]
  isLoading?: boolean
}

export default function BookingsTable({ bookings, isLoading }: BookingsTableProps) {
  const router = useRouter()

  const getById = async (id: string) => {
    router.push(`/reports/bookings/${id}`)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'web':
        return <Globe className="h-4 w-4" />
      case 'ios':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Laptop className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (bookings?.length === 0) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-lg">No bookings found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px] font-semibold">Passenger</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">From</TableHead>
              <TableHead className="font-semibold">To</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Platform</TableHead>
              <TableHead className="font-semibold">Paid</TableHead>
              <TableHead className="text-right font-semibold">Route</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map((booking, index) => (
              <TableRow
                key={index}
                onClick={() => getById(booking._id)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">{booking.passengers[0]?.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{booking.passengers[0]?.email}</TableCell>
                <TableCell className="text-muted-foreground">{booking.passengers[0]?.phone}</TableCell>
                <TableCell>{booking.labels?.from_city}</TableCell>
                <TableCell>{booking.labels?.to_city}</TableCell>
                <TableCell className="font-semibold">${booking.price?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={booking.platform === 'web' ? 'default' : booking.platform === 'ios' ? 'secondary' : 'outline'}
                    className="flex items-center gap-1"
                  >
                    {getPlatformIcon(booking.platform)}
                    {booking.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={booking.is_paid ? "default" : "destructive"} className="font-semibold">
                    {booking.is_paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{booking.route?.toString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}