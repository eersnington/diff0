/** biome-ignore-all lint/nursery/useImageSize: wrong suggestion here*/
/** biome-ignore-all lint/performance/noImgElement: i will go bankrupt with <Image> cost */
"use client";

import { CheckoutLink } from "@convex-dev/polar/react";
import { api } from "@d0/backend/convex/_generated/api";
import { authClient } from "@d0/backend/lib/auth-client";
import { Button, buttonVariants } from "@d0/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@d0/ui/components/ui/dropdown-menu";

import { cn } from "@d0/ui/utils";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  Slash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";

export function Navigation({
  preloadedUser,
  preloadedProducts,
}: {
  preloadedUser: Preloaded<typeof api.users.getUser>;
  preloadedProducts: Preloaded<typeof api.subscriptions.listAllProducts>;
}) {
  const signOut = async () => {
    await authClient.signOut();
  };

  const pathname = usePathname();
  const router = useRouter();
  const isDashboardPath = pathname === "/";
  const isSettingsPath = pathname === "/settings";
  const isBillingPath = pathname === "/settings/billing";

  const user = usePreloadedQuery(preloadedUser);
  const products = usePreloadedQuery(preloadedProducts);

  const monthlyProProduct = products?.find(
    (product) => product.recurringInterval === "month"
  );
  const yearlyProProduct = products?.find(
    (product) => product.recurringInterval === "year"
  );

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-border border-b bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <div className="flex h-10 items-center gap-2">
          <Link className="flex h-10 items-center gap-1" href="/">
            <Image alt="logo" height={50} src="/logo.svg" width={50} />
          </Link>
          <Slash className="-rotate-12 h-6 w-6 stroke-[1.5px] text-primary/10" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-2 px-2 data-[state=open]:bg-primary/5"
                variant="ghost"
              >
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      alt={user.name ?? user.email}
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-10% from-lime-400 via-cyan-300 to-blue-500" />
                  )}

                  <p className="font-medium text-primary/80 text-sm">
                    {user?.name || ""}
                  </p>
                  <span className="flex h-5 items-center rounded-full bg-primary/10 px-2 font-medium text-primary/80 text-xs">
                    Free
                  </span>
                </div>
                <span className="flex flex-col items-center justify-center">
                  <ChevronUp className="relative top-[3px] h-[14px] w-[14px] stroke-[1.5px] text-primary/60" />
                  <ChevronDown className="relative bottom-[3px] h-[14px] w-[14px] stroke-[1.5px] text-primary/60" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 bg-card p-2"
              sideOffset={8}
            >
              <DropdownMenuLabel className="flex items-center font-normal text-primary/60 text-xs">
                Personal Account
              </DropdownMenuLabel>
              <DropdownMenuItem className="h-10 w-full cursor-pointer justify-between rounded-md bg-secondary px-2">
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      alt={user.name ?? user.email}
                      className="h-6 w-6 rounded-full object-cover"
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-10% from-lime-400 via-cyan-300 to-blue-500" />
                  )}

                  <p className="font-medium text-primary/80 text-sm">
                    {user.name || ""}
                  </p>
                </div>
                <Check className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60" />
              </DropdownMenuItem>

              <DropdownMenuSeparator className="mx-0 my-2" />
              <DropdownMenuItem className="p-0 focus:bg-transparent">
                {monthlyProProduct && yearlyProProduct && (
                  <Button asChild className="w-full" size="sm">
                    <CheckoutLink
                      polarApi={api.subscriptions}
                      productIds={[monthlyProProduct.id, yearlyProProduct.id]}
                    >
                      Upgrade to PRO
                    </CheckoutLink>
                  </Button>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex h-10 items-center gap-3">
          <a
            className={cn(
              `${buttonVariants({ variant: "outline", size: "sm" })} group hidden h-8 gap-2 rounded-full bg-transparent px-2 pr-2.5 md:flex`
            )}
            href="https://github.com/get-convex/v1/tree/main/docs"
          >
            <svg
              className="h-5 w-5 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>title</title>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-primary/60 text-sm transition group-hover:text-primary group-focus:text-primary">
              Documentation
            </span>
          </a>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 rounded-full" variant="ghost">
                {user.avatarUrl ? (
                  <img
                    alt={user.name ?? user.email}
                    className="min-h-8 min-w-8 rounded-full object-cover"
                    src={user.avatarUrl}
                  />
                ) : (
                  <span className="min-h-8 min-w-8 rounded-full bg-gradient-to-br from-10% from-lime-400 via-cyan-300 to-blue-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="-right-4 fixed min-w-56 bg-card p-2"
              sideOffset={8}
            >
              <DropdownMenuItem className="group flex-col items-start focus:bg-transparent">
                <p className="font-medium text-primary/80 text-sm group-hover:text-primary group-focus:text-primary">
                  {user?.name || ""}
                </p>
                <p className="text-primary/60 text-sm">{user?.email}</p>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => router.push("/settings")}
              >
                <span className="text-primary/60 text-sm group-hover:text-primary group-focus:text-primary">
                  Settings
                </span>
                <Settings className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className={cn(
                  "group flex h-9 justify-between rounded-md px-2 hover:bg-transparent"
                )}
              >
                <span className="w-full text-primary/60 text-sm group-hover:text-primary group-focus:text-primary">
                  Theme
                </span>
                <ThemeSwitcher />
              </DropdownMenuItem>

              <DropdownMenuSeparator className="mx-0 my-2" />

              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => signOut()}
              >
                <span className="text-primary/60 text-sm group-hover:text-primary group-focus:text-primary">
                  Log Out
                </span>
                <LogOut className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
        <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isDashboardPath ? "border-primary" : "border-transparent"
          )}
        >
          <Link
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`
            )}
            href="/"
          >
            Dashboard
          </Link>
        </div>
        <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isSettingsPath ? "border-primary" : "border-transparent"
          )}
        >
          <Link
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`
            )}
            href="/settings"
          >
            Settings
          </Link>
        </div>
        <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isBillingPath ? "border-primary" : "border-transparent"
          )}
        >
          <Link
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`
            )}
            href="/settings/billing"
          >
            Billing
          </Link>
        </div>
      </div>
    </nav>
  );
}
