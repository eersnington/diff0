import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { handleGitHubWebhook } from "./github/webhooks";
import { getNameForProduct } from "./payments/productMapping";

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
		onPaymentSucceeded: async (ctx, payload) => {
			const deliveryId = payload.data.payment_id;

			await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
				source: "credits",
				eventType: "payment.succeeded",
				deliveryId,
				payload,
			});

			const productCart = payload.data.product_cart;
			const productId = productCart?.[0]?.product_id ?? "unknown_product";

			await ctx.runMutation(
				internal.payments.dodoWebhooks.handlePaymentSucceeded,
				{
					paymentId: payload.data.payment_id,
					customerId: payload.data.customer.customer_id,
					customerEmail: payload.data.customer.email,
					productId: productId,
					productName: getNameForProduct(productId),
					amount: payload.data.total_amount,
					currency: payload.data.currency,
					metadata: payload.data.metadata,
					deliveryId,
				},
			);

			await ctx.runMutation(internal.github.handlers.markEventProcessed, {
				deliveryId,
			});
		},

		onRefundSucceeded: async (ctx, payload) => {
			const deliveryId = payload.data.payment_id;

			await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
				source: "credits",
				eventType: "refund.succeeded",
				deliveryId,
				payload,
			});

			await ctx.runMutation(
				internal.payments.dodoWebhooks.handlePaymentRefunded,
				{
					paymentId: payload.data.payment_id,
					refundAmount: payload.data.amount,
					deliveryId,
				},
			);

			await ctx.runMutation(internal.github.handlers.markEventProcessed, {
				deliveryId,
			});
		},

		onPaymentProcessing: async (ctx, payload) => {
			const deliveryId = payload.data.payment_id;

			await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
				source: "credits",
				eventType: "payment.processing",
				deliveryId,
				payload,
			});

			await ctx.runMutation(internal.github.handlers.markEventProcessed, {
				deliveryId,
			});
		},

		onPaymentFailed: async (ctx, payload) => {
			const deliveryId = payload.data.payment_id;

			await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
				source: "credits",
				eventType: "payment.failed",
				deliveryId,
				payload,
			});

			await ctx.runMutation(internal.github.handlers.markEventProcessed, {
				deliveryId,
			});
		},

		onPaymentCancelled: async (ctx, payload) => {
			const deliveryId = payload.data.payment_id;

			await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
				source: "credits",
				eventType: "payment.cancelled",
				deliveryId,
				payload,
			});

			await ctx.runMutation(internal.github.handlers.markEventProcessed, {
				deliveryId,
			});
		},
	}),
});

export default http;
