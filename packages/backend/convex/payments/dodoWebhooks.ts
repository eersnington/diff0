import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { authComponent } from "../auth";
import { getCreditsForProduct } from "./productMapping";

export const handlePaymentSucceeded = internalMutation({
  args: {
    paymentId: v.string(),
    customerId: v.string(),
    customerEmail: v.string(),
    productId: v.string(),
    productName: v.string(),
    amount: v.number(),
    currency: v.string(),
    metadata: v.optional(v.any()),
    deliveryId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("paymentId", (q) => q.eq("paymentId", args.paymentId))
      .first();

    if (existingOrder) {
      return null;
    }

    const account = await ctx.runQuery(
      authComponent.component.adapter.findOne,
      {
        model: "account",
        where: [
          {
            field: "providerId",
            value: "dodopayments",
          },
          {
            field: "providerAccountId",
            value: args.customerId,
          },
        ],
      }
    );

    if (!account) {
      throw new Error(
        `No account found for Dodo customer: ${args.customerId}`
      );
    }

    const userId = account.userId as string;
    const creditsAmount = getCreditsForProduct(args.productId);

    await ctx.db.insert("orders", {
      userId,
      userEmail: args.customerEmail,
      paymentId: args.paymentId,
      customerId: args.customerId,
      productId: args.productId,
      productName: args.productName,
      amount: args.amount,
      currency: args.currency,
      status: "paid",
      creditsAmount,
      creditsApplied: true,
      metadata: args.metadata,
      createdAt: Date.now(),
      paidAt: Date.now(),
    });

    await ctx.runMutation(internal.credits.addCredits, {
      userId,
      amount: creditsAmount,
      description: `Purchase: ${args.productName}`,
      checkoutId: args.paymentId,
    });

    return null;
  },
});

export const handlePaymentRefunded = internalMutation({
  args: {
    paymentId: v.string(),
    refundAmount: v.number(),
    deliveryId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("paymentId", (q) => q.eq("paymentId", args.paymentId))
      .first();

    if (!order) {
      throw new Error(`Order not found for payment: ${args.paymentId}`);
    }

    if (order.status === "refunded") {
      return null;
    }

    await ctx.db.patch(order._id, {
      status: "refunded",
      refundedAt: Date.now(),
    });

    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", order.userId))
      .first();

    if (!userCredits) {
      throw new Error(`User credits not found for user: ${order.userId}`);
    }

    const deductAmount = Math.min(order.creditsAmount, userCredits.balance);
    const newBalance = userCredits.balance - deductAmount;

    await ctx.db.patch(userCredits._id, {
      balance: newBalance,
      totalUsed: userCredits.totalUsed + deductAmount,
      lastUpdated: Date.now(),
    });

    await ctx.db.insert("creditTransactions", {
      userId: order.userId,
      type: "refund",
      amount: -deductAmount,
      balance: newBalance,
      description: `Refund: ${order.productName}`,
      checkoutId: args.paymentId,
      createdAt: Date.now(),
    });

    return null;
  },
});