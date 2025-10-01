import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { handleGitHubWebhook } from "./github/webhooks";
import { polar } from "./polar";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// biome-ignore lint/suspicious/noExplicitAny: Polar registerRoutes type mismatch with httpRouter
polar.registerRoutes(http as any);

http.route({
  path: "/github/webhook",
  method: "POST",
  handler: handleGitHubWebhook,
});

export default http;
