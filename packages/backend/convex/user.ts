import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./auth";

export const updateUserName = mutation({
  args: {
    name: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    name: v.string(),
    previousName: v.string(),
    updated: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const user = await authComponent.getAuthUser(ctx);

    // Normalize input
    const raw = args.name;
    const trimmed = raw.trim();

    // Basic validations (mirror what frontend zod also enforces, but never trust client)
    if (trimmed.length < 2 || trimmed.length > 64) {
      throw new Error("Name must be between 2 and 64 characters");
    }

    // Disallow control characters (except common whitespace already trimmed)
    if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
      throw new Error("Name contains invalid control characters");
    }

    const previousName = user.name;

    // Idempotent no-op if unchanged
    if (previousName === trimmed) {
      return {
        success: true,
        name: previousName,
        previousName,
        updated: false,
      };
    }

    // Persist update
    await createAuth(ctx).api.updateUser({
      body: { name: trimmed },
      headers: await authComponent.getHeaders(ctx),
    });

    return {
      success: true,
      name: trimmed,
      previousName: previousName,
      updated: true,
    };
  },
});
