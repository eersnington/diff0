/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: it's just 1 extra line man */

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const handleInstallationWebhook = internalMutation({
  args: {
    action: v.string(),
    installation: v.any(),
    repositories: v.optional(v.array(v.any())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const installationId = String(args.installation.id);

    const existing = await ctx.db
      .query("githubInstallations")
      .withIndex("installationId", (q) =>
        q.eq("installationId", installationId)
      )
      .first();

    if (args.action === "created") {
      if (!existing) {
        await ctx.db.insert("githubInstallations", {
          userId: "",
          installationId,
          accountId: args.installation.account.id,
          accountLogin: args.installation.account.login,
          accountType:
            args.installation.account.type === "User" ? "User" : "Organization",
          targetType:
            args.installation.account.type === "User" ? "User" : "Organization",
          permissions: {
            contents: args.installation.permissions.contents,
            pullRequests: args.installation.permissions.pull_requests,
            issues: args.installation.permissions.issues,
          },
          repositorySelection:
            args.installation.repository_selection === "all"
              ? "all"
              : "selected",
          suspendedAt: args.installation.suspended_at
            ? new Date(args.installation.suspended_at).getTime()
            : undefined,
          installedAt: new Date(args.installation.created_at).getTime(),
          updatedAt: new Date(args.installation.updated_at).getTime(),
        });
      }

      if (args.repositories) {
        for (const repo of args.repositories) {
          await ctx.db.insert("repositories", {
            installationId,
            userId: "",
            githubId: repo.id,
            nodeId: repo.node_id,
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner?.login || repo.full_name.split("/")[0],
            private: repo.private,
            defaultBranch: repo.default_branch || "main",
            language: repo.language,
            forksCount: repo.forks_count || 0,
            stargazersCount: repo.stargazers_count || 0,
            watchersCount: repo.watchers_count || 0,
            openIssuesCount: repo.open_issues_count || 0,
            autoReviewEnabled: false,
            connectedAt: Date.now(),
            lastSyncedAt: Date.now(),
          });
        }
      }
    } else if (args.action === "deleted" && existing) {
      await ctx.db.delete(existing._id);

      const repos = await ctx.db
        .query("repositories")
        .withIndex("installationId", (q) =>
          q.eq("installationId", installationId)
        )
        .collect();

      for (const repo of repos) {
        await ctx.db.delete(repo._id);
      }
    } else if (args.action === "suspend" && existing) {
      await ctx.db.patch(existing._id, {
        suspendedAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (args.action === "unsuspend" && existing) {
      await ctx.db.patch(existing._id, {
        suspendedAt: undefined,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

export const handleInstallationRepositoriesWebhook = internalMutation({
  args: {
    action: v.string(),
    installation: v.any(),
    repositories_added: v.optional(v.array(v.any())),
    repositories_removed: v.optional(v.array(v.any())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const installationId = String(args.installation.id);

    const installation = await ctx.db
      .query("githubInstallations")
      .withIndex("installationId", (q) =>
        q.eq("installationId", installationId)
      )
      .first();

    if (!installation) {
      return null;
    }

    if (args.action === "added" && args.repositories_added) {
      for (const repo of args.repositories_added) {
        const existing = await ctx.db
          .query("repositories")
          .withIndex("githubId", (q) => q.eq("githubId", repo.id))
          .first();

        if (!existing) {
          await ctx.db.insert("repositories", {
            installationId,
            userId: installation.userId,
            githubId: repo.id,
            nodeId: repo.node_id,
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.full_name.split("/")[0],
            private: repo.private,
            defaultBranch: repo.default_branch || "main",
            language: repo.language,
            forksCount: 0,
            stargazersCount: 0,
            watchersCount: 0,
            openIssuesCount: 0,
            autoReviewEnabled: false,
            connectedAt: Date.now(),
            lastSyncedAt: Date.now(),
          });
        }
      }
    }

    if (args.action === "removed" && args.repositories_removed) {
      for (const repo of args.repositories_removed) {
        const existing = await ctx.db
          .query("repositories")
          .withIndex("githubId", (q) => q.eq("githubId", repo.id))
          .first();

        if (existing) {
          await ctx.db.delete(existing._id);
        }
      }
    }

    return null;
  },
});
