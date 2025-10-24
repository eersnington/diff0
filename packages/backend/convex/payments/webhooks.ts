import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const logWebhookEvent = mutation({
  args: {
    source: v.union(v.literal("github"), v.literal("credits")),
    eventType: v.string(),
    deliveryId: v.string(),
    payload: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookEvents", {
      source: args.source,
      eventType: args.eventType,
      deliveryId: args.deliveryId,
      payload: args.payload,
      processed: false,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const markWebhookProcessed = mutation({
  args: {
    deliveryId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .first();

    if (event) {
      await ctx.db.patch(event._id, {
        processed: true,
        processedAt: Date.now(),
      });
    }
    return null;
  },
});

export const logWebhookError = mutation({
  args: {
    deliveryId: v.string(),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .first();

    if (event) {
      await ctx.db.patch(event._id, {
        error: args.error,
      });
    }
    return null;
  },
});
