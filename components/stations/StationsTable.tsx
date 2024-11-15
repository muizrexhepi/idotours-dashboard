"use client";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Station } from "@/models/station";
import { deleteStation } from "@/actions/stations";
import { toast } from "../ui/use-toast";

const StationsTable = ({ stations }: { stations: Station[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = stations.filter((city) =>
    Object.values(city).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (stationId: string) => {
    await deleteStation(stationId).then((res) => {
      toast({ description: res });
    });
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>City Name</TableHead>
              <TableHead>Station Name</TableHead>
              <TableHead>City Code</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Station Address</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.map((station: Station, index: number) => (
              <TableRow key={index}>
                <TableCell>{station.country}</TableCell>
                <TableCell>{station.name}</TableCell>
                <TableCell>{station.city}</TableCell>
                <TableCell>{station.code}</TableCell>
                <TableCell>
                  <a
                    // href={station.location.lat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Map
                  </a>
                </TableCell>
                <TableCell>{station.address}</TableCell>
                <TableCell>
                  <Trash2
                    className="h-4 w-4 cursor-pointer text-destructive"
                    onClick={() => handleDelete(station._id!)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default StationsTable;
