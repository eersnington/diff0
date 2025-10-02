import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const findRepository = internalQuery({
  args: {
    installationId: v.string(),
    repoName: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("repositories"),
      userId: v.string(),
      autoReviewEnabled: v.boolean(),
      fullName: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Use composite index to avoid filter + full scan
    const repo = await ctx.db
      .query("repositories")
      .withIndex("installationId_and_name", (q) =>
        q.eq("installationId", args.installationId).eq("name", args.repoName)
      )
      .first();

    if (!repo) {
      return null;
    }

    return {
      _id: repo._id,
      userId: repo.userId,
      autoReviewEnabled: repo.autoReviewEnabled,
      fullName: repo.fullName,
    };
  },
});

export const createReview = internalMutation({
  args: {
    userId: v.string(),
    repositoryId: v.id("repositories"),
    installationId: v.string(),
    prNumber: v.number(),
    prTitle: v.string(),
    prAuthor: v.string(),
    prUrl: v.string(),
    filesChanged: v.number(),
    additions: v.number(),
    deletions: v.number(),
  },
  returns: v.id("reviews"),
  handler: async (ctx, args) =>
    ctx.db.insert("reviews", {
      userId: args.userId,
      repositoryId: args.repositoryId,
      installationId: args.installationId,
      prNumber: args.prNumber,
      prTitle: args.prTitle,
      prAuthor: args.prAuthor,
      prUrl: args.prUrl,
      status: "pending",
      creditsUsed: 0,
      filesChanged: args.filesChanged,
      additions: args.additions,
      deletions: args.deletions,
      createdAt: Date.now(),
    }),
});

export const updateReviewStatus = internalMutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("reviewing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    creditsUsed: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    findings: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("bug"),
            v.literal("security"),
            v.literal("performance"),
            v.literal("style"),
            v.literal("suggestion")
          ),
          severity: v.union(
            v.literal("critical"),
            v.literal("high"),
            v.literal("medium"),
            v.literal("low")
          ),
          file: v.string(),
          line: v.optional(v.number()),
          message: v.string(),
        })
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { reviewId, ...updates } = args;
    await ctx.db.patch(reviewId, updates);
    return null;
  },
});

const DEFAULT_LIST_LIMIT = 20;

export const listRecentReviews = internalQuery({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("reviews"),
      repositoryId: v.id("repositories"),
      prNumber: v.number(),
      prTitle: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("analyzing"),
        v.literal("reviewing"),
        v.literal("completed"),
        v.literal("failed")
      ),
      creditsUsed: v.number(),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIST_LIMIT;
    const rows = await ctx.db
      .query("reviews")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return rows.map((r) => ({
      _id: r._id,
      repositoryId: r.repositoryId,
      prNumber: r.prNumber,
      prTitle: r.prTitle,
      status: r.status,
      creditsUsed: r.creditsUsed,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    }));
  },
});
