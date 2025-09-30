import { api } from "@diff0/backend/convex/_generated/api";
import { getToken } from "@diff0/backend/lib/auth-server";
import { preloadQuery } from "convex/nextjs";
import { BillingContent } from "./billing-content";

export default async function BillingPage() {
  const token = await getToken();
  
  const preloadedCredits = await preloadQuery(
    api.credits.getBalance,
    {},
    { token }
  );
  const preloadedTransactions = await preloadQuery(
    api.credits.getTransactions,
    {
      limit: 10,
    },
    { token }
  );

  return (
    <BillingContent
      preloadedCredits={preloadedCredits}
      preloadedTransactions={preloadedTransactions}
    />
  );
}
