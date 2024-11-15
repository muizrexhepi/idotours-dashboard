import { Booking } from "./booking";

export interface Driver {
    _id: string;
    name: string;
    email: string;
    oprtator: string;
    assigned_routes: [
        {
            route: string,
            label: string;
        },
    ];
    scanned_bookings: Booking[];
}


