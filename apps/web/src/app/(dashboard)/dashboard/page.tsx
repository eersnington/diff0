import { api } from "@diff0/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const currentUser = await preloadQuery(api.auth.getCurrentUser);
  const credits = await preloadQuery(api.credits.getBalance);

  return (
    <DashboardContent preloadedCredits={credits} preloadedUser={currentUser} />
  );
}
