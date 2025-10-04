import { v } from "convex/values";
import { z } from "zod";
import { mutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

// biome-ignore lint/suspicious/noControlCharactersInRegex: not suspicious
const NO_CONTROL_CHARS_REGEX = /^[^\u0000-\u001F\u007F]*$/;

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(64, "Name must be no more than 64 characters")
  .regex(NO_CONTROL_CHARS_REGEX, "Name contains invalid control characters");

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
    const user = await authComponent.getAuthUser(ctx);

    const trimmed = nameSchema.parse(args.name);

    const previousName = user.name;

    if (previousName === trimmed) {
      return {
        success: true,
        name: previousName,
        previousName,
        updated: false,
      };
    }

    await createAuth(ctx).api.updateUser({
      body: { name: trimmed },
      headers: await authComponent.getHeaders(ctx),
    });

    return {
      success: true,
      name: trimmed,
      previousName,
      updated: true,
    };
  },
});
