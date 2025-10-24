import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { handleGitHubWebhook } from "./github/webhooks";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/github/webhook",
  method: "POST",
  handler: handleGitHubWebhook,
});

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    // Handle successful payments
    onPaymentSucceeded: async (ctx, payload) => {
      // Use Convex context to persist payment data
      await ctx.runMutation(internal.webhooks.createPayment, {
        paymentId: payload.data.payment_id,
        businessId: payload.business_id,
        customerEmail: payload.data.customer.email,
        amount: payload.data.total_amount,
        currency: payload.data.currency,
        status: payload.data.status,
        webhookPayload: JSON.stringify(payload),
      });
    },

    // Handle subscription activation
    onSubscriptionActive: async (ctx, payload) => {
      // Use Convex context to persist subscription data
      await ctx.runMutation(internal.webhooks.createSubscription, {
        subscriptionId: payload.data.subscription_id,
        businessId: payload.business_id,
        customerEmail: payload.data.customer.email,
        status: payload.data.status,
        webhookPayload: JSON.stringify(payload),
      });
    },
    // Add other event handlers as needed
  }),
});

export default http;
