"use client";

import type { api } from "@diff0/backend/convex/_generated/api";
import { authClient } from "@diff0/backend/lib/auth-client";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { CreditCard, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setCookie } from "@/actions/cookies";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailVisibilitySwitcher } from "./email-visibility-switcher";
import ThemeSwitcherOption from "./theme-switcher";

const VISIBLE_CHAR = 0.3;

function censorEmailText(email: string): string {
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const visibleChars = Math.max(2, Math.floor(localPart.length * VISIBLE_CHAR));
  const censored = `${localPart.slice(0, visibleChars)}***`;
  return `${censored}@${domain}`;
}

export function Header({
  currentUser,
  initialCensorEmail,
}: {
  currentUser: Preloaded<typeof api.auth.getCurrentUser>;
  initialCensorEmail: boolean;
}) {
  const user = usePreloadedQuery(currentUser);
  const router = useRouter();

  const [shouldCensorEmail, setShouldCensorEmail] =
    useState(initialCensorEmail);

  const handleCensorToggle = (checked: boolean) => {
    setShouldCensorEmail(checked);
    setCookie("censorEmail", String(checked));
  };

  const getUserInitials = () => {
    if (!user?.name) {
      return "U";
    }
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <header className="absolute top-0 z-10 flex w-full items-center justify-between px-4">
      <span className="hidden font-departure-mono font-medium text-lg md:block">
        diff0.dev
      </span>

      <nav className="md:mt-2">
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative rounded-full"
                  variant="ghost"
                  size={"icon"}
                >
                  <Avatar >
                    <AvatarImage
                      alt={user.name}
                      src={user.image || undefined}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm leading-none">
                      {user.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {shouldCensorEmail
                        ? censorEmailText(user.email)
                        : user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="font-medium text-sm">Email</span>
                    <EmailVisibilitySwitcher
                      onChange={handleCensorToggle}
                      value={shouldCensorEmail}
                    />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="font-medium text-sm">Theme</span>
                    <ThemeSwitcherOption />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant={"outline"} size={"sm"}>
              <Link href={"/auth"} prefetch>
                Sign in
              </Link>
            </Button>
          )}
          <Button size={"sm"} asChild>
            <a
              href="https://github.com/eersnington/diff0"
              rel="noreferrer noopener"
              target="_blank"
            >
              Github
            </a>
          </Button>
        </div>
      </nav>
    </header>
  );
}
