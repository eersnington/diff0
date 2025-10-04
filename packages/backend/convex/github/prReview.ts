/** biome-ignore-all lint/suspicious/noConsole: keep diagnostic logging for now */
"use node";

import { codeAnalysisAgent } from "@diff0/ai/lib/agent";
import { safeGeneratePrHaiku } from "@diff0/ai/lib/creative";
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

const REGEX_PATTERNS = {
  filePath: /^diff --git a\/(.+?) b\/(.+)$/,
  hunkHeader: /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/,
  positionError: /position/i,
  statusError: /422/i,
  englishInstruction:
    /^(move|change|update|consider|remove|add|replace|modify|retrieve|set|ensure|use)\b/i,
  codeTokens: /[;{}()=]/,
} as const;

const LIMITS = {
  HAIKU_INTRO_TIMEOUT: 5000,
  MAX_INLINE_COMMENTS: 50,
  MAX_SUMMARY_ISSUES: 30,
  MAX_ADDITIONAL_ISSUES: 25,
  MAX_SUGGESTION_LINES: 40,
  CREDITS_PER_REVIEW: 2,
  DIFF_CONTEXT_LINES: 3,
  DIFF_FETCH_DEPTH: 100,
} as const;

const SEVERITY_ICONS = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
} as const;

const REVIEW_TRIGGERS = [
  "opened",
  "reopened",
  "synchronize",
  "ready_for_review",
] as const;

type AnalysisIssue = {
  type: string;
  severity: string;
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
};

type AnalysisResult = {
  issues: AnalysisIssue[];
};

type DiffMap = Map<string, Map<number, number>>;

type ReviewComment = {
  path: string;
  position: number;
  body: string;
};

function getSeverityIcon(severity: string): string {
  return SEVERITY_ICONS[severity as keyof typeof SEVERITY_ICONS] || "⚪";
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 3)}...`;
}

async function postGitHubComment(
  url: string,
  token: string,
  body: Record<string, unknown>
): Promise<Response> {
  return await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
}

export const handlePullRequestWebhook = internalAction({
  args: {
    payload: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { action, pull_request, repository, installation } = args.payload;

    console.log(
      `[PR Webhook] Action=${action} PR=#${pull_request.number} Repo=${repository.full_name}`
    );

    if (!REVIEW_TRIGGERS.includes(action)) {
      console.log(`[PR Webhook] Ignoring action=${action}`);
      return null;
    }

    if (pull_request.draft) {
      console.log(`[PR Webhook] Skipping draft PR #${pull_request.number}`);
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

    console.log(
      `[PR Webhook] Begin pipeline PR #${prNumber} (${headRef} -> ${baseRef})`
    );

    const repo = await ctx.runQuery(internal.github.reviews.findRepository, {
      installationId,
      repoFullName,
    });

    if (!repo) {
      console.log(
        `[PR Webhook] Repo ${repoFullName} not registered yet (installation sync pending)`
      );
      return null;
    }

    if (!repo.userId) {
      console.log(
        `[PR Webhook] Repo ${repoFullName} missing user linkage (OAuth callback pending)`
      );
      return null;
    }

    if (!repo.autoReviewEnabled) {
      console.log(`[PR Webhook] Auto-review disabled for ${repoFullName}`);
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
        console.log(`[PR Webhook] Review already completed (#${prNumber})`);
        return null;
      }
      if (
        ["pending", "analyzing", "reviewing"].includes(existingReview.status)
      ) {
        console.log(`[PR Webhook] Review already in progress (#${prNumber})`);
        return null;
      }
      console.log(
        `[PR Webhook] Previous attempt failed for PR #${prNumber}; retrying`
      );
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

    console.log(
      `[PR Webhook] Created review record ${reviewId} for PR #${prNumber}`
    );

    try {
      const token = await ctx.runAction(
        internal.github.auth.getInstallationToken,
        { installationId }
      );

      const { haiku } = await safeGeneratePrHaiku({
        title: prTitle,
        repoFullName,
        prNumber,
        author: prAuthor,
        additions: pull_request.additions,
        deletions: pull_request.deletions,
        filesChanged: pull_request.changed_files,
      });

      const introBody =
        "✨🔮 The Orb has been consulted. I will peer into the diffs and whisper my findings.\n\n" +
        `Until the whisper arrives, a fragment of haiku emerges:\n\n_${haiku}_`;

      const res = await postGitHubComment(
        `${GITHUB_API_BASE}/repos/${repoFullName}/issues/${prNumber}/comments`,
        token,
        { body: introBody }
      );

      if (!res.ok) {
        console.log(
          `[PR Webhook] Failed to post haiku comment: ${res.status} ${res.statusText}`
        );
      }
    } catch (postErr) {
      console.log(
        "[PR Webhook] Haiku comment attempt failed (non-fatal)",
        postErr
      );
    }

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
        headSha: pull_request.head.sha,
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
    headSha: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const t0 = Date.now();
    let sandboxId: string | null = null;

    function logStep(step: string, extra?: Record<string, unknown>) {
      const delta = (Date.now() - t0).toString().padStart(5, " ");
      console.log(
        `[Analyze PR #${args.prNumber}] +${delta}ms ${step}${
          extra ? ` ${JSON.stringify(extra)}` : ""
        }`
      );
    }

    try {
      logStep("Start");
      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "analyzing",
        startedAt: Date.now(),
      });

      logStep("Fetching installation token");
      const token = await ctx.runAction(
        internal.github.auth.getInstallationToken,
        { installationId: args.installationId }
      );

      logStep("Creating sandbox");
      const sandbox = await createPrSandbox({
        name: `pr-${args.prNumber}`,
        labels: {
          purpose: "pr-analysis",
          pr: String(args.prNumber),
          repo: args.repoFullName,
        },
      });
      sandboxId = sandbox.id;
      logStep("Sandbox created", { sandboxId });

      const tokenizedUrl = args.cloneUrl.replace(
        "https://",
        `https://x-access-token:${token}@`
      );

      logStep("Cloning repository", { branch: args.headRef });
      await cloneRepo(sandboxId, {
        url: tokenizedUrl,
        path: "repo",
        branch: args.headRef,
        token,
      });
      logStep("Clone complete");

      logStep("Acquiring diff");
      const diff = await getPrDiff({
        sandboxId,
        baseRef: args.baseRef,
        prNumber: args.prNumber,
        repoFullName: args.repoFullName,
        token,
      });
      logStep("Diff acquired", { size: diff.length });

      if (!diff.trim()) {
        throw new Error("Empty diff after all retrieval strategies");
      }

      logStep("Invoking code analysis", { chars: diff.length });

      let analysis: AnalysisResult;
      try {
        analysis = (await codeAnalysisAgent({
          code: diff,
          context: `PR #${args.prNumber} in ${args.repoFullName}`,
          docs: "",
        })) as AnalysisResult;
      } catch (modelErr) {
        throw new Error(
          `Analysis agent failed: ${
            (modelErr as Error).message || String(modelErr)
          }`
        );
      }

      if (!(analysis && Array.isArray(analysis.issues))) {
        analysis = { issues: [] };
      }

      logStep("Analysis complete", { issues: analysis.issues.length });

      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "reviewing",
      });

      const diffMap = parseDiffForPositions(diff);
      logStep("Diff mapped for positions", { files: diffMap.size });

      logStep("Posting review");
      await postReviewWithFallback({
        token,
        repoFullName: args.repoFullName,
        prNumber: args.prNumber,
        commitSha: args.headSha,
        analysis,
        diffMap,
      });
      logStep("Review posted");

      let creditsUsed: number = LIMITS.CREDITS_PER_REVIEW;
      try {
        await ctx.runMutation(api.credits.deductCredits, {
          userId: args.userId,
          amount: LIMITS.CREDITS_PER_REVIEW,
          description: `PR review for ${args.repoFullName}#${args.prNumber}`,
        });
      } catch (_err) {
        creditsUsed = 0;
        logStep("Credits deduction failed (non-fatal)");
      }

      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "completed",
        completedAt: Date.now(),
        creditsUsed,
        findings: analysis.issues.map((issue) => ({
          type:
            (issue.type as
              | "bug"
              | "security"
              | "performance"
              | "style"
              | "suggestion") || "suggestion",
          severity:
            (issue.severity as "critical" | "high" | "medium" | "low") || "low",
          file: issue.file || "unknown",
          line:
            typeof issue.line === "number" && issue.line > 0
              ? issue.line
              : undefined,
          message: issue.message || "No description",
        })),
      });

      logStep("Pipeline success");
    } catch (error) {
      console.log(
        `[Analyze PR #${args.prNumber}] ERROR`,
        error instanceof Error ? error.message : String(error)
      );
      await ctx.runMutation(internal.github.reviews.updateReviewStatus, {
        reviewId: args.reviewId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });
      throw error;
    } finally {
      if (sandboxId) {
        try {
          await manageLifecycle(sandboxId, "delete");
          console.log(
            `[Analyze PR #${args.prNumber}] Sandbox ${sandboxId} cleaned`
          );
        } catch (cleanupErr) {
          console.log(
            `[Analyze PR #${args.prNumber}] Sandbox cleanup failed`,
            cleanupErr
          );
        }
      }
    }

    return null;
  },
});

async function getPrDiff(params: {
  sandboxId: string;
  baseRef: string;
  prNumber: number;
  repoFullName: string;
  token: string;
}): Promise<string> {
  const { sandboxId, baseRef, prNumber, repoFullName, token } = params;

  try {
    const apiResp = await fetch(
      `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3.diff",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (apiResp.ok) {
      const apiDiff = await apiResp.text();
      if (apiDiff.trim()) {
        console.log("[Diff] Strategy#1 (GitHub API) succeeded");
        return apiDiff;
      }
    } else {
      console.log(
        `[Diff] Strategy#1 GitHub API failed status=${apiResp.status} ${apiResp.statusText}`
      );
    }
  } catch (apiErr) {
    console.log("[Diff] Strategy#1 API request error", apiErr);
  }

  const tryGitStandard = await execCommand(sandboxId, {
    command: `git fetch origin ${baseRef} --depth=${LIMITS.DIFF_FETCH_DEPTH} && git diff --unified=${LIMITS.DIFF_CONTEXT_LINES} origin/${baseRef}...HEAD`,
    cwd: "repo",
  });

  if (tryGitStandard.exitCode === 0 && tryGitStandard.result.trim()) {
    console.log("[Diff] Strategy#2 (git diff) succeeded");
    return tryGitStandard.result;
  }

  console.log(
    `[Diff] Strategy#2 failed or empty (code=${tryGitStandard.exitCode})`
  );

  await execCommand(sandboxId, {
    command: `git fetch origin ${baseRef}:${baseRef} --depth=${LIMITS.DIFF_FETCH_DEPTH} || true`,
    cwd: "repo",
  });

  const mergeBase = await execCommand(sandboxId, {
    command: `git merge-base ${baseRef} HEAD`,
    cwd: "repo",
  });

  const mergeBaseSha = mergeBase.result.trim().split("\n")[0] || "";
  if (mergeBase.exitCode === 0 && mergeBaseSha.length >= 5) {
    const diff3 = await execCommand(sandboxId, {
      command: `git diff --unified=${LIMITS.DIFF_CONTEXT_LINES} ${mergeBaseSha}...HEAD`,
      cwd: "repo",
    });
    if (diff3.exitCode === 0 && diff3.result.trim()) {
      console.log("[Diff] Strategy#3 (merge-base) succeeded");
      return diff3.result;
    }
    console.log(`[Diff] Strategy#3 diff failed code=${diff3.exitCode}`);
  } else {
    console.log(
      `[Diff] Strategy#3 merge-base failed code=${mergeBase.exitCode}`
    );
  }

  throw new Error("Failed to get PR diff (all strategies exhausted)");
}

async function postReviewWithFallback(params: {
  token: string;
  repoFullName: string;
  prNumber: number;
  commitSha: string;
  analysis: AnalysisResult;
  diffMap: DiffMap;
}): Promise<void> {
  try {
    await postReview(
      params.token,
      params.repoFullName,
      params.prNumber,
      params.commitSha,
      params.analysis,
      params.diffMap
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      REGEX_PATTERNS.positionError.test(message) ||
      REGEX_PATTERNS.statusError.test(message)
    ) {
      console.log(
        "[Review] Inline review failed (likely position mismatch). Falling back to summary-only."
      );
      await postSummaryOnlyReview({
        token: params.token,
        repoFullName: params.repoFullName,
        prNumber: params.prNumber,
        commitSha: params.commitSha,
        analysis: params.analysis,
      });
      return;
    }
    throw err;
  }
}

async function postSummaryOnlyReview(params: {
  token: string;
  repoFullName: string;
  prNumber: number;
  commitSha: string;
  analysis: AnalysisResult;
}): Promise<void> {
  const { token, repoFullName, prNumber, commitSha, analysis } = params;

  let body = "## 🤖 AI Code Review (Summary Only)\n\n";
  if (analysis.issues.length === 0) {
    body += "✅ No issues detected.\n";
  } else {
    body += `Found ${analysis.issues.length} issue(s):\n\n`;
    for (const issue of analysis.issues.slice(0, LIMITS.MAX_SUMMARY_ISSUES)) {
      const icon = getSeverityIcon(issue.severity);
      body += `${icon} **${issue.type || "issue"}** (${issue.severity || "n/a"})`;
      if (issue.file) {
        body += ` in \`${issue.file}${issue.line ? `:${issue.line}` : ""}\``;
      }
      body += `\n${issue.message || "No description"}\n\n`;
    }
    if (analysis.issues.length > LIMITS.MAX_SUMMARY_ISSUES) {
      body += `…and ${analysis.issues.length - LIMITS.MAX_SUMMARY_ISSUES} more.\n\n`;
    }
  }
  body += "\n---\n*Inline positions unavailable. Powered by diff0 AI*";

  const resp = await postGitHubComment(
    `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${prNumber}/reviews`,
    token,
    {
      commit_id: commitSha,
      body,
      event: "COMMENT",
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `Failed to post summary-only review: ${resp.status} ${resp.statusText} - ${truncate(text, 300)}`
    );
  }
}

function parseDiffForPositions(diff: string): DiffMap {
  const filePositions = new Map<string, Map<number, number>>();

  const lines = diff.split("\n");
  let currentFile: string | null = null;
  let position = 0;
  let newLineNumber = 0;

  for (const line of lines) {
    position++;

    if (line.startsWith("diff --git")) {
      const m = line.match(REGEX_PATTERNS.filePath);
      if (m) {
        currentFile = m[2];
        if (!filePositions.has(currentFile)) {
          filePositions.set(currentFile, new Map());
        }
      }
      newLineNumber = 0;
      continue;
    }

    if (!currentFile) {
      continue;
    }

    if (
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ") ||
      line.startsWith("Binary files")
    ) {
      continue;
    }

    if (line.startsWith("@@")) {
      const m = line.match(REGEX_PATTERNS.hunkHeader);
      if (m) {
        newLineNumber = Number.parseInt(m[3], 10);
      }
      continue;
    }

    if (line.startsWith("+")) {
      filePositions.get(currentFile)?.set(newLineNumber, position);
      newLineNumber++;
    } else if (line.startsWith("-")) {
      // Don't increment newLineNumber for removed lines
    } else if (!line.startsWith("\\")) {
      filePositions.get(currentFile)?.set(newLineNumber, position);
      newLineNumber++;
    }
  }

  return filePositions;
}

async function postReview(
  token: string,
  repoFullName: string,
  prNumber: number,
  commitSha: string,
  analysis: AnalysisResult,
  diffMap: DiffMap
): Promise<void> {
  const issues = analysis.issues || [];

  if (issues.length === 0) {
    const response = await postGitHubComment(
      `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${prNumber}/reviews`,
      token,
      {
        commit_id: commitSha,
        body: "✅ **AI Review Complete** - No issues found!",
        event: "COMMENT",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to post empty review: ${response.status} ${response.statusText}`
      );
    }
    return;
  }

  const comments: ReviewComment[] = [];

  for (const issue of issues) {
    if (!(issue.file && typeof issue.line === "number")) {
      continue;
    }

    const fileMap = diffMap.get(issue.file);
    if (!fileMap) {
      continue;
    }

    const position = fileMap.get(issue.line);
    if (!position) {
      continue;
    }

    const icon = getSeverityIcon(issue.severity);

    let body = `${icon} **${(issue.type || "Issue").toUpperCase()}** (${
      issue.severity || "n/a"
    })\n\n${issue.message || "No description"}`;

    if (issue.suggestion) {
      const cleaned = sanitizeSuggestion(issue.suggestion);
      if (cleaned) {
        body += `\n\n\`\`\`suggestion\n${cleaned}\n\`\`\``;
      } else {
        console.log(
          `[Review] Dropped non-code suggestion for ${issue.file}:${issue.line}`
        );
      }
    }

    comments.push({
      path: issue.file,
      position,
      body,
    });

    if (comments.length >= LIMITS.MAX_INLINE_COMMENTS) {
      break;
    }
  }

  const summaryIssues = issues.filter(
    (issue) =>
      !(issue.file && issue.line && diffMap.get(issue.file)?.has(issue.line))
  );

  let reviewBody = `## 🤖 AI Code Review\n\nDetected ${issues.length} issue(s).`;
  if (comments.length > 0) {
    reviewBody += `\n\nPosted ${comments.length} inline comment(s).`;
  }
  if (summaryIssues.length > 0) {
    reviewBody += "\n\n### Additional Issues (no exact diff position)\n";
    for (const issue of summaryIssues.slice(0, LIMITS.MAX_ADDITIONAL_ISSUES)) {
      const icon = getSeverityIcon(issue.severity);
      reviewBody += `\n${icon} **${(issue.type || "Issue").toUpperCase()}** (${
        issue.severity || "n/a"
      })`;
      if (issue.file) {
        reviewBody += ` in \`${issue.file}${issue.line ? `:${issue.line}` : ""}\``;
      }
      reviewBody += `\n${issue.message || "No description"}\n`;
    }
    if (summaryIssues.length > LIMITS.MAX_ADDITIONAL_ISSUES) {
      reviewBody += `\n… and ${summaryIssues.length - LIMITS.MAX_ADDITIONAL_ISSUES} more not shown.\n`;
    }
  }
  reviewBody += "\n---\n*Powered by diff0 AI*";

  const response = await postGitHubComment(
    `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${prNumber}/reviews`,
    token,
    {
      commit_id: commitSha,
      body: reviewBody,
      event: "COMMENT",
      comments,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to post review: ${response.status} ${response.statusText} - ${truncate(text, 400)}`
    );
  }
}

function sanitizeSuggestion(raw: string): string | null {
  if (!raw) return null;
  let text = raw.trim();

  if (text.startsWith("```")) {
    const lines = text.split("\n").slice(1);
    const closingIndex = lines.findIndex((l) => l.trim().startsWith("```"));
    if (closingIndex >= 0) {
      text = lines.slice(0, closingIndex).join("\n").trim();
    }
  }

  const codeCandidateLines: string[] = [];
  let skipped = true;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (
      skipped &&
      REGEX_PATTERNS.englishInstruction.test(trimmed) &&
      !REGEX_PATTERNS.codeTokens.test(trimmed)
    ) {
      continue;
    }
    skipped = false;
    codeCandidateLines.push(line);
  }
  const candidate = codeCandidateLines.join("\n").trim();
  if (!candidate) return null;

  if (
    !REGEX_PATTERNS.codeTokens.test(candidate) &&
    candidate.split("\n").length === 1
  ) {
    return null;
  }

  if (candidate.includes("```")) return null;

  if (candidate.split("\n").length > LIMITS.MAX_SUGGESTION_LINES) return null;

  return candidate;
}
