import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DAYTONA_API_KEY: z.string().min(1),
    CONVEX_DEPLOYMENT: z.string().min(1).optional(),
    CONVEX_URL: z.string().min(1).optional(),
    CONVEX_SITE: z.string().min(1).optional(),
    SITE_URL: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    DODO_PAYMENTS_API_KEY: z.string().min(1).optional(),
    DODO_PAYMENTS_ENVIRONMENT: z.enum(["test_mode", "live_mode"]).optional(),
    DODO_PAYMENTS_WEBHOOK_SECRET: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    GITHUB_APP_ID: z.string().min(1).optional(),
    GITHUB_APP_CLIENT_SECRET: z.string().min(1).optional(),
    GITHUB_APP_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_APP_PRIVATE_KEY: z.string().min(1).optional(),
    GITHUB_WEBHOOK_SECRET: z.string().min(1).optional(),
  },
  clientPrefix: "NEXT_PUBLIC",
  client: {
    NEXT_PUBLIC_100_CREDITS_PRODUCT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_200_CREDITS_PRODUCT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_500_CREDITS_PRODUCT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID: z.string().min(1).optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,

    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CONVEX_URL: process.env.CONVEX_URL,
    CONVEX_SITE: process.env.CONVEX_SITE,
    SITE_URL: process.env.SITE_URL, // web app site url
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
    DODO_PAYMENTS_ENVIRONMENT: process.env.DODO_PAYMENTS_ENVIRONMENT,
    DODO_PAYMENTS_WEBHOOK_SECRET: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_APP_ID: process.env.GITHUB_APP_ID,
    GITHUB_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID,
    GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET,
    GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
    GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
    NEXT_PUBLIC_100_CREDITS_PRODUCT_ID:
      process.env.NEXT_PUBLIC_100_CREDITS_PRODUCT_ID,
    NEXT_PUBLIC_200_CREDITS_PRODUCT_ID:
      process.env.NEXT_PUBLIC_200_CREDITS_PRODUCT_ID,
    NEXT_PUBLIC_500_CREDITS_PRODUCT_ID:
      process.env.NEXT_PUBLIC_500_CREDITS_PRODUCT_ID,
    NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID:
      process.env.NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
