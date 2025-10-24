/** biome-ignore-all lint/suspicious/noConsole: ignore for now */
import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";

export const logWebhookEvent = internalMutation({
  args: {
    source: v.union(v.literal("github"), v.literal("credits")),
    eventType: v.string(),
    deliveryId: v.string(),
    installationId: v.optional(v.string()),
    payload: v.any(),
  },
  returns: v.id("webhookEvents"),
  handler: async (ctx, args) => {
    // Idempotent insert by deliveryId to avoid duplicate processing on retries
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("webhookEvents", {
      source: args.source,
      eventType: args.eventType,
      deliveryId: args.deliveryId,
      installationId: args.installationId,
      payload: args.payload,
      processed: false,
      createdAt: Date.now(),
    });
  },
});

export const getWebhookEvent = internalQuery({
  args: { deliveryId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("webhookEvents"),
      _creationTime: v.number(),
      source: v.union(v.literal("github"), v.literal("credits")),
      eventType: v.string(),
      deliveryId: v.string(),
      installationId: v.optional(v.string()),
      payload: v.any(),
      processed: v.boolean(),
      processedAt: v.optional(v.number()),
      error: v.optional(v.string()),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) =>
    await ctx.db
      .query("webhookEvents")
      .withIndex("deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .first(),
});

export const markEventProcessed = internalMutation({
  args: {
    deliveryId: v.string(),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .first();

    if (event) {
      await ctx.db.patch(event._id, {
        processed: true,
        processedAt: Date.now(),
        error: args.error,
      });
    }
    return null;
  },
});

export const routeEvent = internalAction({
  args: {
    eventType: v.string(),
    deliveryId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(
      `[Route] Processing ${args.eventType} event: ${args.deliveryId}`
    );

    const event = await ctx.runQuery(internal.github.handlers.getWebhookEvent, {
      deliveryId: args.deliveryId,
    });

    if (!event) {
      console.error(`[Route] Event not found: ${args.deliveryId}`);
      throw new Error("Event not found");
    }

    try {
      switch (args.eventType) {
        case "pull_request":
          console.log("[Route] Handling pull_request event");
          await ctx.runAction(
            internal.github.prReview.handlePullRequestWebhook,
            {
              payload: event.payload,
            }
          );
          break;

        case "issue_comment":
          console.log("[Route] Skipping issue_comment event (not implemented)");
          break;

        case "pull_request_review_comment":
          console.log(
            "[Route] Skipping pull_request_review_comment event (not implemented)"
          );
          break;

        case "installation":
          console.log("[Route] Handling installation event");
          await ctx.runMutation(
            internal.github.installationHandlers.handleInstallationWebhook,
            {
              action: event.payload.action,
              installation: event.payload.installation,
              repositories: event.payload.repositories,
            }
          );
          break;

        case "installation_repositories":
          console.log("[Route] Handling installation_repositories event");
          await ctx.runMutation(
            internal.github.installationHandlers
              .handleInstallationRepositoriesWebhook,
            {
              action: event.payload.action,
              installation: event.payload.installation,
              repositories_added: event.payload.repositories_added,
              repositories_removed: event.payload.repositories_removed,
            }
          );
          break;

        case "check_run":
        case "check_suite":
          console.log(
            `[Route] Skipping ${args.eventType} event (not implemented)`
          );
          break;

        default:
          console.log(`[Route] Unknown event type: ${args.eventType}`);
          break;
      }

      await ctx.runMutation(internal.github.handlers.markEventProcessed, {
        deliveryId: args.deliveryId,
      });
      console.log(`[Route] Successfully processed event: ${args.deliveryId}`);
    } catch (error) {
      console.error(`[Route] Error processing ${args.deliveryId}:`, error);
      await ctx.runMutation(internal.github.handlers.markEventProcessed, {
        deliveryId: args.deliveryId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
    return null;
  },
});
