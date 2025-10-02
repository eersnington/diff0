import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { handleGitHubWebhook } from "./github/webhooks";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/github/webhook",
  method: "POST",
  handler: handleGitHubWebhook,
});

export default http;
