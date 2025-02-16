"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user";
import { Operator, OperatorRoles } from "@/models/operator";
import axios from "axios";
import { API_URL } from "@/environment";

export default function SettingsPage() {
  const { user } = useUser();
  const [operator, setOperator] = useState<Operator>({
    name: user?.name || "",
    email: user?.email || "",
    otp: { code: "", valid_until: new Date() },
    role: OperatorRoles.OPERATOR,
    fcm_token: "",
    max_child_age: 0,
    notification_permissions: {
      allow_portal_notifications: false,
      not_enough_seats: 0,
    },
    confirmation: {
      is_confirmed: false,
      message: "",
    },
    subscriptions: {
      agencies: false,
    },
    company_metadata: {
      tax_number: "",
      registration_number: "",
      name: "",
      email: "",
      phone: "",
      country: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOperator((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setOperator((prev) => ({
      ...prev,
      company_metadata: { ...prev.company_metadata, [name]: value },
    }));
  };

  const handleNotificationChange = (checked: boolean) => {
    setOperator((prev) => ({
      ...prev,
      notification_permissions: {
        ...prev.notification_permissions,
        allow_portal_notifications: checked,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await axios.post(API_URL+"/operator/edit/"+user?.$id, operator);
    console.log("Updated operator:", response);
    
  };

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
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={operator.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={operator.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_child_age">Max Child Age</Label>
                  <Input
                    id="max_child_age"
                    name="max_child_age"
                    type="number"
                    value={operator.max_child_age}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_notifications"
                    checked={
                      operator.notification_permissions
                        .allow_portal_notifications
                    }
                    onCheckedChange={handleNotificationChange}
                  />
                  <Label htmlFor="allow_notifications">
                    Allow Portal Notifications
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Manage your company details here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="name"
                    value={operator.company_metadata.name}
                    onChange={handleCompanyMetadataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_email">Company Email</Label>
                  <Input
                    id="company_email"
                    name="email"
                    type="email"
                    value={operator.company_metadata.email}
                    onChange={handleCompanyMetadataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Company Phone</Label>
                  <Input
                    id="company_phone"
                    name="phone"
                    value={operator.company_metadata.phone}
                    onChange={handleCompanyMetadataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_number">Tax Number</Label>
                  <Input
                    id="tax_number"
                    name="tax_number"
                    value={operator.company_metadata.tax_number}
                    onChange={handleCompanyMetadataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">
                    Registration Number
                  </Label>
                  <Input
                    id="registration_number"
                    name="registration_number"
                    value={operator.company_metadata.registration_number}
                    onChange={handleCompanyMetadataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={operator.company_metadata.country}
                    onChange={handleCompanyMetadataChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              Save Settings
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
