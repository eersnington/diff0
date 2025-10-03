"use node";

import { createAppAuth } from "@octokit/auth-app";
import { v } from "convex/values";
import { env } from "../../env";
import { internalAction } from "../_generated/server";

function normalizePrivateKey(raw: string): string {
  const trimmed = raw.trim().replace(/^"|"$/g, ""); // strip accidental wrapping quotes
  return trimmed.includes("\\n") ? trimmed.replace(/\\n/g, "\n") : trimmed;
}

type CachedToken = {
  token: string;
  expiresAt: number; // epoch ms
};

const tokenCache = new Map<string, CachedToken>();
const TOKEN_REFRESH_BUFFER_MS = 60_000; // refresh 1 minute before official expiry

/**
 * Fetch (and cache) an installation access token for a GitHub App installation.
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

    const numericInstallationId = Number(args.installationId);
    if (Number.isNaN(numericInstallationId)) {
      throw new Error(
        `Invalid installationId: ${args.installationId} (must be numeric)`
      );
    }

    const cached = tokenCache.get(args.installationId);
    const now = Date.now();
    if (
      cached &&
      cached.expiresAt - TOKEN_REFRESH_BUFFER_MS > now &&
      cached.token.length > 20
    ) {
      return cached.token;
    }

    const privateKey = normalizePrivateKey(env.GITHUB_APP_PRIVATE_KEY);

    let authFn: ReturnType<typeof createAppAuth>;
    try {
      authFn = createAppAuth({
        appId: Number(env.GITHUB_APP_ID),
        privateKey,
        installationId: numericInstallationId, // default for later calls
      });
    } catch (e) {
      throw new Error(
        `Failed to initialize GitHub App auth: ${(e as Error).message}`
      );
    }

    try {
      const authResult = await authFn({
        type: "installation",
        installationId: numericInstallationId,
      });

      if (authResult.type !== "token" || !authResult.token) {
        throw new Error("Unexpected auth result (missing token)");
      }

      const expiresAtMs = new Date(authResult.expiresAt).getTime();
      tokenCache.set(args.installationId, {
        token: authResult.token,
        expiresAt: expiresAtMs,
      });

      return authResult.token;
    } catch (e) {
      const message = (e as Error).message || "Unknown error";
      const hints: string[] = [];
      if (/private|pem|jwt|sign|key/i.test(message)) {
        hints.push(
          "Verify the private key matches this App and that newline escapes are correct."
        );
      }
      if (/404|not found/i.test(message)) {
        hints.push(
          "Confirm the installationId belongs to this GitHub App (reinstall if necessary)."
        );
      }
      throw new Error(
        `GitHub installation token acquisition failed (installationId=${args.installationId}): ${message}${
          hints.length ? " | " + hints.join(" ") : ""
        }`
      );
    }
  },
});

/**
 * Lightweight info used by callers that assemble their own authenticated Octokit.
 * (Token itself should be fetched via getInstallationToken.)
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
    return {
      appId: String(env.GITHUB_APP_ID),
      installationId: args.installationId,
    };
  },
});
