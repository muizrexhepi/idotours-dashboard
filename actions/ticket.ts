"use server"

import { API_URL } from "@/environment";
import axios, { AxiosResponse } from "axios";
import { revalidatePath } from "next/cache";

export const deactivateTicket = async (id: string) => {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/ticket/deactivate/${id}`);
      return response.data.data;
    } catch (error) {
      console.log(error)
    }
  }

  export const reactivateTicket = async (id: string) => {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/ticket/reactivate/${id}`);
      return response.data.data;
    } catch (error) {
      console.log(error)
    }
  }