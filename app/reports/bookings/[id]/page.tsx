"use client"

import React, { useEffect, useState } from 'react'
import { getBookingByIdWithChargeData } from '@/actions/bookings'
import { CreditCardIcon, MapPinIcon, UserIcon, ClockIcon, BusIcon, BuildingIcon, PhoneIcon, MailIcon, CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Passenger } from '@/models/passenger'
import moment from "moment-timezone"
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SYMBOLS } from '@/lib/data'
import { useUser } from '@/context/user'
import { Booking } from '@/models/booking'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/environment'

const BookingDetailsPage = ({ params }: { params: { id: string } }) => {
  const { user } = useUser();
  const router = useRouter()
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking>()

  const auth_id = searchParams.get("auth_id");
  const origin = searchParams.get("origin");

  const fetchBooking = async () => {
    try {
      if (params.id) {
        const b = await getBookingByIdWithChargeData(params.id);
        setBooking(b)
        console.log({ booking: b })
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!user) {
      console.log("ska user", auth_id, origin)
      if (auth_id !== "super_admin" && origin !== "billbord") {
        return router.back();
      }
    }

    fetchBooking();
  }, [user])

  const downloadPdf = async (id: string) => {
    try {
      if (typeof window == "undefined") return;

      const response = await axios({
        method: 'post',
        url: `${API_URL}/booking/download/pdf/e-ticket/${id}`,
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id}.pdf`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <h2 className="mt-4 text-2xl font-bold">Rezervimi nuk u gjet</h2>
            <p className="mt-2 text-center ">We couldn&apos;t find the booking you&apos;re looking for. Please check the booking ID and try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const departureDate = moment.utc(booking.departure_date).format("dddd, DD-MM-YYYY");

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {booking?.test_mode && <Alert variant={"destructive"} className='my-4'>
          Ky rezervim është vetëm një test dhe përdoret ekskluzivisht për qëllime demonstrimi.
        </Alert>}
        <Button className='mb-2' onClick={() => downloadPdf(booking._id)}>Download</Button>
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Detajet e rezervimit</h1>
                <p className="text-sm opacity-80">ID: {booking._id}</p>

              </div>
              <Badge className="text-lg py-1 px-3">
                {booking.is_paid ? "Paguar" : "Pa paguar"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BusIcon className="mr-2" />
                      Informacionet e udhetimit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="items-center flex flex-col space-x-2">
                        <MapPinIcon className="text-primary" />
                        <span className="font-semibold">Nisja : {booking?.labels?.from_city}</span>
                        <span className="text-sm ">{booking?.destinations?.departure_station_label}</span>
                      </div>
                      <div className=" flex flex-col items-center space-x-2">
                        <MapPinIcon className="text-primary" />
                        <span className="font-semibold">Mberritja : {booking?.labels?.to_city}</span>
                        <span className="text-sm">{booking?.destinations?.arrival_station_label}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="text-primary" />
                      <span>{departureDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="text-primary" />
                      <span>{moment.utc(booking?.departure_date).format("HH:mm")}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Origjina : {booking?.platform}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserIcon className="mr-2" />
                      Informacionet e pasagjerit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {booking?.passengers?.map((passenger: Passenger, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <UserIcon className="mr-2" />
                            Pasagjeri {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Emri:</span>
                            <span>{passenger?.full_name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Emaili:</span>
                            <span>{passenger?.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Tel:</span>
                            <span>{passenger?.phone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Cmimi:</span>
                            <Badge variant="secondary">${passenger?.price?.toFixed(2)}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCardIcon className="mr-2" />
                      Informacionet e pageses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Cmimi total:</span>
                      <span className="text-2xl font-bold">${booking?.price?.toFixed(2)}</span>
                    </div>
                    {booking?.charge && (
                      <>
                        <div className="space-y-2">
                          <div className="font-semibold">Detajet e tarifës:</div>
                          <div className="flex justify-between">
                            <span>Shuma e ngarkuar:</span>
                            <span>${(booking?.price).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tarifa e Shërbimit GoBusly:</span>
                            <span>${(booking?.service_fee)?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fitimi juaj:</span>
                            <span>
                              {SYMBOLS.EURO} {(booking?.price - (booking?.service_fee || 0)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valuta:</span>
                            <span>{booking?.charge?.currency?.toUpperCase() || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Metoda e pageses:</span>
                            <div className="flex items-center space-x-2">
                              <CreditCardIcon className="text-primary" />
                              <span>{booking?.charge?.payment_method_details?.card?.brand?.toUpperCase()} **** {booking?.charge?.payment_method_details?.card?.last4}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PhoneIcon className="mr-2" />
                      Informacionet e kontaktit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MailIcon className="text-primary" />
                      <span>{booking.passengers[0].email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="text-primary" />
                      <span>{booking.passengers[0].phone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Të dhënat meta të rezervimit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm ">ID e tarifës:</span>
                      <span className="font-mono text-xs p-1 rounded">{booking.charge?.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm ">ID-ja e qëllimit të pagesës</span>
                      <span className="font-mono text-xs p-1 rounded">{booking.metadata.payment_intent_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Link href={booking.charge?.receipt_url!} target='_blank' className="text-sm  underline">Klikoni këtu për të parë faturën</Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BookingDetailsPage