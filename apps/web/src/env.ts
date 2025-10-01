import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DAYTONA_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    RESEND_SENDER_EMAIL_AUTH: z.string().min(1),
    POLAR_ORGANIZATION_TOKEN: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
    POLAR_ENVIRONMENT: z.string().min(1),
    OPENPANEL_SECRET_KEY: z.string().min(1),
    SENTRY_AUTH_TOKEN: z.string().min(1),
    SENTRY_ORG: z.string().min(1),
    SENTRY_PROJECT: z.string().min(1),
    CONVEX_DEPLOYMENT: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
    NEXT_PUBLIC_CONVEX_URL: z.string().min(1),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SENDER_EMAIL_AUTH: process.env.RESEND_SENDER_EMAIL_AUTH,
    POLAR_ORGANIZATION_TOKEN: process.env.POLAR_ORGANIZATION_TOKEN,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_ENVIRONMENT: process.env.POLAR_ENVIRONMENT,
    OPENPANEL_SECRET_KEY: process.env.OPENPANEL_SECRET_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
