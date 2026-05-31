import apiClient from "@/lib/axios";
import type { Booking } from "@/models/booking";

export interface IAgencyPassenger {
  full_name: string;
  phone: string;
  email: string;
  price: number;
  birthdate?: string;
}

export interface IAgencyBookingPayload {
  passengers: IAgencyPassenger[];
  total_price: number;
  stop?: {
    departure_date: string;
    from?: { city: string };
    to?: { city: string };
  };
  departure_station: string;
  arrival_station: string;
  departure_station_label: string;
  arrival_station_label: string;
  location?: any;
  language?: string;
  is_paid?: boolean;
}

export const createAgencyBooking = async (
  agency_id: string,
  ticket_id: string,
  payload: IAgencyBookingPayload,
): Promise<Booking | null> => {
  try {
    const res = await apiClient.post(
      `/booking/create-agency/${agency_id}/${ticket_id}`,
      payload,
    );
    return res?.data?.data as Booking;
  } catch (error: any) {
    console.error("Agency Booking Error:", error);
    throw error;
  }
};

export const getAgencyBookings = async (
  agency_id: string,
  page = 1,
  limit = 10,
): Promise<Booking[]> => {
  try {
    const res = await apiClient.get(`/booking/agency/${agency_id}`, {
      params: { page, limit },
    });
    return res?.data?.data as Booking[];
  } catch (error) {
    console.error("Agency Bookings Fetch Error:", error);
    return [];
  }
};

export const getAgencyBookingCount = async (
  agency_id: string,
): Promise<number> => {
  try {
    const res = await apiClient.get(`/booking/count/operator/${agency_id}`);
    return res?.data?.data ?? 0;
  } catch {
    return 0;
  }
};

export interface IMonthlyReport {
  year: number;
  month: number;
  total_sales: number;
  booking_count: number;
  profit: number;
  debt: number;
}

export const getAgencyMonthlyReport = async (
  agency_id: string,
): Promise<IMonthlyReport[]> => {
  try {
    const res = await apiClient.get(`/agency/${agency_id}/monthly-report`);
    return res?.data?.data as IMonthlyReport[];
  } catch (error) {
    console.error("Monthly Report Error:", error);
    return [];
  }
};
