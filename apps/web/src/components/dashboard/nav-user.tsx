"use client";

import { authClient } from "@diff0/backend/lib/auth-client";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setCookie } from "@/actions/cookies";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { EmailVisibilitySwitcher } from "../email-visibility-switcher";
import ThemeSwitcherOption from "../theme-switcher";

type NavUserProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  initialCensorEmail: boolean;
};

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

export function NavUser({ user, initialCensorEmail }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [shouldCensorEmail, setShouldCensorEmail] =
    useState(initialCensorEmail);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const handleCensorToggle = (checked: boolean) => {
    setShouldCensorEmail(checked);
    setCookie("censorEmail", String(checked));
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage alt={user.name} src={user.image ?? undefined} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">
                  {shouldCensorEmail ? censorEmailText(user.email) : user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={user.name} src={user.image ?? undefined} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">
                    {shouldCensorEmail
                      ? censorEmailText(user.email)
                      : user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/billing")}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="font-medium text-sm">Email </span>
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
