import { Polar } from "@convex-dev/polar";
import { env } from "../env";
import { api, components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

export const polar = new Polar<DataModel>(components.polar, {
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }
    return {
      userId: user._id,
      email: user.email,
    };
  },
  organizationToken: env.POLAR_ORGANIZATION_TOKEN,
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  server: env.POLAR_ENVIRONMENT as "sandbox" | "production",
  products: {
    credits100: env.NEXT_PUBLIC_100_CREDITS_PRODUCT_ID ?? "",
    credits200: env.NEXT_PUBLIC_200_CREDITS_PRODUCT_ID ?? "",
    credits500: env.NEXT_PUBLIC_500_CREDITS_PRODUCT_ID ?? "",
    credits1000: env.NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID ?? "",
  },
});

export const {
  getConfiguredProducts,
  listAllProducts,
  generateCheckoutLink,
  generateCustomerPortalUrl,
  changeCurrentSubscription,
  cancelCurrentSubscription,
} = polar.api();
