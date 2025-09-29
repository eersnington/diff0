"use client";

import { authClient } from "@d0/backend/lib/auth-client";
import { Button } from "@d0/ui/button";

export function GitHubSignIn() {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      newUserCallbackURL: "/onboarding",
      callbackURL: "/", 
    })
  }

  return (
    <Button onClick={() => signIn()} variant="outline" className="font-mono">
      Sign in with GitHub
    </Button>
  );
}
