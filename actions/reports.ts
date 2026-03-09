import apiClient from "@/lib/axios";

export interface PassengerManifestPassenger {
  full_name: string;
  phone: string;
  email: string;
  price: number;
  age?: string;
  birthdate?: string;
  created_at?: string;
}

export interface PassengerManifestEntry {
  ticket_id: string;
  route_code: string;
  route: string;
  departure_time: string;
  departure_date: string;
  starting_station: string;
  passengers: PassengerManifestPassenger[];
}

export const getPassengerManifest = async (
  operator_id: string,
  date?: string,
): Promise<PassengerManifestEntry[]> => {
  try {
    const res = await apiClient.get(
      `/operator/reports/passenger-manifest/${operator_id}`,
      { params: date ? { date } : {} },
    );
    return res?.data?.data as PassengerManifestEntry[];
  } catch (error) {
    console.error("Manifest Fetch Error:", error);
    return [];
  }
};
