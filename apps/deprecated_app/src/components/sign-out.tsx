"use client";

import { authClient } from "@d0/backend/lib/auth-client";
import { Icons } from "@d0/ui/components/icons";
import { Button } from "@d0/ui/components/ui/button";

export function SignOut() {
  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <Button
      className="flex items-center gap-2 font-mono"
      onClick={signOut}
      variant="outline"
    >
      <Icons.SignOut className="size-4" />
      <span>Sign out</span>
    </Button>
  );
}
