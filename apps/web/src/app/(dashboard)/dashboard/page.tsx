import { api } from "@diff0/backend/convex/_generated/api";
import { getToken } from "@diff0/backend/lib/auth-server";
import { preloadQuery } from "convex/nextjs";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const token = await getToken();

  const preloadedDashboardData = await preloadQuery(
    api.user.getDashboardData,
    {},
    { token }
  );

  return <DashboardContent preloadedDashboardData={preloadedDashboardData} />;
}
