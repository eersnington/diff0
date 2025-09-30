import { api } from "@diff0/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const preloadedUser = await preloadQuery(api.auth.getCurrentUser);
  const preloadedCredits = await preloadQuery(api.credits.getBalance);

  return (
    <DashboardContent
      preloadedCredits={preloadedCredits}
      preloadedUser={preloadedUser}
    />
  );
}
