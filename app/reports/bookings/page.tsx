"use client";
import { useState, useEffect } from "react";
import type { Booking } from "@/models/booking";
import BookingsTable from "@/components/tables/booking";
import {
  getBookingsByOperatorId,
  getTotalCountByOperatorId,
} from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface IBookingByOperatorInterface {
  data: Booking[];
  total_count: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;
  const { user } = useUser();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const result = await getBookingsByOperatorId(
          user?._id!,
          page,
          itemsPerPage
        );
        if (result) {
          const total_count = await getTotalCountByOperatorId(user?._id);
          setBookings(result);
          setTotalCount(total_count);
          setTotalPages(Math.ceil(total_count / itemsPerPage));
        }
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [page, user]);

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          onClick={() => setPage(i)}
          disabled={isLoading}
          className={
            page === i
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Bookings (Sales)
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage and view all your bookings in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <BookingsTable bookings={bookings} isLoading={isLoading} />
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePreviousPage}
                  disabled={page === 1 || isLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
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
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * itemsPerPage + 1} -{" "}
                {Math.min(page * itemsPerPage, totalCount)} of {totalCount}{" "}
                bookings
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
