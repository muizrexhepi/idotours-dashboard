import { API_URL } from "@/environment";
import { Agency } from "@/models/agency";
import axios from "axios";
import { revalidatePath } from "next/cache";


export const createAgency = async (agency: Agency, operator_id: string) => {
    try {
        const res = await axios.post(`${API_URL}/agency/create/${operator_id}`, {agency});
        
        revalidatePath('agencies/create')
        return res?.data?.message;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to create agency");
    }
}

export const deleteAgency = async (agency_id: string) => {}