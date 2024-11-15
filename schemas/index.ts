import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  


  export const stationSchema = z.object({
    name: z
      .string()
      .min(2, { message: "Station name must be at least 2 characters long" })
      .max(100, { message: "Station name can't exceed 100 characters" }),
    city: z
      .string()
      .min(2, { message: "City name must be at least 2 characters long" })
      .max(50, { message: "City name can't exceed 50 characters" }),
    country: z
      .string()
      .min(2, { message: "Country name must be at least 2 characters long" })
      .max(50, { message: "Country name can't exceed 50 characters" }),
    address: z
      .string()
      .min(5, { message: "Station address must be at least 5 characters long" })
      .max(100, { message: "Station address can't exceed 100 characters" }),
    location: z.object({
      lat: z
        .number()
        .min(-90, { message: "Latitude must be between -90 and 90" })
        .max(90, { message: "Latitude must be between -90 and 90" }),
      lng: z
        .number()
        .min(-180, { message: "Longitude must be between -180 and 180" })
        .max(180, { message: "Longitude must be between -180 and 180" }),
    }),
    code: z
      .string()
      .min(2, { message: "Code must be at least 2 characters long" })
      .max(20, { message: "Code can't exceed 20 characters" })
      .regex(/^[a-z0-9-]+$/, { message: "Code can only include lowercase letters, numbers, and hyphens" }),
    operator: z.string().optional(),
  });
  

export const routeSchema = z.object({
  code: z.string(),
  contact: z.object({
    phone: z.string(),
    email: z.string().email(),
  }),
  destination: z.object({
    from: z.string(),
    to: z.string(),
  }),
  stations: z.object({
    from: z.string(),
    to: z.string(),
  }),
  luggages: z.object({
    free: z.string(),
    price_for_extra: z.string(),
    size: z.string(),
  }),
  is_active: z.string(),
  generate_tickets_automatically: z.string(),
  metadata: z.object({
    sold: z.number(),
  }),
  operator: z.string(),
});

export type Route = z.infer<typeof routeSchema>;
