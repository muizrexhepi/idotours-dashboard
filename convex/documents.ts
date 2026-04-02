import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── FILE UPLOAD ──────────────────────────────────────────────────
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// ════════════════════════════════════════════════════════════════
// DRIVER DOCUMENTS
// ════════════════════════════════════════════════════════════════
export const createDriverDocument = mutation({
  args: {
    operator_id: v.string(),
    driver_id: v.optional(v.string()),
    driver_name: v.string(),
    document_type: v.string(),
    valid_until: v.string(),
    alarm_days: v.number(),
    file_storage_id: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let file_url: string | undefined;
    if (args.file_storage_id) {
      file_url = (await ctx.storage.getUrl(args.file_storage_id)) ?? undefined;
    }
    return await ctx.db.insert("driver_documents", {
      ...args,
      file_url,
      created_at: new Date().toISOString(),
    });
  },
});

export const getDriverDocuments = query({
  args: { operator_id: v.string() },
  handler: async (ctx, { operator_id }) => {
    return await ctx.db
      .query("driver_documents")
      .withIndex("by_operator", (q) => q.eq("operator_id", operator_id))
      .order("desc")
      .collect();
  },
});

export const deleteDriverDocument = mutation({
  args: { id: v.id("driver_documents") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc?.file_storage_id) {
      await ctx.storage.delete(doc.file_storage_id);
    }
    await ctx.db.delete(id);
  },
});

// ════════════════════════════════════════════════════════════════
// BUS DOCUMENTS
// ════════════════════════════════════════════════════════════════
export const createBusDocument = mutation({
  args: {
    operator_id: v.string(),
    bus_id: v.optional(v.string()),
    bus_plates: v.string(),
    bus_serial: v.optional(v.string()),
    document_type: v.string(),
    valid_until: v.string(),
    alarm_days: v.number(),
    file_storage_id: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let file_url: string | undefined;
    if (args.file_storage_id) {
      file_url = (await ctx.storage.getUrl(args.file_storage_id)) ?? undefined;
    }
    return await ctx.db.insert("bus_documents", {
      ...args,
      file_url,
      created_at: new Date().toISOString(),
    });
  },
});

export const getBusDocuments = query({
  args: { operator_id: v.string() },
  handler: async (ctx, { operator_id }) => {
    return await ctx.db
      .query("bus_documents")
      .withIndex("by_operator", (q) => q.eq("operator_id", operator_id))
      .order("desc")
      .collect();
  },
});

export const deleteBusDocument = mutation({
  args: { id: v.id("bus_documents") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc?.file_storage_id) {
      await ctx.storage.delete(doc.file_storage_id);
    }
    await ctx.db.delete(id);
  },
});

// ════════════════════════════════════════════════════════════════
// DOZVOLLAT
// ════════════════════════════════════════════════════════════════
export const createDozvoll = mutation({
  args: {
    operator_id: v.string(),
    document_type: v.string(),
    label: v.string(),
    valid_until: v.string(),
    alarm_days: v.number(),
    file_storage_id: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let file_url: string | undefined;
    if (args.file_storage_id) {
      file_url = (await ctx.storage.getUrl(args.file_storage_id)) ?? undefined;
    }
    return await ctx.db.insert("dozvollat", {
      ...args,
      file_url,
      created_at: new Date().toISOString(),
    });
  },
});

export const getDozvollat = query({
  args: { operator_id: v.string() },
  handler: async (ctx, { operator_id }) => {
    return await ctx.db
      .query("dozvollat")
      .withIndex("by_operator", (q) => q.eq("operator_id", operator_id))
      .order("desc")
      .collect();
  },
});

export const deleteDozvoll = mutation({
  args: { id: v.id("dozvollat") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc?.file_storage_id) {
      await ctx.storage.delete(doc.file_storage_id);
    }
    await ctx.db.delete(id);
  },
});
