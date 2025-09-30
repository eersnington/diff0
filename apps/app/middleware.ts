import { authMiddleware } from "@repo/auth/middleware";
import { parseError } from "@repo/observability/error";
import { secure } from "@repo/security";
import {
	noseconeMiddleware,
	noseconeOptions,
	noseconeOptionsWithToolbar,
} from "@repo/security/middleware";
import { type NextMiddleware, NextResponse } from "next/server";
import { env } from "./env";

const securityHeaders = env.FLAGS_SECRET
	? noseconeMiddleware(noseconeOptionsWithToolbar)
	: noseconeMiddleware(noseconeOptions);

const middleware = authMiddleware(async (request) => {
	if (!env.ARCJET_KEY) {
		return securityHeaders();
	}

	try {
		await secure(
			[
				// See https://docs.arcjet.com/bot-protection/identifying-bots
				"CATEGORY:SEARCH_ENGINE", // Allow search engines
				"CATEGORY:AI",
				"CATEGORY:PREVIEW", // Allow preview links to show OG images
				"CATEGORY:MONITOR", // Allow uptime monitoring services
			],
			request,
		);

		return securityHeaders();
	} catch (error) {
		const message = parseError(error);

		return NextResponse.json({ error: message }, { status: 403 });
	}
}) as unknown as NextMiddleware;

export default middleware;

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
