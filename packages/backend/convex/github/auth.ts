"use node";

import type { InstallationAccessTokenAuthentication } from "@octokit/auth-app";
import { createAppAuth } from "@octokit/auth-app";
import { v } from "convex/values";
import { env } from "../../env";
import { internalAction } from "../_generated/server";

type CachedToken = {
  token: string;
  expiresAt: number;
};

const tokenCache = new Map<string, CachedToken>();
const TOKEN_REFRESH_BUFFER_MS = 60_000;
const MAX_CACHE_SIZE = 100;

function normalizePrivateKey(raw: string): string {
  const trimmed = raw.trim().replace(/^"|"$/g, "");
  return trimmed.includes("\\n") ? trimmed.replace(/\\n/g, "\n") : trimmed;
}

function validateEnvironment(): {
  appId: number;
  privateKey: string;
} {
  if (!env.GITHUB_APP_ID) {
    throw new Error("GITHUB_APP_ID not configured");
  }
  if (!env.GITHUB_APP_PRIVATE_KEY) {
    throw new Error("GITHUB_APP_PRIVATE_KEY not configured");
  }

  const appId = Number(env.GITHUB_APP_ID);
  if (Number.isNaN(appId)) {
    throw new Error("GITHUB_APP_ID must be numeric");
  }

  return {
    appId,
    privateKey: normalizePrivateKey(env.GITHUB_APP_PRIVATE_KEY),
  };
}

function evictOldestCacheEntry(): void {
  if (tokenCache.size < MAX_CACHE_SIZE) return;

  let oldestKey: string | null = null;
  let oldestExpiry = Number.POSITIVE_INFINITY;

  for (const [key, value] of tokenCache.entries()) {
    if (value.expiresAt < oldestExpiry) {
      oldestExpiry = value.expiresAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    tokenCache.delete(oldestKey);
  }
}

function isCachedTokenValid(cached: CachedToken | undefined): boolean {
  if (!cached) return false;

  const now = Date.now();
  const effectiveExpiry = cached.expiresAt - TOKEN_REFRESH_BUFFER_MS;

  return effectiveExpiry > now;
}

async function fetchNewToken(
  installationId: number
): Promise<{ token: string; expiresAt: number }> {
  const { appId, privateKey } = validateEnvironment();

  const authFn = createAppAuth({
    appId,
    privateKey,
    installationId,
  });

  const authResult = (await authFn({
    type: "installation",
    installationId,
  })) as InstallationAccessTokenAuthentication;

  if (authResult.type !== "token" || !authResult.token) {
    throw new Error("Unexpected auth result: missing token");
  }

  return {
    token: authResult.token,
    expiresAt: new Date(authResult.expiresAt).getTime(),
  };
}

function categorizeAuthError(error: Error): string {
  const message = error.message.toLowerCase();
  const hints: string[] = [];

  if (
    message.includes("private") ||
    message.includes("pem") ||
    message.includes("jwt") ||
    message.includes("sign") ||
    message.includes("key")
  ) {
    hints.push("Verify private key format and newline escapes");
  }

  if (message.includes("404") || message.includes("not found")) {
    hints.push("Confirm installationId belongs to this App");
  }

  if (message.includes("401") || message.includes("unauthorized")) {
    hints.push("Check App permissions and installation status");
  }

  return hints.length > 0 ? ` | ${hints.join(" | ")}` : "";
}

export const getInstallationToken = internalAction({
  args: {
    installationId: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const numericInstallationId = Number(args.installationId);
    if (Number.isNaN(numericInstallationId)) {
      throw new Error(
        `Invalid installationId: ${args.installationId} (must be numeric)`
      );
    }

    const cached = tokenCache.get(args.installationId);
    if (cached && isCachedTokenValid(cached)) {
      return cached.token;
    }

    try {
      const { token, expiresAt } = await fetchNewToken(numericInstallationId);

      evictOldestCacheEntry();
      tokenCache.set(args.installationId, { token, expiresAt });

      return token;
    } catch (error) {
      const err = error as Error;
      const hints = categorizeAuthError(err);
      throw new Error(
        `GitHub token acquisition failed (installationId=${args.installationId}): ${err.message}${hints}`
      );
    }
  },
});

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
