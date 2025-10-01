import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polar } from "./polar";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// biome-ignore lint/suspicious/noExplicitAny: Polar registerRoutes type mismatch with httpRouter
polar.registerRoutes(http as any);

export default http;
