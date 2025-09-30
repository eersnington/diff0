"use client";

import type { Preloaded } from "convex/react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  usePreloadedQuery,
} from "convex/react";
import type { FunctionReference } from "convex/server";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayoutClient({
  children,
  preloadedUser,
}: {
  children: React.ReactNode;
  preloadedUser: Preloaded<FunctionReference<"query", "public">>;
}) {
  return (
    <>
      <AuthLoading>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent border-solid motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToAuth />
      </Unauthenticated>
      <Authenticated>
        <DashboardContent preloadedUser={preloadedUser}>
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
}: {
  children: React.ReactNode;
  preloadedUser: Preloaded<FunctionReference<"query", "public">>;
}) {
  const user = usePreloadedQuery(preloadedUser);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
