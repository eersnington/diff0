import "./polyfill";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { env } from "../../env";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const handlePolarWebhook = httpAction(async (ctx, request) => {
  const id = request.headers.get("webhook-id") ?? undefined;
  const sig = request.headers.get("webhook-signature") ?? undefined;
  const ts = request.headers.get("webhook-timestamp") ?? undefined;

  if (!(id && sig && ts)) {
    return new Response("Missing required webhook headers", { status: 400 });
  }

  if (!env.POLAR_WEBHOOK_SECRET) {
    return new Response("POLAR_WEBHOOK_SECRET not configured", { status: 500 });
  }

  const body = await request.text();
  let deliveryId: string | undefined;

  try {
    const event = validateEvent(
      body,
      {
        "webhook-id": id,
        "webhook-signature": sig,
        "webhook-timestamp": ts,
      },
      env.POLAR_WEBHOOK_SECRET
    );

    // all Polar events have a data object with an id
    // https://docs.polar.sh/reference/webhooks
    deliveryId = event.data?.id;

    // persist raw event for auditing/troubleshooting
    await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
      source: "polar",
      eventType: event.type,
      deliveryId: deliveryId ?? id,
      payload: event,
    });

    switch (event.type) {
      case "order.created": {
        const order = event.data;
        await ctx.runMutation(internal.polar.mutations.handleOrderCreated, {
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
        await ctx.runMutation(internal.polar.mutations.handleOrderCreated, {
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

        await ctx.runMutation(internal.polar.mutations.handleOrderPaid, {
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
      deliveryId: deliveryId ?? id,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof WebhookVerificationError) {
      message = `Invalid signature: ${error.message}`;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    if (deliveryId ?? id) {
      await ctx.runMutation(internal.github.handlers.markEventProcessed, {
        deliveryId: deliveryId ?? id!,
        error: message,
      });
    }

    const status = error instanceof WebhookVerificationError ? 401 : 500;
    return new Response(message, { status });
  }
});
