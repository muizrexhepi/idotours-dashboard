import { API_URL } from "@/environment"
import { Route } from "@/models/route"
import axios from "axios"
import { revalidatePath } from "next/cache"

export async function deleteRoute (route_id:string) {
    try {
        const res = await axios.post(`${API_URL}/route/delete/${route_id}`)
        console.log({zi:res?.data?.data})
        revalidatePath('lines/create')
        return res?.data?.message
    } catch (error) {
        console.log(error)
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

        const res = await axios.post(
            `${API_URL}/route/create/${operator_id}`,
            payload
        );

        revalidatePath('lines/create'); 

        return res?.data?.message; 
    } catch (error) {
        console.error("Error creating route:", error);
        throw new Error("Failed to create route"); 
    }
}