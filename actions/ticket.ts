import apiClient from "@/lib/axios";

export async function getCapacityRoutes(params: {
  startDate: string;
  endDate: string;
  line: string;
  operator_id: string;
}) {
  try {
    const res = await apiClient.get(`/ticket/capacity-routes`, { params });
    return res?.data?.data;
  } catch (error) {
    console.error("Error fetching capacity routes:", error);
    throw error;
  }
}

export async function updateTicketSeats(ticketId: string, seats: number) {
  try {
    const res = await apiClient.post(
      `/ticket/update/seats/${ticketId}`,
      { number_of_tickets: seats },
      { params: { seats } },
    );
    return res?.data;
  } catch (error) {
    console.error("Error updating seats:", error);
    throw error;
  }
}

export async function deleteTicketLine(ticketId: string) {
  try {
    const res = await apiClient.post(`/ticket/delete/${ticketId}`);
    return res?.data;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
}

export const deactivateTicket = async (id: string) => {
  try {
    const response = await apiClient.post(`/ticket/deactivate/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error deactivating ticket:", error);
    throw error; // Throwing allows the component to catch and show the error toast
  }
};

export const reactivateTicket = async (id: string) => {
  try {
    const response = await apiClient.post(`/ticket/reactivate/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error reactivating ticket:", error);
    throw error; // Throwing allows the component to catch and show the error toast
  }
};
