import { api } from "@diff0/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { BillingContent } from "./billing-content";

export default async function BillingPage() {
  const preloadedCredits = await preloadQuery(api.credits.getBalance);
  const preloadedTransactions = await preloadQuery(
    api.credits.getTransactions,
    {
      limit: 10,
    }
  );

  return (
    <BillingContent
      preloadedCredits={preloadedCredits}
      preloadedTransactions={preloadedTransactions}
    />
  );
}
