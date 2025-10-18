import "./polyfill";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { env } from "../../env";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const handlePolarWebhook = httpAction(async (ctx, request) => {
  if (!env.POLAR_WEBHOOK_SECRET) {
    return new Response("POLAR_WEBHOOK_SECRET not configured", { status: 500 });
  }

  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  let deliveryId: string | undefined;

  try {
    const event = validateEvent(body, headers, env.POLAR_WEBHOOK_SECRET);

    deliveryId = headers["webhook-id"] || event.data?.id;

    await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
      source: "polar",
      eventType: event.type,
      deliveryId: deliveryId ?? headers["webhook-id"],
      payload: event,
    });

    switch (event.type) {
      case "order.created": {
        const order = event.data;
        await ctx.runMutation(internal.payments.mutations.handleOrderCreated, {
          orderId: order.id,
          checkoutId: order.checkoutId ?? "",
          customerId: order.customerId,
          customerEmail: order.customer.email,
          customerExternalId: order.customer.externalId ?? undefined,
          productId: order.productId,
          productName: order.product.name,
          amount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          subscriptionId: order.subscriptionId ?? undefined,
          billingReason: order.billingReason ?? undefined,
          metadata: order.metadata,
        });
        break;
      }

      case "order.paid": {
        const order = event.data;

        if (!order.customer?.externalId) {
          throw new Error(`No externalId for customer ${order.customerId}`);
        }

        // ensure idempotent upsert before marking paid
        await ctx.runMutation(internal.payments.mutations.handleOrderCreated, {
          orderId: order.id,
          checkoutId: order.checkoutId ?? "",
          customerId: order.customerId,
          customerEmail: order.customer.email,
          customerExternalId: order.customer.externalId ?? undefined,
          productId: order.productId,
          productName: order.product.name,
          amount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          subscriptionId: order.subscriptionId ?? undefined,
          billingReason: order.billingReason ?? undefined,
          metadata: order.metadata,
        });

        await ctx.runMutation(internal.payments.mutations.handleOrderPaid, {
          orderId: order.id,
          userExternalId: order.customer.externalId,
        });
        break;
      }

      default:
        // Unknown/unhandled event types are recorded but considered success
        break;
    }

    await ctx.runMutation(internal.github.handlers.markEventProcessed, {
      deliveryId: deliveryId ?? headers["webhook-id"],
    });

    return new Response("Accepted", { status: 202 });
  } catch (error) {
    let message: string;
    if (error instanceof WebhookVerificationError) {
      message = `Invalid signature: ${error.message}`;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    const fallbackId = deliveryId ?? headers["webhook-id"];
    if (fallbackId) {
      await ctx.runMutation(internal.github.handlers.markEventProcessed, {
        deliveryId: fallbackId,
        error: message,
      });
    }

    const status = error instanceof WebhookVerificationError ? 403 : 500;
    return new Response(message, { status });
  }
});
