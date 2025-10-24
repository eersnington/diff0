"use client";

import type { api } from "@diff0/backend/convex/_generated/api";
import { authClient } from "@diff0/backend/lib/auth-client";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { Beaker, CreditCard, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BillingContentProps = {
  preloadedBillingData: Preloaded<typeof api.user.getBillingData>;
};

const CREDIT_PACKAGES = [
  { credits: 100, price: 10, popular: false, slug: "credits-100" },
  { credits: 200, price: 20, popular: true, slug: "credits-200" },
  { credits: 500, price: 50, popular: false, slug: "credits-500" },
  { credits: 1000, price: 100, popular: false, slug: "credits-1000" },
];

export function BillingContent({ preloadedBillingData }: BillingContentProps) {
  const billingData = usePreloadedQuery(preloadedBillingData);
  const credits = billingData.balance;
  const transactions = billingData.transactions;

  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handlePurchase = async (slug: string) => {
    setLoadingSlug(slug);
    toast.loading("Just a sec", {
      description: "Consulting the Orb 🔮 to summon your user essence...",
    });
    try {
      await authClient.dodopayments.checkout({
        slug,
      });
    } catch (_error) {
      toast.error("Failed to initiate checkout. Please try again.");
      setLoadingSlug(null);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-4">
          <h2 className="font-bold text-3xl tracking-tight">Billing</h2>
          <p className="text-muted-foreground">
            Manage your credits and view transaction history
          </p>
        </div>

        <Alert variant="destructive">
          <Beaker
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
          <AlertTitle>Early beta</AlertTitle>
          <AlertDescription>
            <p>
              Please do not give me money right now. The product is super early
              and I&apos;m not comfortable asking money for it at the moment. If
              you&apos;d like to add credits, email me at{" "}
              <Link
                className="underline underline-offset-4"
                href="mailto:hi@eers.dev"
                rel="noopener"
                target="_blank"
              >
                hi@eers.dev
              </Link>
              . I might be able to give you free credits to test stuff out!
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credits Balance
              </CardTitle>
              <CardDescription>
                Use credits to run AI code reviews on your pull requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-bold text-4xl">{credits.balance}</div>
                <p className="text-muted-foreground text-sm">
                  Available credits
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Purchased</p>
                    <p className="font-medium text-lg">
                      {credits.totalPurchased}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Used</p>
                    <p className="font-medium text-lg">{credits.totalUsed}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Credit Usage
              </CardTitle>
              <CardDescription>
                Track your AI review credit consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground text-sm">
                  Usage chart coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Up Credits</CardTitle>
            <CardDescription>
              One-time payment for credits. No monthly subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card
                  className={
                    pkg.popular ? "border-primary shadow-md" : undefined
                  }
                  key={pkg.credits}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{pkg.credits} Credits</span>
                      {pkg.popular && (
                        <span className="rounded-full bg-primary px-2 py-1 text-primary-foreground text-xs">
                          Popular
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      ${pkg.price} one-time payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      disabled={loadingSlug !== null}
                      onClick={() => handlePurchase(pkg.slug)}
                      variant="outline"
                    >
                      {loadingSlug === pkg.slug ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Purchase $${pkg.price}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-4 text-muted-foreground text-sm">
              Payment processing via Dodopayments. Credits expire in 1 year.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View your recent credit purchases and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(
                    (tx: {
                      _id: string;
                      createdAt: number;
                      type: string;
                      description: string;
                      amount: number;
                      balance: number;
                    }) => (
                      <TableRow key={tx._id}>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            tx.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.balance}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No transactions yet. Purchase credits to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
