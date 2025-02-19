"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user";
import { Operator, OperatorRoles } from "@/models/operator";
import axios from "axios";
import { API_URL } from "@/environment";

export default function SettingsPage() {
  const { user, getDbUser } = useUser();
  const [operator, setOperator] = useState<Operator | null>(null);

  useEffect(() => {
    const fetchOperator = async () => {
      if (user?.$id) {
        try {
          const dbUser = await getDbUser();
          setOperator(dbUser);
        } catch (error) {
          console.error("Failed to fetch operator:", error);
        }
      }
    };
    
    fetchOperator();
  }, [user, getDbUser]);

  if (!operator) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold">{operator.name}</h2>
              <p className="text-muted-foreground">{operator.email}</p>
              <div className="mt-4 text-center">
                <p className="font-medium">SWIFT Code: {operator.company_metadata.bank_details?.swift || "N/A"}</p>
                <p className="font-medium">IBAN: {operator.company_metadata.bank_details?.iban || "N/A"}</p>
                <p className="font-medium">BANK NAME: {operator.company_metadata.bank_details?.bank_name || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Company Name: {operator.company_metadata.name}</p>
              <p className="font-medium">Company Phone: {operator.company_metadata.phone}</p>
              <p className="font-medium">Country: {operator.company_metadata.country}</p>
              <p className="font-medium">Tax Number: {operator.company_metadata.tax_number}</p>
              <p className="font-medium">Registration Number: {operator.company_metadata.registration_number}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
