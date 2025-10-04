"use client";

import type { api } from "@diff0/backend/convex/_generated/api";
import type { Preloaded } from "convex/react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  usePreloadedQuery,
} from "convex/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayoutClient({
  children,
  preloadedUser,
  initialCensorEmail,
}: {
  children: React.ReactNode;
  preloadedUser: Preloaded<typeof api.user.getCurrentUser>;
  initialCensorEmail: boolean;
}) {
  return (
    <>
      <AuthLoading>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Loader className="size-8 animate-spin" />
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToAuth />
      </Unauthenticated>
      <Authenticated>
        <DashboardContent
          initialCensorEmail={initialCensorEmail}
          preloadedUser={preloadedUser}
        >
          {children}
        </DashboardContent>
      </Authenticated>
    </>
  );
}

function RedirectToAuth() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth");
  }, [router]);

  return null;
}

function DashboardContent({
  children,
  preloadedUser,
  initialCensorEmail,
}: {
  children: React.ReactNode;
  preloadedUser: Preloaded<typeof api.user.getCurrentUser>;
  initialCensorEmail: boolean;
}) {
  const user = usePreloadedQuery(preloadedUser);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar initialCensorEmail={initialCensorEmail} user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
