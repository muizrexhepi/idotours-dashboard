"use client"

import CityForm from "@/components/forms/create-city-form";
import StationsTable from "@/components/stations/StationsTable";
import { useUser } from "@/context/user";
import { API_URL } from "@/environment";
import { Station } from "@/models/station";
import axios from "axios";
import { useEffect, useState } from "react";

export default  function CityCreate() {
  const {user} = useUser();
  const [stations, setStations] = useState<Station[]>([])

  const getAll = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/station/operator/${user?.$id}?select=name city country address code`
      );
      setStations(response.data.data)
      
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(user) { 
      getAll()
    }
  }, [user])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-10">
      <h1 className="text-2xl font-bold mb-6">Station Management</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <CityForm />
        </div>
        <div className="w-full lg:w-2/3">
          <StationsTable stations={stations.reverse()} />
        </div>
      </div>
    </div>
  );
}
