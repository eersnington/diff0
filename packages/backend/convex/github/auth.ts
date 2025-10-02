"use node";

import { App } from "@octokit/app";
import { v } from "convex/values";
import { env } from "../../env";
import { internalAction } from "../_generated/server";

/**
 * Return an installation-scoped access token for the GitHub App.
 * Uses @octokit/app which is already present in dependencies.
 */
export const getInstallationToken = internalAction({
  args: {
    installationId: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    if (!env.GITHUB_APP_ID) {
      throw new Error("GITHUB_APP_ID not configured");
    }
    if (!env.GITHUB_APP_PRIVATE_KEY) {
      throw new Error("GITHUB_APP_PRIVATE_KEY not configured");
    }

    const app = new App({
      appId: env.GITHUB_APP_ID!,
      privateKey: env.GITHUB_APP_PRIVATE_KEY!,
    });

    // Create an installation-scoped Octokit and extract its token
    const octokit = await app.getInstallationOctokit(
      Number(args.installationId)
    );
    const authInfo = await octokit.auth();
    const token = (authInfo as unknown as { token: string }).token;

    return token;
  },
});

/**
 * Create an installation-scoped Octokit client for GitHub REST calls.
 * Not returned across the Convex boundary; use token above for fetch or create clients locally.
 */
export const getInstallationOctokitInfo = internalAction({
  args: {
    installationId: v.string(),
  },
  returns: v.object({
    appId: v.string(),
    installationId: v.string(),
  }),
  handler: (_ctx, args) => {
    if (!env.GITHUB_APP_ID) {
      throw new Error("GITHUB_APP_ID not configured");
    }
    if (!env.GITHUB_APP_PRIVATE_KEY) {
      throw new Error("GITHUB_APP_PRIVATE_KEY not configured");
    }
    return {
      appId: String(env.GITHUB_APP_ID),
      installationId: args.installationId,
    };
  },
});
