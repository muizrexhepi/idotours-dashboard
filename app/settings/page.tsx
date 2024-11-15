'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Operator, OperatorRoles, CompanyMetadata } from '../../models/operator'

export default function SettingsPage() {
  const [operator, setOperator] = useState<Operator>({
    name: '',
    email: '',
    otp: { code: '', valid_until: new Date() },
    role: OperatorRoles.OPERATOR,
    fcm_token: '',
    max_child_age: 0,
    notification_permissions: {
      allow_portal_notifications: false,
      not_enough_seats: 0,
    },
    confirmation: {
      is_confirmed: false,
      message: '',
    },
    subscriptions: {
      agencies: false,
    },
    company_metadata: {
      tax_number: '',
      registration_number: '',
      name: '',
      email: '',
      phone: '',
      country: '',
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOperator(prev => ({ ...prev, [name]: value }))
  }

  const handleCompanyMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOperator(prev => ({
      ...prev,
      company_metadata: { ...prev.company_metadata, [name]: value },
    }))
  }

  const handleNotificationChange = (checked: boolean) => {
    setOperator(prev => ({
      ...prev,
      notification_permissions: {
        ...prev.notification_permissions,
        allow_portal_notifications: checked,
      },
    }))
  }

  const handleRoleChange = (value: string) => {
    setOperator(prev => ({ ...prev, role: value as OperatorRoles }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Updated operator:', operator)
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operator Settings</CardTitle>
          <CardDescription>Manage your operator account settings here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" value={operator.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={operator.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_child_age">Max Child Age</Label>
            <Input id="max_child_age" name="max_child_age" placeholder={operator.max_child_age.toString() || "1"} type="number" value={operator.max_child_age} onChange={handleChange} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="allow_notifications"
              checked={operator.notification_permissions.allow_portal_notifications}
              onCheckedChange={handleNotificationChange}
            />
            <Label htmlFor="allow_notifications">Allow Portal Notifications</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_email">Company Email</Label>
            <Input id="company_email" name="email" type="email" value={operator.company_metadata.email} onChange={handleCompanyMetadataChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_phone">Company Phone</Label>
            <Input id="company_phone" name="phone" value={operator.company_metadata.phone} onChange={handleCompanyMetadataChange} />
          </div>
        </CardContent>
      </Card>

      <CardFooter>
        <Button type="submit" className="w-full">Save Settings</Button>
      </CardFooter>
    </form>
  )
}