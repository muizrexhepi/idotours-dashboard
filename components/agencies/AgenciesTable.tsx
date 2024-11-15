"use client";

import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Agency } from "@/models/agency";
import { deleteAgency } from "@/actions/agency";




const AgenciesTable = ({ agencies }: { agencies: Agency[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgencies = agencies.filter((agency) =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.address.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (agency_id: string) => {
    try {
      const res = await deleteAgency(agency_id);
      toast({ description: "Deleted" });
    } catch (error) {
      console.error(error);
      toast({ description: "Failed to delete agency", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgencies.map((agency: Agency) => (
              <TableRow key={agency?._id}>
                <TableCell>{agency.name}</TableCell>
                <TableCell>{agency.email}</TableCell>
                <TableCell>{agency.address.city}</TableCell>
                <TableCell>{agency.address.country}</TableCell>
                <TableCell>{agency.contact.phone}</TableCell>
                <TableCell>{agency.financial_data.percentage}%</TableCell>
                <TableCell>{agency?.financial_data?.total_sales}</TableCell>
                <TableCell>{agency.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <Trash2
                    className="h-4 w-4 cursor-pointer text-destructive"
                    onClick={() => handleDelete(agency._id)}
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

export default AgenciesTable;