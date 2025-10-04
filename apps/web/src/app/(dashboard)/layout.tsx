import { api } from "@diff0/backend/convex/_generated/api";
import { getToken } from "@diff0/backend/lib/auth-server";
import { preloadQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, cookieStore] = await Promise.all([getToken(), cookies()]);

  const preloadedUser = await preloadQuery(
    api.user.getCurrentUser,
    {},
    { token }
  );

  const censorEmailCookie = cookieStore.get("censorEmail")?.value;
  const initialCensorEmail = censorEmailCookie !== "false";

  return (
    <DashboardLayoutClient
      initialCensorEmail={initialCensorEmail}
      preloadedUser={preloadedUser}
    >
      {children}
    </DashboardLayoutClient>
  );
}
