"use node";

import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { httpAction, internalMutation } from "../_generated/server";

export const handlePolarWebhook = httpAction(async (ctx, request) => {
  const body = await request.text();
  
  const deliveryId = request.headers.get("webhook-id");

  if (!deliveryId) {
    return new Response("Missing webhook-id header", { status: 400 });
  }

  const headersRecord: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersRecord[key] = value;
  });

  try {
    const event = validateEvent(
      body,
      headersRecord,
      process.env.POLAR_WEBHOOK_SECRET ?? ""
    );

    await ctx.runMutation(internal.polar.webhooks.logWebhookEvent, {
      source: "polar",
      eventType: event.type,
      deliveryId,
      payload: event,
    });

    switch (event.type) {
      case "order.created": {
        await ctx.runMutation(internal.polar.mutations.handleOrderCreated, {
          orderId: event.data.id,
          checkoutId: event.data.checkoutId ?? "",
          customerId: event.data.customerId,
          customerEmail: event.data.customer.email,
          customerExternalId: event.data.customer.externalId ?? undefined,
          productId: event.data.productId,
          productName: event.data.product.name,
          amount: event.data.totalAmount,
          currency: event.data.currency,
          status: event.data.status,
          subscriptionId: event.data.subscriptionId ?? undefined,
          billingReason: event.data.billingReason,
          metadata: event.data.metadata,
        });
        break;
      }

      case "order.paid": {
        if (!event.data.customer.externalId) {
          throw new Error(
            `No externalId for customer ${event.data.customerId}`
          );
        }

        await ctx.runMutation(internal.polar.mutations.handleOrderPaid, {
          orderId: event.data.id,
          userExternalId: event.data.customer.externalId,
        });
        break;
      }

      case "subscription.created":
      case "subscription.updated":
      case "subscription.canceled":
        break;

      default:
        break;
    }

    await ctx.runMutation(internal.polar.webhooks.markWebhookProcessed, {
      deliveryId,
    });

    return new Response("", { status: 202 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return new Response("Forbidden", { status: 403 });
    }

    await ctx.runMutation(internal.polar.webhooks.logWebhookError, {
      deliveryId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
});

export const logWebhookEvent = internalMutation({
  args: {
    source: v.union(v.literal("github"), v.literal("polar")),
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

export const markWebhookProcessed = internalMutation({
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

export const logWebhookError = internalMutation({
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
