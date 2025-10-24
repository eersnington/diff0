import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { authComponent } from "./auth";

export const initializeCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    const existing = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    if (!existing) {
      await ctx.db.insert("userCredits", {
        userId: user._id,
        balance: 10,
        totalPurchased: 0,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const addCredits = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    checkoutId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    const newBalance = (credits?.balance ?? 0) + args.amount;

    if (credits) {
      await ctx.db.patch(credits._id, {
        balance: newBalance,
        totalPurchased: credits.totalPurchased + args.amount,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("userCredits", {
        userId: args.userId,
        balance: newBalance,
        totalPurchased: args.amount,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });
    }

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: "purchase",
      amount: args.amount,
      balance: newBalance,
      description: args.description,
      checkoutId: args.checkoutId,
      createdAt: Date.now(),
    });

    return { balance: newBalance };
  },
});

export const deductCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!credits || credits.balance < args.amount) {
      throw new Error("Insufficient credits");
    }

    const newBalance = credits.balance - args.amount;

    await ctx.db.patch(credits._id, {
      balance: newBalance,
      totalUsed: credits.totalUsed + args.amount,
      lastUpdated: Date.now(),
    });

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: "usage",
      amount: -args.amount,
      balance: newBalance,
      description: args.description,
      createdAt: Date.now(),
    });

    return { balance: newBalance };
  },
});
