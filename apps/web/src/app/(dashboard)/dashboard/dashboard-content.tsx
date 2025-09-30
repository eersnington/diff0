"use client";

import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { CreditCard, FileCode, GitBranch, TrendingUp } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardContentProps = {
  preloadedUser: Preloaded<FunctionReference<"query", "public">>;
  preloadedCredits: Preloaded<FunctionReference<"query", "public">>;
};

export function DashboardContent({
  preloadedUser,
  preloadedCredits,
}: DashboardContentProps) {
  const user = usePreloadedQuery(preloadedUser);
  const credits = usePreloadedQuery(preloadedCredits);

  const stats = [
    {
      title: "Available Credits",
      value: credits?.balance ?? 0,
      icon: CreditCard,
      description: "Credits remaining",
    },
    {
      title: "Reviews This Month",
      value: 0,
      icon: FileCode,
      description: "AI-powered reviews",
    },
    {
      title: "Connected Repositories",
      value: 0,
      icon: GitBranch,
      description: "Active repositories",
    },
    {
      title: "Total Reviews",
      value: 0,
      icon: TrendingUp,
      description: "All-time reviews",
    },
  ];

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
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-4">
          <h2 className="font-bold text-3xl tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your AI code review activity
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stat.value}</div>
                <p className="text-muted-foreground text-xs">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <FileCode className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground text-sm">
                    No recent reviews
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Connect a repository to get started
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  href="/settings"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">Connect GitHub</p>
                      <p className="text-muted-foreground text-xs">
                        Install the GitHub App
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  href="/billing"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">Buy Credits</p>
                      <p className="text-muted-foreground text-xs">
                        Top up your review credits
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
