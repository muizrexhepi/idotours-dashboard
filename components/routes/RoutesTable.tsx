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
import { toast } from "../ui/use-toast";
import { Route } from "@/models/route";
import { deleteRoute } from "@/actions/route";

const RoutesTable = ({ routes }: { routes: Route[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutes = routes

  const handleDelete = async (route_id: string) => {
    await deleteRoute(route_id).then((res) => {
      console.log({res})
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
            placeholder="Kerko linja"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kodi</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Nisja</TableHead>
              <TableHead>Mberritja</TableHead>
              <TableHead>Madhesia e bagazhit</TableHead>
              <TableHead>Cmimi per bagazh ekstra</TableHead>
              <TableHead>Bagazhe free</TableHead>
              {/* <TableHead></TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes?.map((route: Route, index: number) => (
              <TableRow key={index}>
                <TableCell>{route?.code}</TableCell>
                <TableCell>{route?.contact?.phone}</TableCell>
                <TableCell>{route?.destination?.from}</TableCell>
                <TableCell>{route?.destination?.to}</TableCell>
                <TableCell>{route?.luggages?.size}</TableCell>
                <TableCell>{route?.luggages?.price_for_extra}</TableCell>
                <TableCell>{route?.luggages?.free}</TableCell>
                {/* <TableCell>
                  <Trash2
                    className="h-4 w-4 cursor-pointer text-destructive"
                    onClick={() => handleDelete(route?._id!)}
                  />
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default RoutesTable;
