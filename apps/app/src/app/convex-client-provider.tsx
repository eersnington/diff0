"use client";

import { env } from "@/env.mjs";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"; 
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { authClient } from "@d0/backend/lib/auth-client"; 

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
  verbose: true,
  // Optionally pause queries until the user is authenticated
  expectAuth: true, 
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
