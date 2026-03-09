import apiClient from "@/lib/axios";
import type { Booking } from "@/models/booking";

export interface IRevenueData {
  revenue: number;
  total_passengers: number;
}

export interface ITopRoute {
  total_views: number;
  from_station: string;
  to_station: string;
  _id: {
    from: string;
    to: string;
  };
}

export interface IAnalyticsResponse {
  revenueData: IRevenueData[];
  topRoute: ITopRoute[];
  this_months_revenue: { revenue: number }[];
}

export const getOperatorAnalytics = async (
  operator_id: string,
): Promise<IAnalyticsResponse | null> => {
  try {
    const res = await apiClient.get(`/operator/reports/revenue/${operator_id}`);
    return res?.data?.data as IAnalyticsResponse;
  } catch (error) {
    console.error("Analytics Error:", error);
    return null;
  }
};

export const getLastFiveBookings = async (
  operator_id: string,
): Promise<Booking[]> => {
  try {
    const res = await apiClient.get(
      `/operator/reports/last-five-bookings/${operator_id}`,
    );
    return res?.data?.data as Booking[];
  } catch (error) {
    console.error("Last Five Bookings Error:", error);
    return [];
  }
};
