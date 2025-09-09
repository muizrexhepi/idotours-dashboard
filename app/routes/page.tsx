"use client";

import RouteForm from "@/components/forms/create-route-form";
import RoutesTable from "@/components/routes/RoutesTable";
import { useUser } from "@/context/user";
import { API_URL } from "@/environment";
import { Route } from "@/models/route";
// import { Station } from "@/models/station";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateLine() {
  const { user } = useUser();
  const [routes, setRoutes] = useState<Route[]>([]);
  // const [stations, setStations] = useState<Station[]>([]);

  const getAll = async () => {
    try {
      const operator_id = user?._id;

      // const stationsResponse = await axios.get(
      //   `${API_URL}/station/operator/${operator_id}?select=name city country address code`
      // );
      // setStations(stationsResponse.data?.data);

      const routesResponse = await axios.get(
        `${API_URL}/route/operator/${user?._id}`
      );
      setRoutes(routesResponse.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getAll();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lines Management</CardTitle>
          <CardDescription>Manage your lines</CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* <div className="w-full lg:w-1/3">
          <RouteForm stations={stations.reverse()} />
        </div> */}
        <Card>
          <CardContent>
            <RoutesTable routes={routes.reverse()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
