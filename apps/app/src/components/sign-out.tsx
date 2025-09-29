"use client";

import { authClient } from "@d0/backend/lib/auth-client";
import { Button } from "@d0/ui/button";
import { Icons } from "@d0/ui/icons";

export function SignOut() {
  const signOut = async () => {
    await authClient.signOut()
  }

  return (
    <Button
      onClick={signOut}
      variant="outline"
      className="font-mono gap-2 flex items-center"
    >
      <Icons.SignOut className="size-4" />
      <span>Sign out</span>
    </Button>
  );
}
