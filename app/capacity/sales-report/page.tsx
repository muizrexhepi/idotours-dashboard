"use client";

import { getBookingsWithId } from '@/actions/bookings';
import BookingsTable from '@/components/tables/booking'
import { Booking } from '@/models/booking';
import { Loader } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

const SalesReportPage = () => {
    const searchParams = useSearchParams();
    const ids = searchParams.get("booking_ids")
    const [bookings, setBookings ] = useState<Booking[]>([])

    const fetchBookings = async () => {
        try {
            const bukilat: any = await getBookingsWithId(ids!);
            console.log({bukilat})
            setBookings(bukilat)
        } catch (error) {
           console.log(error) 
        }
    }
    
    useEffect(()=>{
        fetchBookings();
    }, [])

    return (
        <div>
            <BookingsTable bookings={bookings ? bookings : []} />
        </div>
    )
}

const SalesReport = () => {
    return (
        <Suspense fallback={<Loader className='animate-spin h-10 w-10' />}>
            <SalesReportPage />
        </Suspense>
    )
}

export default SalesReport;
