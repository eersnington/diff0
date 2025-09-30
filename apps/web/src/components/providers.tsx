"use client";

import { authClient } from "@diff0/backend/lib/auth-client";
import { ConvexBetterAuthProvider } from "@diff0/backend/lib/provider";
import { ConvexReactClient } from "convex/react";
import { env } from "@/env";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
  // Optionally pause queries until the user is authenticated
  expectAuth: true,
  verbose: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <ConvexBetterAuthProvider authClient={authClient} client={convex}>
        {children}
      </ConvexBetterAuthProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
