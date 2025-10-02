/** biome-ignore-all lint/suspicious/noConsole: ignore for now */
"use node";

import { codeAnalysisAgent } from "@diff0/ai/lib/agent";
import { cloneRepo } from "@diff0/sandbox/helpers/git";
import { execCommand } from "@diff0/sandbox/helpers/process";
import {
  createPrSandbox,
  manageLifecycle,
} from "@diff0/sandbox/helpers/sandbox";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

const GITHUB_API_BASE = "https://api.github.com";

export const handlePullRequestWebhook = internalAction({
  args: {
    payload: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { action, pull_request, repository, installation } = args.payload;

    console.log(
      `[PR Webhook] Action: ${action}, PR #${pull_request.number}, Repo: ${repository.full_name}`
    );

    if (
      !["opened", "reopened", "synchronize", "ready_for_review"].includes(
        action
      )
    ) {
      console.log(`Skipping PR action: ${action}`);
      return null;
    }

    if (pull_request.draft) {
      console.log(`Skipping draft PR #${pull_request.number}`);
      return null;
    }

    const installationId = String(installation.id);
    const repoFullName = repository.full_name;
    const prNumber = pull_request.number;
    const prTitle = pull_request.title;
    const prAuthor = pull_request.user.login;
    const prUrl = pull_request.html_url;
    const headRef = pull_request.head.ref;
    const baseRef = pull_request.base.ref;
    const cloneUrl = repository.clone_url;

    console.log(`Processing PR #${prNumber} in ${repoFullName}`);

    const repo = await ctx.runQuery(internal.github.reviews.findRepository, {
      installationId,
      repoFullName,
    });

    if (!repo) {
      console.log(`Repository ${repoFullName} not found in database`);
      return null;
    }

    if (!repo.userId || repo.userId === "") {
      console.log(
        `Repository ${repoFullName} not yet linked to user - waiting for OAuth callback`
      );
      return null;
    }

    if (!repo.autoReviewEnabled) {
      console.log(`Auto-review disabled for ${repoFullName}`);
      return null;
    }

    const existingReview = await ctx.runQuery(
      internal.github.reviews.findExistingReview,
      {
        repositoryId: repo._id,
        prNumber,
      }
    );

    if (existingReview) {
      if (existingReview.status === "completed") {
        console.log(`Review already completed for PR #${prNumber}`);
        return null;
      }
      if (
        ["pending", "analyzing", "reviewing"].includes(existingReview.status)
      ) {
        console.log(`Review already in progress for PR #${prNumber}`);
        return null;
      }
      console.log(`Previous review failed for PR #${prNumber}, retrying...`);
    }

    const reviewId = await ctx.runMutation(
      internal.github.reviews.createReview,
      {
        userId: repo.userId,
        repositoryId: repo._id,
        installationId,
        prNumber,
        prTitle,
        prAuthor,
        prUrl,
        filesChanged: pull_request.changed_files || 0,
        additions: pull_request.additions || 0,
        deletions: pull_request.deletions || 0,
      }
    );

    console.log(`Created review ${reviewId} for PR #${prNumber}`);

    await ctx.scheduler.runAfter(
      0,
      internal.github.prReview.analyzePullRequest,
      {
        reviewId,
        installationId,
        repoFullName,
        cloneUrl,
        prNumber,
        headRef,
        baseRef,
        userId: repo.userId,
      }
    );

    return null;
  },
});

export const analyzePullRequest = internalAction({
  args: {
    reviewId: v.id("reviews"),
    installationId: v.string(),
    repoFullName: v.string(),
    cloneUrl: v.string(),
    prNumber: v.number(),
    headRef: v.string(),
    baseRef: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    let sandboxId: string | null = null;

    try {
      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "analyzing",
        startedAt: Date.now(),
      });

      const token = await ctx.runAction(
        internal.github.auth.getInstallationToken,
        {
          installationId: args.installationId,
        }
      );

      const sandbox = await createPrSandbox({
        name: `pr-${args.prNumber}`,
        labels: {
          purpose: "pr-analysis",
          pr: String(args.prNumber),
          repo: args.repoFullName,
        },
      });
      sandboxId = sandbox.id;

      const tokenizedUrl = args.cloneUrl.replace(
        "https://",
        `https://x-access-token:${token}@`
      );

      await cloneRepo(sandboxId, {
        url: tokenizedUrl,
        path: "repo",
        branch: args.headRef,
        token,
      });

      const diffResult = await execCommand(sandboxId, {
        command: `git fetch origin ${args.baseRef} && git diff origin/${args.baseRef}...HEAD`,
        cwd: "repo",
      });

      if (diffResult.exitCode !== 0) {
        throw new Error("Failed to get PR diff");
      }

      const diff = diffResult.result;

      const analysis = await codeAnalysisAgent({
        code: diff,
        context: `PR #${args.prNumber} in ${args.repoFullName}`,
        docs: "",
      });

      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "reviewing",
      });

      const commentBody = formatReviewComment(analysis);

      await postComment(token, args.repoFullName, args.prNumber, commentBody);

      let creditsUsed = 1;
      try {
        await ctx.runMutation(api.credits.deductCredits, {
          userId: args.userId,
          amount: 1,
          description: `PR review for ${args.repoFullName}#${args.prNumber}`,
        });
      } catch (_err) {
        creditsUsed = 0;
      }

      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "completed",
        completedAt: Date.now(),
        creditsUsed,
        findings: analysis.issues.map(
          (issue: {
            type: string;
            severity: string;
            file?: string;
            line?: number;
            message: string;
          }) => ({
            type: issue.type as
              | "bug"
              | "security"
              | "performance"
              | "style"
              | "suggestion",
            severity: issue.severity as "critical" | "high" | "medium" | "low",
            file: issue.file || "unknown",
            line: issue.line,
            message: issue.message,
          })
        ),
      });
    } catch (error) {
      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });
      throw error;
    } finally {
      if (sandboxId) {
        await manageLifecycle(sandboxId, "delete");
      }
    }

    return null;
  },
});

async function postComment(
  token: string,
  repoFullName: string,
  prNumber: number,
  body: string
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${repoFullName}/issues/${prNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to post comment: ${response.statusText}`);
  }
}

function formatReviewComment(analysis: {
  issues: Array<{
    type: string;
    severity: string;
    file?: string;
    line?: number;
    message: string;
    suggestion?: string;
  }>;
}): string {
  if (analysis.issues.length === 0) {
    return "✅ **AI Review Complete** - No issues found!";
  }

  const MAX_ISSUES = 20;
  const issues =
    analysis.issues.length > MAX_ISSUES
      ? analysis.issues.slice(0, MAX_ISSUES)
      : analysis.issues;

  let comment = "## 🤖 AI Code Review\n\n";
  comment += `Found ${analysis.issues.length} issue(s)${
    analysis.issues.length > MAX_ISSUES ? ` (showing top ${MAX_ISSUES})` : ""
  }:\n\n`;

  for (const issue of issues) {
    const icon =
      {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🟢",
      }[issue.severity] || "⚪";

    comment += `### ${icon} ${issue.type.toUpperCase()} - ${issue.severity}\n`;
    if (issue.file) {
      comment += `**File:** \`${issue.file}\``;
      if (issue.line) {
        comment += `:${issue.line}`;
      }
      comment += "\n";
    }
    comment += `${issue.message}\n`;
    if (issue.suggestion) {
      comment += `\nSuggested fix:\n\n\`\`\`\n${issue.suggestion}\n\`\`\`\n`;
    }
    comment += "\n";
  }

  comment += "---\n*Powered by diff0 AI*";

  return comment;
}
