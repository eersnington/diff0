import { api } from "@diff0/backend/convex/_generated/api";
import { getToken } from "@diff0/backend/lib/auth-server";
import { preloadQuery } from "convex/nextjs";
import { BillingContent } from "./billing-content";

export default async function BillingPage() {
  const token = await getToken();

  const preloadedBillingData = await preloadQuery(
    api.credits.getBillingData,
    {
      limit: 10,
    },
    { token }
  );

  return <BillingContent preloadedBillingData={preloadedBillingData} />;
}
