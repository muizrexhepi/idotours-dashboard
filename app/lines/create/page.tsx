"use client"

import RouteForm from "@/components/forms/create-route-form";
import RoutesTable from "@/components/routes/RoutesTable";
import { useUser } from "@/context/user";
import { API_URL } from "@/environment";
import { Route } from "@/models/route";
// import { Station } from "@/models/station";
import axios from "axios";
import { useEffect, useState } from "react";

export default  function CreateLine() {
  const {user} = useUser();
  const [routes, setRoutes] = useState<Route[]>([]);
  // const [stations, setStations] = useState<Station[]>([]);
 
  const getAll = async () => {
    try {
      const operator_id = user?.$id;
    
      // const stationsResponse = await axios.get(
      //   `${API_URL}/station/operator/${operator_id}?select=name city country address code`
      // );
      // setStations(stationsResponse.data?.data);
    
      const routesResponse = await axios.get(
        `${API_URL}/route/operator/${user?.$id}`
      );
      setRoutes(routesResponse.data?.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(user) {
      getAll();
    }
  }, [user])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-10">
      <h1 className="text-2xl font-bold mb-6">Route Management</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* <div className="w-full lg:w-1/3">
          <RouteForm stations={stations.reverse()} />
        </div> */}
        <div className="w-full lg:w-2/3">
          <RoutesTable routes={routes.reverse()} />
        </div>
      </div>
    </div>
  );
}
