"use client";
import { useState, useEffect } from "react";
import { getBookingByIdWithChargeData } from "@/actions/bookings";
import {
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon,
  BusIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Passenger } from "@/models/passenger";
import moment from "moment-timezone";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SYMBOLS } from "@/lib/data";
import { useUser } from "@/context/user";
import type { Booking } from "@/models/booking";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/environment";
import { Skeleton } from "@/components/ui/skeleton";

const BookingDetailsPage = ({ params }: { params: { id: string } }) => {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const auth_id = searchParams.get("auth_id");
  const origin = searchParams.get("origin");

  const fetchBooking = async () => {
    setLoading(true);
    try {
      if (params.id) {
        const b = await getBookingByIdWithChargeData(params.id);
        setBooking(b!);
      }
    } catch (error) {
      console.log(error);
      setBooking(null); // Set booking to null on error to show not found
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      if (auth_id !== "super_admin" && origin !== "billbord") {
        return router.back();
      }
    }
    fetchBooking();
  }, [user, params.id]);

  const downloadPdf = async (id: string) => {
    try {
      if (typeof window == "undefined") return;
      const response = await axios({
        method: "post",
        url: `${API_URL}/booking/download/pdf/e-ticket/${id}`,
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
        <main className="flex flex-1 flex-col gap-8 p-6 md:p-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="p-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
        <main className="flex flex-1 flex-col gap-8 p-6 md:p-8 items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-sm bg-white">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Booking Not Found
              </h2>
              <p className="mt-2 text-gray-600">
                We couldn&apos;t find the booking you&apos;re looking for.
                Please check the booking ID and try again.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const departureDate = moment
    .utc(booking.departure_date)
    .format("dddd, DD-MM-YYYY");

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        {booking?.test_mode && (
          <Alert
            variant="destructive"
            className="my-4 border-red-200 bg-red-50 text-red-700"
          >
            <AlertTitle className="text-red-800">Test Booking</AlertTitle>
            <AlertDescription>
              This booking is for demonstration purposes only and does not
              represent a real transaction.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-900">
            Booking Details
          </h1>
          <Button
            onClick={() => downloadPdf(booking._id)}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Ticket
          </Button>
        </div>

        <Card className="overflow-hidden shadow-sm border-0 bg-white">
          <CardHeader className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Booking ID: {booking._id}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Details for this booking.
                </p>
              </div>
              <Badge
                className={`text-sm font-medium px-3 py-1 ${
                  booking.is_paid
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {booking.is_paid ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <BusIcon className="mr-2 h-5 w-5 text-gray-600" />
                    Trip Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center space-y-1">
                      <MapPinIcon className="text-blue-500 h-5 w-5" />
                      <span className="font-semibold text-sm">
                        Departure: {booking?.labels?.from_city}
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        {booking?.destinations?.departure_station_label}
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <MapPinIcon className="text-blue-500 h-5 w-5" />
                      <span className="font-semibold text-sm">
                        Arrival: {booking?.labels?.to_city}
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        {booking?.destinations?.arrival_station_label}
                      </span>
                    </div>
                  </div>
                  <Separator className="bg-gray-200" />
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="text-gray-500 h-4 w-4" />
                    <span className="text-sm">{departureDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="text-gray-500 h-4 w-4" />
                    <span className="text-sm">
                      {moment.utc(booking?.departure_date).format("HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700 border-gray-300"
                    >
                      Origin: {booking?.platform}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <UserIcon className="mr-2 h-5 w-5 text-gray-600" />
                    Passenger Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking?.passengers?.map(
                    (passenger: Passenger, index: number) => (
                      <Card key={index} className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                            <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
                            Passenger {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Name:</span>
                            <span>{passenger?.full_name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Email:</span>
                            <span>{passenger?.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Phone:</span>
                            <span>{passenger?.phone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Price:</span>
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {SYMBOLS.EURO}
                              {passenger?.price?.toFixed(2)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <CreditCardIcon className="mr-2 h-5 w-5 text-gray-600" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-base">
                      Total Price:
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {SYMBOLS.EURO}
                      {booking?.price?.toFixed(2)}
                    </span>
                  </div>
                  {booking?.charge && (
                    <>
                      <Separator className="bg-gray-200" />
                      <div className="space-y-2 text-sm">
                        <div className="font-semibold text-gray-800">
                          Charge Details:
                        </div>
                        <div className="flex justify-between">
                          <span>Charged Amount:</span>
                          <span>
                            {SYMBOLS.EURO}
                            {(booking?.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gobusly Service Fee:</span>
                          <span>
                            {SYMBOLS.EURO}
                            {booking?.service_fee?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Profit:</span>
                          <span className="font-semibold text-green-600">
                            {SYMBOLS.EURO}{" "}
                            {(
                              booking?.price - (booking?.service_fee || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Currency:</span>
                          <span>
                            {booking?.charge?.currency?.toUpperCase() || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Payment Method:</span>
                          <div className="flex items-center space-x-2">
                            <CreditCardIcon className="text-gray-500 h-4 w-4" />
                            <span className="font-medium">
                              {booking?.charge?.payment_method_details?.card?.brand?.toUpperCase()}{" "}
                              ****{" "}
                              {
                                booking?.charge?.payment_method_details?.card
                                  ?.last4
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <PhoneIcon className="mr-2 h-5 w-5 text-gray-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <MailIcon className="text-gray-500 h-4 w-4" />
                    <span>{booking.passengers[0].email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="text-gray-500 h-4 w-4" />
                    <span>{booking.passengers[0].phone}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Booking Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Charge ID:</span>
                    <span className="font-mono text-xs bg-gray-100 p-1 rounded text-gray-800">
                      {booking.charge?.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Intent ID:</span>
                    <span className="font-mono text-xs bg-gray-100 p-1 rounded text-gray-800">
                      {booking.metadata.payment_intent_id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link
                      href={booking.charge?.receipt_url!}
                      target="_blank"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Receipt
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default BookingDetailsPage;
