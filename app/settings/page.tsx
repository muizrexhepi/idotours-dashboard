"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user";
import {
  Building,
  Phone,
  MapPin,
  Receipt,
  ClipboardList,
  CreditCard,
  Mail,
  User,
  Settings2,
  Star,
  MessageSquare,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, loading } = useUser();

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

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Unable to load user information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your operator account and company information
          </p>
        </div>
        <Badge
          variant="outline"
          className="mt-2 md:mt-0 px-3 py-1 bg-green-50 text-green-700 border-green-200"
        >
          Active Operator
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
              <CardDescription>Your operator information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <span className="text-white text-xs font-medium">Edit</span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-center">
                  {user.name}
                </h2>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <Mail size={14} className="mr-2" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      Rating
                    </span>
                  </div>
                  <span className="font-medium">
                    {user.averageRating
                      ? `${user.averageRating.toFixed(1)}/5`
                      : "No reviews"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">
                      Reviews
                    </span>
                  </div>
                  <span className="font-medium">{user.totalReviews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {user.role === "operator" ? "Verified" : user.role}
                  </Badge>
                </div>
              </div>

              {/* Bank Details */}
              {user.company_metadata?.bank_details && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <CreditCard size={14} className="mr-2" />
                    Banking Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    {user.company_metadata.bank_details.swift && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SWIFT:</span>
                        <span className="font-medium">
                          {user.company_metadata.bank_details.swift}
                        </span>
                      </div>
                    )}
                    {user.company_metadata.bank_details.iban && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IBAN:</span>
                        <span className="font-medium text-right">
                          {user.company_metadata.bank_details.iban}
                        </span>
                      </div>
                    )}
                    {user.company_metadata.bank_details.bank_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-medium">
                          {user.company_metadata.bank_details.bank_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="company" className="flex-1">
                Company Details
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1">
                Notifications
              </TabsTrigger>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <Building size={14} />
                        <span>Company Name</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {user.company_metadata?.name || "—"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <Phone size={14} />
                        <span>Phone Number</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {user.company_metadata?.phone || "—"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <MapPin size={14} />
                        <span>Country</span>
                      </div>
                      <p className="font-semibold text-lg capitalize">
                        {user.company_metadata?.country || "—"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <Receipt size={14} />
                        <span>Tax Number</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {user.company_metadata?.tax_number || "—"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <ClipboardList size={14} />
                        <span>Registration Number</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {user.company_metadata?.registration_number || "—"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <User size={14} />
                        <span>Max Child Age</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {user.max_child_age
                          ? `${user.max_child_age} years`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
                    <div className="mt-1">
                      <Settings2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Need to update your company details?
                      </h4>
                      <p className="text-sm text-blue-700">
                        Contact our support team to update your registered
                        business information. Changes may require verification
                        and documentation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 size={18} />
                    Account Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and operational preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">
                        Subscription Settings
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Agencies Subscription
                          </span>
                          <Badge
                            variant={
                              user.subscriptions?.agencies
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.subscriptions?.agencies
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Account Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Account Created:
                          </span>
                          <span>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Last Updated:
                          </span>
                          <span>
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 size={18} />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-3">Portal Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            Allow Portal Notifications
                          </span>
                          <Badge
                            variant={
                              user.notification_permissions
                                ?.allow_portal_notifications
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.notification_permissions
                              ?.allow_portal_notifications
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Minimum Seats Alert</span>
                          <span className="text-sm font-medium">
                            {user.notification_permissions?.not_enough_seats
                              ? `${user.notification_permissions.not_enough_seats} seats`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
