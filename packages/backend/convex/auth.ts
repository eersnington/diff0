import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { checkout, dodopayments, portal } from "@dodopayments/better-auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import DodoPayments from "dodopayments";
import { env } from "../env";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { type QueryCtx, query } from "./_generated/server";

export const dodoPayments = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY,
  environment: env.DODO_PAYMENTS_ENVIRONMENT,
});

const siteUrl = env.SITE_URL;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID as string,
        clientSecret: env.GITHUB_CLIENT_SECRET as string,
      },
    },
    plugins: [
      convex(),
      organization({
        teams: {
          enabled: true,
          maximumTeams: 10,
          allowRemovingAllTeams: false,
        },
      }),
      dodopayments({
        client: dodoPayments,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: env.NEXT_PUBLIC_100_CREDITS_PRODUCT_ID ?? "",
                slug: "credits-100",
              },
              {
                productId: env.NEXT_PUBLIC_200_CREDITS_PRODUCT_ID ?? "",
                slug: "credits-200",
              },
              {
                productId: env.NEXT_PUBLIC_500_CREDITS_PRODUCT_ID ?? "",
                slug: "credits-500",
              },
              {
                productId: env.NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID ?? "",
                slug: "credits-1000",
              },
            ],
            successUrl: `${siteUrl}/billing/success?checkout_id={CHECKOUT_ID}`,
            authenticatedUsersOnly: true,
          }),
          portal(),
        ],
      }),
    ],
  } satisfies BetterAuthOptions);
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const safeGetUser = async (ctx: QueryCtx) =>
  authComponent.safeGetAuthUser(ctx);

export const getUser = async (ctx: QueryCtx) => authComponent.getAuthUser(ctx);

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => safeGetUser(ctx),
});
