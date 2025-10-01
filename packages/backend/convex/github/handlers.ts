import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";

export const logWebhookEvent = internalMutation({
  args: {
    source: v.union(v.literal("github"), v.literal("polar")),
    eventType: v.string(),
    deliveryId: v.string(),
    installationId: v.optional(v.string()),
    payload: v.any(),
  },
  returns: v.id("webhookEvents"),
  handler: async (ctx, args) =>
    await ctx.db.insert("webhookEvents", {
      source: args.source,
      eventType: args.eventType,
      deliveryId: args.deliveryId,
      installationId: args.installationId,
      payload: args.payload,
      processed: false,
      createdAt: Date.now(),
    }),
});

export const getWebhookEvent = internalQuery({
  args: { deliveryId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("webhookEvents"),
      _creationTime: v.number(),
      source: v.union(v.literal("github"), v.literal("polar")),
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
    const event = await ctx.runQuery(internal.github.handlers.getWebhookEvent, {
      deliveryId: args.deliveryId,
    });

    if (!event) {
      throw new Error("Event not found");
    }

    try {
      switch (args.eventType) {
        case "pull_request":
          await ctx.runAction(
            internal.github.prReview.handlePullRequestWebhook,
            {
              payload: event.payload,
            }
          );
          break;

        case "issue_comment":
          break;

        case "pull_request_review_comment":
          break;

        case "installation":
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
          await ctx.runMutation(
            internal.github.installationHandlers.handleInstallationRepositoriesWebhook,
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
          break;

        default:
          break;
      }

      await ctx.runMutation(internal.github.handlers.markEventProcessed, {
        deliveryId: args.deliveryId,
      });
    } catch (error) {
      await ctx.runMutation(internal.github.handlers.markEventProcessed, {
        deliveryId: args.deliveryId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
    return null;
  },
});
