import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polar } from "./subscriptions";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// Register the webhook handler at /polar/events
polar.registerRoutes(http);

export default http;
