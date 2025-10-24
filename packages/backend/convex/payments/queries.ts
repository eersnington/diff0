import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const getPaymentDetails = query({
  args: {
    paymentId: v.string(),
  },
  returns: v.union(
    v.object({
      order: v.object({
        _id: v.id("orders"),
        productName: v.string(),
        amount: v.number(),
        currency: v.string(),
        creditsAmount: v.number(),
        status: v.union(
          v.literal("pending"),
          v.literal("paid"),
          v.literal("refunded")
        ),
        createdAt: v.number(),
        paidAt: v.optional(v.number()),
        refundedAt: v.optional(v.number()),
      }),
      credits: v.object({
        balance: v.number(),
        totalPurchased: v.number(),
        totalUsed: v.number(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const order = await ctx.db
      .query("orders")
      .withIndex("paymentId", (q) => q.eq("paymentId", args.paymentId))
      .first();

    if (!order || order.userId !== user._id) {
      return null;
    }

    const userCredits = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    return {
      order: {
        _id: order._id,
        productName: order.productName,
        amount: order.amount,
        currency: order.currency,
        creditsAmount: order.creditsAmount,
        status: order.status,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        refundedAt: order.refundedAt,
      },
      credits: userCredits
        ? {
            balance: userCredits.balance,
            totalPurchased: userCredits.totalPurchased,
            totalUsed: userCredits.totalUsed,
          }
        : { balance: 0, totalPurchased: 0, totalUsed: 0 },
    };
  },
});

export const getUserOrders = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("orders"),
      paymentId: v.string(),
      productName: v.string(),
      amount: v.number(),
      currency: v.string(),
      creditsAmount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("refunded")
      ),
      createdAt: v.number(),
      paidAt: v.optional(v.number()),
      refundedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    const orders = await ctx.db
      .query("orders")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return orders.map((order) => ({
      _id: order._id,
      paymentId: order.paymentId,
      productName: order.productName,
      amount: order.amount,
      currency: order.currency,
      creditsAmount: order.creditsAmount,
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      refundedAt: order.refundedAt,
    }));
  },
});