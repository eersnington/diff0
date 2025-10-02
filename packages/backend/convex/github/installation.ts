import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const handleInstallationCallback = mutation({
  args: {
    installationId: v.string(),
    setupAction: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existing = await ctx.db
      .query("githubInstallations")
      .withIndex("installationId", (q) =>
        q.eq("installationId", args.installationId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId,
        updatedAt: Date.now(),
        suspendedAt: undefined,
      });

      const repos = await ctx.db
        .query("repositories")
        .withIndex("installationId", (q) =>
          q.eq("installationId", args.installationId)
        )
        .collect();

      for (const repo of repos) {
        await ctx.db.patch(repo._id, {
          userId,
        });
      }
    }

    return null;
  },
});

export const getUserInstallations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("githubInstallations"),
      installationId: v.string(),
      accountLogin: v.string(),
      accountType: v.union(v.literal("User"), v.literal("Organization")),
      repositorySelection: v.union(v.literal("all"), v.literal("selected")),
      installedAt: v.number(),
      suspendedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const installations = await ctx.db
      .query("githubInstallations")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return installations.map((installation) => ({
      _id: installation._id,
      installationId: installation.installationId,
      accountLogin: installation.accountLogin,
      accountType: installation.accountType,
      repositorySelection: installation.repositorySelection,
      installedAt: installation.installedAt,
      suspendedAt: installation.suspendedAt,
    }));
  },
});

export const getConnectedRepositories = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("repositories"),
      name: v.string(),
      fullName: v.string(),
      owner: v.string(),
      private: v.boolean(),
      autoReviewEnabled: v.boolean(),
      language: v.optional(v.string()),
      stargazersCount: v.number(),
      connectedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const repositories = await ctx.db
      .query("repositories")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return repositories.map((repo) => ({
      _id: repo._id,
      name: repo.name,
      fullName: repo.fullName,
      owner: repo.owner,
      private: repo.private,
      autoReviewEnabled: repo.autoReviewEnabled,
      language: repo.language,
      stargazersCount: repo.stargazersCount,
      connectedAt: repo.connectedAt,
    }));
  },
});

export const toggleAutoReview = mutation({
  args: {
    repositoryId: v.id("repositories"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const repository = await ctx.db.get(args.repositoryId);

    if (!repository) {
      throw new Error("Repository not found");
    }

    if (repository.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.repositoryId, {
      autoReviewEnabled: !repository.autoReviewEnabled,
    });

    return null;
  },
});
