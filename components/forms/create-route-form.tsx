"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { FormError } from "@/components/form-error";
import { routeSchema } from "@/schemas";
import { FormSuccess } from "../form-success";
import { createRoute } from "@/actions/route";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Station } from "@/models/station";
import { useUser } from "@/context/user";

export default function RouteForm({ stations }: { stations: Station[] }) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {user} = useUser();


  const form = useForm<z.infer<typeof routeSchema>>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      code: "",
      contact: {
        phone: "",
        email: "",
      },
      stations: {
        from: "",
        to: "",
      },
      destination: {
        from: "",
        to: "",
      },
      luggages: {
        free: 0, 
        price_for_extra: 0,
        size: "50 x 50 x 50",
      },
      is_active: "true",
      generate_tickets_automatically: "true",
      metadata: {
        sold: Number(0)
      },
      operator: ""
    },
  });

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      if(user?.$id) {
      const message = await createRoute(values, user?.$id);
      setSuccess(message);
      console.log({ message });
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while submitting the form.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Code</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="Route code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="+123456789" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="example@example.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination.from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination From</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="From" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination.to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination To</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="To" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stations.from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Station From</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                          stations?.map((station: Station) => { return (
                              <SelectItem key={station?._id} value={station?._id!}>{station.name}</SelectItem>
                            )
                          })
                      }
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stations.to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Station To</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                          stations?.map((station: Station) => { return (
                              <SelectItem key={station?._id} value={station?._id!}>{station.name}</SelectItem>
                            )
                          })
                      }
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="luggages.free"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Luggage (kg)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="20" type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="luggages.price_for_extra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price for Extra Luggage (€)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="10"
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="luggages.size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Luggage Size</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="50 x 50 x 50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
   
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is active</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose if users can buy these tickets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="station1">Yes</SelectItem>
                      <SelectItem value="station2">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
   
          <FormField
            control={form.control}
            name="generate_tickets_automatically"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generate Tickets Automatically</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Generate future tickets automatically" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="station1">Yes</SelectItem>
                      <SelectItem value="station2">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader className="animate-spin" /> : "Submit"}
          </Button>
        </form>
      </Form>

      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}
    </div>
  );
}
