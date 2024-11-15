import { API_URL } from "@/environment";
import { Booking } from "@/models/booking";
import axios from "axios";


export const getBookingsByOperatorId = async (operator_id: string, page?: number, limit?: number, select?: string) => {
    try {
        const res = await axios.get(`${API_URL}/booking/operator/${operator_id}?page=${page || 1}&limit=${limit || 10}`);
        return res?.data?.data as Booking[];
    } catch (error) {
        console.log(error);
        // throw new Error("Error fetching bookings");
    }
};

export const getTotalCountByOperatorId = async (operator_id: string) => {
    try {
        const res = await axios.get(`${API_URL}/booking/count/operator/${operator_id}`);
        return res?.data?.data;
    } catch (error) {
        console.log(error);
    }
}

export const getBookingsWithId = async (ids: string, page?: number, limit?: number) => {
    try {
        console.log({ids})
        const res = await axios.get(`${API_URL}/booking/ids/${ids}?page=${page}&limit=${limit}`);
        console.log(res.data.data);
        return res?.data?.data as Booking[];
    } catch (error) {
        console.log(error);
        // throw new Error("Error fetching bookings");
    }
};

export const getBookingByIdWithChargeData = async (booking_id: string, page?: number, limit?: number) => {
    try {
        const res = await axios.get(`${API_URL}/booking/operator/with_charge/${booking_id}`);
        console.log(res.data.data);
        return res?.data?.data as Booking;
    } catch (error) {
        console.log(error);
    }
};


