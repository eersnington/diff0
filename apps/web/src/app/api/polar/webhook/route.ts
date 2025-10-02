import { api } from "@diff0/backend/convex/_generated/api";
import { Webhooks } from "@polar-sh/nextjs";
import { fetchMutation } from "convex/nextjs";
import { env } from "@/env";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    const deliveryId = payload.data.id;

    try {
      await fetchMutation(api.polar.webhooks.logWebhookEvent, {
        source: "polar",
        eventType: payload.type,
        deliveryId,
        payload,
      });
    } catch (_error) {
      // Ignore logging errors
    }
  },
  onOrderCreated: async (payload) => {
    const order = payload.data;
    const deliveryId = order.id;

    try {
      await fetchMutation(api.polar.mutations.handleOrderCreated, {
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

      await fetchMutation(api.polar.webhooks.markWebhookProcessed, {
        deliveryId,
      });
    } catch (error) {
      await fetchMutation(api.polar.webhooks.logWebhookError, {
        deliveryId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
  onOrderPaid: async (payload) => {
    const order = payload.data;
    const deliveryId = order.id;

    try {
      if (!order.customer.externalId) {
        throw new Error(`No externalId for customer ${order.customerId}`);
      }

      // Ensure the order record exists before marking it paid (idempotent upsert)
      await fetchMutation(api.polar.mutations.handleOrderCreated, {
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

      await fetchMutation(api.polar.mutations.handleOrderPaid, {
        orderId: order.id,
        userExternalId: order.customer.externalId,
      });

      await fetchMutation(api.polar.webhooks.markWebhookProcessed, {
        deliveryId,
      });
    } catch (error) {
      await fetchMutation(api.polar.webhooks.logWebhookError, {
        deliveryId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
});
