"use client";

import { useState } from "react";
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
import { stationSchema } from "@/schemas";
import { FormSuccess } from "../form-success";
import { createStation } from "@/actions/stations";
import { useUser } from "@/context/user";

export default function StationForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {user} = useUser();

  const form = useForm<z.infer<typeof stationSchema>>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      name: "",
      city: "",
      country: "",
      address: "",
      location: {
        lat: 0,
        lng: 0,
      },
      code: "",
      operator: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof stationSchema>) => {
    setIsLoading(true);
    try {
      const message = await createStation(values, user?.$id!);
      setSuccess(message);
      console.log({ message });
    } catch (error) {
      console.error(error);
      setError("An error occurred while submitting the form.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Germany"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Berlin"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Berlin central bus station"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="berlin-de"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location.lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder="52.5200"
                        type="number"
                        step="any"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder="13.4050"
                        type="number"
                        step="any"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Messedamm 8, 14057 Berlin, Germany"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add more fields as needed */}
          </div>
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader className="h-3 w-3 animate-spin" />
            ) : (
              "Add Station"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
