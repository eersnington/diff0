import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const getCheckoutDetails = query({
  args: {
    checkoutId: v.string(),
  },
  returns: v.union(
    v.object({
      order: v.object({
        _id: v.id("polarOrders"),
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
      .query("polarOrders")
      .withIndex("polarCheckoutId", (q) =>
        q.eq("polarCheckoutId", args.checkoutId)
      )
      .first();

    if (!order || order.userEmail !== user.email) {
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