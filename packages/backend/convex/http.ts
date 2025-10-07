import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { handleGitHubWebhook } from "./github/webhooks";
import { handlePolarWebhook } from "./polar/http";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/github/webhook",
  method: "POST",
  handler: handleGitHubWebhook,
});

http.route({
  path: "/polar/webhook",
  method: "POST",
  handler: handlePolarWebhook,
});

export default http;
