import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { env } from "../env";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

const polarClient = new Polar({
  accessToken: env.POLAR_ORGANIZATION_TOKEN,
  server: env.POLAR_ENVIRONMENT,
});

export const ensurePolarCustomer = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.user.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const customers = await polarClient.customers.list({
        query: user.email,
      });

      const results = customers.result?.items || [];

      if (results.length > 0) {
        return null;
      }

      await polarClient.customers.create({
        email: user.email,
        externalId: user._id,
        name: user.name || user.email,
      });

      return null;
    } catch (_error) {
      throw new Error("Failed to create Polar customer");
    }
  },
});
