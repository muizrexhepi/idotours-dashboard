import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Driver documents: Leja, Pasaporta, Letërnjoftim, Kartëlë tahografis, Licenca, Lekarsko
  driver_documents: defineTable({
    operator_id: v.string(),
    driver_id: v.optional(v.string()),
    driver_name: v.string(),
    document_type: v.string(), // "Leja" | "Pasaporta" | "Letërnjoftim" | "Kartëlë tahografis" | "Licenca" | "Lekarsko"
    valid_until: v.string(), // ISO date string
    alarm_days: v.number(), // days before expiry to alert
    file_url: v.optional(v.string()),
    file_storage_id: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_operator", ["operator_id"])
    .index("by_driver", ["operator_id", "driver_id"]),

  // Bus documents: Libreza, Licenca, Eurostandard, Tepi, Bazhdiranje, 6 Mujorshja, 6 Mujorshja de kra
  bus_documents: defineTable({
    operator_id: v.string(),
    bus_id: v.optional(v.string()),
    bus_plates: v.string(),
    bus_serial: v.optional(v.string()),
    document_type: v.string(), // "Libreza" | "Licenca" | "Eurostandard" | "Tepi" | "Bazhdiranje" | "6 Mujorshja" | "6 Mujorshja de kra"
    valid_until: v.string(),
    alarm_days: v.number(),
    file_url: v.optional(v.string()),
    file_storage_id: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_operator", ["operator_id"])
    .index("by_bus", ["operator_id", "bus_plates"]),

  // Dozvollat (permits): Dozvoll, Bazhdiranje
  dozvollat: defineTable({
    operator_id: v.string(),
    document_type: v.string(), // "Dozvoll" | "Bazhdiranje"
    label: v.string(), // custom label e.g. "Dozvoll Gjermani 2026"
    valid_until: v.string(),
    alarm_days: v.number(),
    file_url: v.optional(v.string()),
    file_storage_id: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    created_at: v.string(),
  }).index("by_operator", ["operator_id"]),
});
