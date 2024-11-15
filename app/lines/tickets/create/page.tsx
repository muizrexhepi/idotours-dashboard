"use client"

import { getAllStations, getStationByOperator } from "@/actions/stations";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Station } from "@/models/station";
import { PlusCircle, X, Info } from "lucide-react"
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { API_URL } from "@/environment";
import axios, { AxiosResponse } from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Route } from "@/models/route";
import { useUser } from "@/context/user";



export default function TravelApp() {


    const [allStations, setAllStations] = useState<Station[]>([]);
    const [selectedStations, setSelectedStations] = useState<Station[]>([]);
    const [activeStation, setActiveStation] = useState<Station | null>(null);
    const [stationLines, setStationLines] = useState<{[key: string]: Station[]}>({});
    const [lineData, setLineData] = useState<{[key: string]: {[key: string]: {price: string, childrenPrice: string, duration: string, time: string}}}>({});
    const [isAddingStation, setIsAddingStation] = useState(false);

    const [routeNumber, setRouteNumber] = useState<string>("");
    const [routes, setRoutes] = useState<Route[]>([]);
    const [destination, setDestination] = useState<string>("");
    const [departureTime, setDepartureTime] = useState<string>("09:00");
    const [numberOfTickets, setNumberOfTickets] = useState<number>(6);
    const [weeksToGenerate, setWeeksToGenerate] = useState<number>(1);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
    const [metadata, setMetadata] = useState<{[key: string]: string}>({});

    const {user} = useUser();

    const RouteDropdown = () => (
        <Select onValueChange={(value) => {
            setRouteNumber(value);
        }}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a route" />
            </SelectTrigger>
            <SelectContent>
                {routes?.map((route: Route) => (
                    <SelectItem key={route._id} value={route._id!}>
                        {route.code}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    console.log({routeNumber})

    useEffect(() => {
        if(user) {
            const op_id = user?.$id;
            getAllStations().then((fetchedStations: Station[]) => {
                setAllStations(fetchedStations);
                console.log({stations: fetchedStations})
            })        
        }
    }, [user]);

    const getRoutes = async () => {
        try {
            const res: AxiosResponse = await axios.get(`${API_URL}/route`)
            setRoutes(res.data.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if(user) {
            getRoutes();
        }
    }, [user]);

    const handleInputChange = (stationId: string, lineId: string, field: string, value: string) => {
        setLineData(prev => ({
            ...prev,
            [stationId]: {
                ...prev[stationId],
                [lineId]: {
                    ...prev[stationId]?.[lineId],
                    [field]: value
                }
            }
        }));
    }

    const handleDayChange = (day: number) => {
        setDaysOfWeek(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    }

    const formatStopsData = () => {
        const formattedStops = [];
        for (const stationId in lineData) {
            for (const lineId in lineData[stationId]) {
                const line = lineData[stationId][lineId];
                const station = allStations.find(s => s._id === lineId);
                if (station) {
                    formattedStops.push({
                        station: station._id,
                        price: parseFloat(line.price),
                        children_price: parseFloat(line.childrenPrice),
                        time: line.time,
                        max_buying_time: line.duration 
                    });
                }
            }
        }
        return formattedStops;
    }
    const handleSubmit = async () => {
        const formattedStops = formatStopsData();
    
        const fromStation = selectedStations[0];
        const toStation = selectedStations[selectedStations.length - 1];
    
        const lineDataForBackend = {
            route_number: routeNumber,
            destination: {
                from: fromStation.name,
                to: toStation.name
            },
            time: departureTime,
            stops: formattedStops.map(stop => ({
                from: stop.station,
                to: stop.station, 
                time: stop.time,
                price: stop.price,
                children_price: stop.children_price,
                max_buying_time: stop.max_buying_time
            })),
            number_of_tickets: numberOfTickets,
            metadata: {
                ...metadata,
                operator_name: "Cikidenski cikeden",
                operator_company_name: "Cikidenski cikeden doo",
            },
            days_of_week: ["0", "1"],
            weeks_to_generate: weeksToGenerate
        };
    
        const operator_id = user?.$id;
    
        try {
            console.log({lineDataForBackend})
            const response = await axios.post(`${API_URL}/ticket/create/${operator_id}`, lineDataForBackend);
            console.log("Response from backend:", response.data);
        } catch (error) {
            console.error("Error sending data to backend:", error);
        }
    }

    const removeLine = (stationId: string, lineId: string) => {
        setStationLines(prev => ({
            ...prev,
            [stationId]: prev[stationId].filter(line => line._id !== lineId)
        }));
        setLineData(prev => {
            const newData = { ...prev };
            if (newData[stationId]) {
                delete newData[stationId][lineId];
            }
            return newData;
        });
    }

    const addStation = () => {
        setIsAddingStation(true);
    }

    const selectStation = (station: Station) => {
        if (!selectedStations.find(s => s._id === station._id)) {
            setSelectedStations(prev => [...prev, station]);
            setStationLines(prev => ({
                ...prev,
                [station._id!]: allStations.filter(s => s._id !== station._id)
            }));
            setLineData(prev => ({
                ...prev,
                [station._id!]: {}
            }));
        }
        setIsAddingStation(false);
    }

    const removeStation = (stationId: string) => {
        setSelectedStations(prev => prev.filter(s => s._id !== stationId));
        setStationLines(prev => {
            const newStationLines = { ...prev };
            delete newStationLines[stationId];
            return newStationLines;
        });
        setLineData(prev => {
            const newLineData = { ...prev };
            delete newLineData[stationId];
            return newLineData;
        });
        if (activeStation?._id === stationId) {
            setActiveStation(null);
        }
    }

    return (
        <div className="flex justify-center items-start space-x-8 p-8 bg-gray-100 min-h-screen">
            <Card className="w-80">
                <CardHeader>
                    <CardTitle>cikidenski</CardTitle>
                </CardHeader>
                <CardContent>
                    {isAddingStation ? (
                        <ul className="space-y-4">
                            {allStations?.map((station, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => selectStation(station)}
                                    className="flex items-center space-x-4 p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                                >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{station.city}</p>
                                        <p className="text-sm text-gray-500">{station.name}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-4">
                            {selectedStations.map((station, index) => (
                                <li 
                                    key={index}
                                    className={`${activeStation?._id === station._id && "bg-black/10"} flex items-center justify-between space-x-4 p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors`}
                                >
                                    <div className="flex items-center space-x-4" onClick={() => setActiveStation(station)}>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <div>
                                            <p className="font-semibold">{station.city}</p>
                                            <p className="text-sm text-gray-500">{station.name}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removeStation(station._id!)}
                                        className="h-8 w-8 bg-red-500 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Button className="w-full mt-4" variant="outline" onClick={addStation}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Shto stacion të ri
                    </Button>
                </CardContent>
            </Card>

            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-md">Linjat e mundshme prej në {activeStation?.city} - {activeStation?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {activeStation && stationLines[activeStation._id!]?.map((line) => (
                            <li key={line._id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span>{line.city}</span>
                                    <span className="font-semibold">{line.name}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeLine(activeStation._id!, line._id!)}
                                        className="h-8 w-8 bg-red-500 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Price" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.price || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'price', e.target.value)}
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Children price" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.childrenPrice || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'childrenPrice', e.target.value)}
                                    />
                                    <Input 
                                        type="text" 
                                        placeholder="Start time" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.time || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'time', e.target.value)}
                                    />
                                    <Input 
                                        type="text" 
                                        placeholder="Max buying time" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.duration || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'duration', e.target.value)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full mt-4" onClick={handleSubmit}>
                        Submit
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}