import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { getCreditsForProduct } from "./productMapping";

export const handleOrderCreated = internalMutation({
  args: {
    orderId: v.string(),
    checkoutId: v.string(),
    customerId: v.string(),
    customerEmail: v.string(),
    customerExternalId: v.optional(v.string()),
    productId: v.string(),
    productName: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    subscriptionId: v.optional(v.string()),
    billingReason: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("orderId", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existingOrder) {
      return null;
    }

    const creditsAmount = getCreditsForProduct(args.productId);

    await ctx.db.insert("orders", {
      userEmail: args.customerEmail,
      orderId: args.orderId,
      checkoutId: args.checkoutId,
      customerId: args.customerId,
      productId: args.productId,
      productName: args.productName,
      amount: args.amount,
      currency: args.currency,
      status: args.status as "pending" | "paid" | "refunded",
      creditsAmount,
      creditsApplied: false,
      subscriptionId: args.subscriptionId,
      billingReason: args.billingReason,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return null;
  },
});

export const handleOrderPaid = internalMutation({
  args: {
    orderId: v.string(),
    userExternalId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("orderId", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!order) {
      throw new Error(`Order not found: ${args.orderId}`);
    }

    if (order.creditsApplied) {
      return null;
    }

    await ctx.db.patch(order._id, {
      status: "paid",
      paidAt: Date.now(),
      creditsApplied: true,
    });

    await ctx.runMutation(internal.credits.addCredits, {
      userId: args.userExternalId,
      amount: order.creditsAmount,
      description: `Purchase: ${order.productName}`,
      checkoutId: order.checkoutId,
    });

    return null;
  },
});
