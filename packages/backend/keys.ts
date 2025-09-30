import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
	createEnv({
		server: {
			CONVEX_DEPLOYMENT: z.string().optional(),
			CONVEX_URL: z.string().url().optional(),
			RESEND_API_KEY: z.string().startsWith("re_"),
			RESEND_SENDER_EMAIL_AUTH: z.string().email().optional(),
			POLAR_ORGANIZATION_TOKEN: z.string().startsWith("polar_"),
			POLAR_WEBHOOK_SECRET: z.string().startsWith("polar_"),
			GITHUB_CLIENT_ID: z.string(),
			GITHUB_CLIENT_SECRET: z.string(),
		},
		client: {},
		runtimeEnv: {
			CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
			CONVEX_URL: process.env.CONVEX_URL,
			RESEND_API_KEY: process.env.RESEND_API_KEY,
			RESEND_SENDER_EMAIL_AUTH: process.env.RESEND_SENDER_EMAIL_AUTH,
			POLAR_ORGANIZATION_TOKEN: process.env.POLAR_ORGANIZATION_TOKEN,
			POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
			GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
			GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
		},
	});
