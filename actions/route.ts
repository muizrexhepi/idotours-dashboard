import apiClient from "@/lib/axios"; // Adjust path to where your apiClient is exported
import { Route } from "@/models/route";
import { revalidatePath } from "next/cache";

export async function deleteRoute(route_id: string) {
  try {
    const res = await apiClient.post(`/route/delete/${route_id}`);
    if (typeof window === "undefined") {
      revalidatePath("/lines/create");
    }
    return res?.data?.message;
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
}

export async function createRoute(route: Route, operator_id: string) {
  try {
    const payload = {
      code: route.code,
      contact: route.contact,
      stations: route.stations,
      destination: route.destination,
      luggages: route.luggages,
      is_active: route.is_active,
      generate_tickets_automatically: route.generate_tickets_automatically,
      metadata: route.metadata,
    };

    const res = await apiClient.post(`/route/create/${operator_id}`, payload);
    if (typeof window === "undefined") {
      revalidatePath("/lines/create");
    }
    return res?.data?.message;
  } catch (error) {
    console.error("Error creating route:", error);
    throw new Error("Failed to create route");
  }
}

// NEW: Fetch lines for the operator
export async function getOperatorRoutes(operator_id: string) {
  try {
    const res = await apiClient.get(`/route/operator/${operator_id}`);
    return res?.data?.data as Route[];
  } catch (error) {
    console.error("Error fetching operator routes:", error);
    throw error;
  }
}
