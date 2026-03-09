import apiClient from "@/lib/axios";
import { Booking } from "@/models/booking";

export const getBookingsByOperatorId = async (
  operator_id: string,
  page?: number,
  limit?: number,
) => {
  try {
    const res = await apiClient.get(`/booking/operator/${operator_id}`, {
      params: { page: page || 1, limit: limit || 10 },
    });
    return res?.data?.data as Booking[];
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};

export const getTotalCountByOperatorId = async (operator_id: string) => {
  try {
    const res = await apiClient.get(`/booking/count/operator/${operator_id}`);
    return res?.data?.data;
  } catch (error) {
    console.error("Count Error:", error);
  }
};

export const getBookingsWithId = async (
  ids: string,
  page?: number,
  limit?: number,
) => {
  try {
    const res = await apiClient.get(`/booking/ids/${ids}`, {
      params: { page, limit },
    });
    return res?.data?.data as Booking[];
  } catch (error) {
    console.error("ID Fetch Error:", error);
  }
};

export const getBookingByIdWithChargeData = async (booking_id: string) => {
  try {
    const res = await apiClient.get(
      `/booking/operator/with_charge/${booking_id}`,
    );
    return res?.data?.data as Booking;
  } catch (error) {
    console.error("Charge Data Error:", error);
  }
};

export interface IManualPassenger {
  full_name: string;
  phone: string;
  email: string;
  price: number;
  birthdate?: string;
}

export interface IManualBookingPayload {
  ticket_id: string;
  passengers: IManualPassenger[];
  total_price: number;
  departure_date: string;
  departure_station: string;
  arrival_station: string;
  departure_station_label: string;
  arrival_station_label: string;
  from_city: string;
  to_city: string;
  is_paid: boolean;
}

export const createManualBooking = async (
  payload: IManualBookingPayload,
): Promise<Booking | null> => {
  try {
    const res = await apiClient.post("/booking/create-manual", payload);
    return res?.data?.data as Booking;
  } catch (error: any) {
    console.error("Manual Booking Error:", error);
    throw error;
  }
};
