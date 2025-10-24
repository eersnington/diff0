import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { dodopaymentsClient } from "@dodopayments/better-auth";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
    dodopaymentsClient(),
  ],
});
