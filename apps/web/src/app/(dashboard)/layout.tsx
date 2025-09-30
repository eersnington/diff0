import { api } from "@diff0/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preloadedUser = await preloadQuery(api.auth.getCurrentUser);

  return (
    <DashboardLayoutClient preloadedUser={preloadedUser}>
      {children}
    </DashboardLayoutClient>
  );
}
