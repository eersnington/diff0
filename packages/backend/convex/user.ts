import { v } from "convex/values";
import { z } from "zod";
import type { Doc } from "./_generated/dataModel";
import { mutation, type QueryCtx, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

// biome-ignore lint/suspicious/noControlCharactersInRegex: not suspicious
const NO_CONTROL_CHARS_REGEX = /^[^\u0000-\u001F\u007F]*$/;
const DEFAULT_TRANSACTION_LIMIT = 50;

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(64, "Name must be no more than 64 characters")
  .regex(NO_CONTROL_CHARS_REGEX, "Name contains invalid control characters");

export const updateUserName = mutation({
  args: {
    name: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    name: v.string(),
    previousName: v.string(),
    updated: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const trimmed = nameSchema.parse(args.name);

    const previousName = user.name;

    if (previousName === trimmed) {
      return {
        success: true,
        name: previousName,
        previousName,
        updated: false,
      };
    }

    await createAuth(ctx).api.updateUser({
      body: { name: trimmed },
      headers: await authComponent.getHeaders(ctx),
    });

    return {
      success: true,
      name: trimmed,
      previousName,
      updated: true,
    };
  },
});

export const safeGetUser = async (ctx: QueryCtx) =>
  authComponent.safeGetAuthUser(ctx);

export const getUser = async (ctx: QueryCtx) => authComponent.getAuthUser(ctx);

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => safeGetUser(ctx),
});

export const getBillingData = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        balance: {
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        },
        transactions: [],
      };
    }

    const userId = identity.subject;

    const credits = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    const balance = credits
      ? {
          balance: credits.balance,
          totalPurchased: credits.totalPurchased,
          totalUsed: credits.totalUsed,
        }
      : {
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        };

    const limit = args.limit ?? DEFAULT_TRANSACTION_LIMIT;
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return { balance, transactions };
  },
});

export const getDashboardData = query({
  args: {},
  returns: v.object({
    user: v.union(
      v.object({
        _id: v.string(),
        name: v.string(),
        email: v.string(),
        emailVerified: v.boolean(),
        image: v.union(v.string(), v.null()),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
      v.null()
    ),
    credits: v.object({
      balance: v.number(),
      totalPurchased: v.number(),
      totalUsed: v.number(),
    }),
    stats: v.object({
      totalReviews: v.number(),
      reviewsThisMonth: v.number(),
      connectedRepositories: v.number(),
      completedReviews: v.number(),
    }),
    recentReviews: v.array(
      v.object({
        _id: v.id("reviews"),
        prNumber: v.number(),
        prTitle: v.string(),
        prUrl: v.string(),
        status: v.union(
          v.literal("pending"),
          v.literal("analyzing"),
          v.literal("reviewing"),
          v.literal("completed"),
          v.literal("failed")
        ),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
        repository: v.object({
          name: v.string(),
          fullName: v.string(),
          owner: v.string(),
        }),
      })
    ),
  }),
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        user: null,
        credits: { balance: 0, totalPurchased: 0, totalUsed: 0 },
        stats: {
          totalReviews: 0,
          reviewsThisMonth: 0,
          connectedRepositories: 0,
          completedReviews: 0,
        },
        recentReviews: [],
      };
    }

    const userId = identity.subject;

    const user = await authComponent.getAuthUser(ctx);

    const credits = await ctx.db
      .query("userCredits")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    const balance = credits
      ? {
          balance: credits.balance,
          totalPurchased: credits.totalPurchased,
          totalUsed: credits.totalUsed,
        }
      : {
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        };

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime();

    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const reviewsThisMonth = allReviews.filter(
      (review) => review.createdAt >= startOfMonth
    ).length;

    const completedReviews = allReviews.filter(
      (review) => review.status === "completed"
    ).length;

    const repositories = await ctx.db
      .query("repositories")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      totalReviews: allReviews.length,
      reviewsThisMonth,
      connectedRepositories: repositories.length,
      completedReviews,
    };

    const recentReviewsDocs: Doc<"reviews">[] = await ctx.db
      .query("reviews")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    const recentReviews = await Promise.all(
      recentReviewsDocs.map(async (review) => {
        const repository = await ctx.db.get(review.repositoryId);

        if (!repository) {
          return null;
        }

        return {
          _id: review._id,
          prNumber: review.prNumber,
          prTitle: review.prTitle,
          prUrl: review.prUrl,
          status: review.status,
          createdAt: review.createdAt,
          completedAt: review.completedAt,
          repository: {
            name: repository.name,
            fullName: repository.fullName,
            owner: repository.owner,
          },
        };
      })
    );

    const validRecentReviews = recentReviews.filter((r) => r !== null);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      credits: balance,
      stats,
      recentReviews: validRecentReviews,
    };
  },
});
