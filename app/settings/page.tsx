"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user";
import { Operator } from "@/models/operator";
import { Building, Phone, MapPin, Receipt, ClipboardList, CreditCard, Mail, User, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, getDbUser } = useUser();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperator = async () => {
      if (user?.$id) {
        try {
          const dbUser = await getDbUser();
          setOperator(dbUser);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch operator:", error);
          setLoading(false);
        }
      }
    };
    
    fetchOperator();
  }, [user, getDbUser]);

  if(!operator) {
    return (
      <div>Loading...</div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Skeleton className="w-32 h-32 rounded-full mb-4" />
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <Badge variant="outline" className="mt-2 md:mt-0 px-3 py-1 bg-green-50 text-green-700 border-green-200">
          Active Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative group">
                <Avatar className="w-32 h-32 mb-4 border-4 border-background shadow-md">
                  {/* <AvatarImage src={user?.prefs?.avatar} alt={operator.name} /> */}
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {operator.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-medium">Update</span>
                </div>
              </div>
              <h2 className="text-2xl font-semibold">{operator.name}</h2>
              <div className="flex items-center text-muted-foreground mb-4">
                <Mail size={14} className="mr-1" />
                <span>{operator.email}</span>
              </div>
              <div className="w-full p-4 bg-muted/50 rounded-lg mt-2">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CreditCard size={14} className="mr-1" />
                  Banking Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">SWIFT:</span>
                    <span className="font-medium text-right">{operator.company_metadata.bank_details?.swift || "—"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">IBAN:</span>
                    <span className="font-medium text-right">{operator.company_metadata.bank_details?.iban || "—"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-medium text-right">{operator.company_metadata.bank_details?.bank_name || "—"}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="company" className="flex-1">Company Details</TabsTrigger>
              <TabsTrigger value="billing" className="flex-1">Billing Information</TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building size={18} />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Your business details used for operations and invoicing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Building size={14} />
                        <span>Company Name</span>
                      </div>
                      <p className="font-medium text-lg">{operator.company_metadata.name || "—"}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Phone size={14} />
                        <span>Phone Number</span>
                      </div>
                      <p className="font-medium text-lg">{operator.company_metadata.phone || "—"}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <MapPin size={14} />
                        <span>Country</span>
                      </div>
                      <p className="font-medium text-lg">{operator.company_metadata.country || "—"}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Receipt size={14} />
                        <span>Tax Number</span>
                      </div>
                      <p className="font-medium text-lg">{operator.company_metadata.tax_number || "—"}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <ClipboardList size={14} />
                        <span>Registration Number</span>
                      </div>
                      <p className="font-medium text-lg">{operator.company_metadata.registration_number || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
                    <div className="mt-1">
                      <Settings2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Need to update your company details?</h4>
                      <p className="text-sm text-blue-700">
                        Contact our support team to update your registered business information. Changes may require verification.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your billing details and payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your billing information will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Customize your account settings and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your account preferences will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}