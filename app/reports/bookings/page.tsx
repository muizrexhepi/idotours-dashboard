'use client'

import React, { useState, useEffect } from 'react'
import { Booking } from '@/models/booking'
import BookingsTable from '@/components/tables/booking'
import { getBookingsByOperatorId, getTotalCountByOperatorId } from '@/actions/bookings'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface IBookingByOperatorInterface {
  data: Booking[],
  total_count: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10
  const { user } = useUser()

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      if(user) {
        const result = await getBookingsByOperatorId(user?.$id!, page, itemsPerPage)
        if (result) {
          const total_count = await getTotalCountByOperatorId(user?.$id)
          setBookings(result)
          setTotalCount(total_count)
          setTotalPages(Math.ceil(total_count / itemsPerPage))
        }
      } 
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [page, user])

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages))
  }

  const renderPageButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          onClick={() => setPage(i)}
          disabled={isLoading}
        >
          {i}
        </Button>
      )
    }

    return buttons
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Bookings</CardTitle>
          <CardDescription>Manage and view all your bookings in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} isLoading={isLoading} />
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={page === 1 || isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <div className="flex items-center gap-1">
                {renderPageButtons()}
              </div>
              <Button
                onClick={handleNextPage}
                disabled={page === totalPages || isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, totalCount)} of {totalCount} bookings
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}