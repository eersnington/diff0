"use client";

import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { CreditCard, FileCode, GitBranch, TrendingUp } from "lucide-react";
import Link from "next/link";
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
  preloadedStats: Preloaded<FunctionReference<"query", "public">>;
  preloadedRecentReviews: Preloaded<FunctionReference<"query", "public">>;
};

type ReviewStatus =
  | "pending"
  | "analyzing"
  | "reviewing"
  | "completed"
  | "failed";

type RecentReview = {
  _id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  status: ReviewStatus;
  createdAt: number;
  completedAt?: number;
  repository: { name: string; fullName: string; owner: string };
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "pending",
  analyzing: "analyzing",
  reviewing: "reviewing",
  completed: "completed",
  failed: "failed",
};

const STATUS_CLASS: Record<ReviewStatus, string> = {
  pending:
    "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400",
  analyzing:
    "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400",
  reviewing:
    "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400",
  completed:
    "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300",
  failed:
    "border-neutral-400 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300",
};

function formatRelative(ts: number) {
  const deltaMs = Date.now() - ts;
  // biome-ignore lint/style/noMagicNumbers: not a magic number
  const sec = Math.floor(deltaMs / 1000);
  if (sec < 60) {
    return `${sec}s ago`;
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min}m ago`;
  }
  const hrs = Math.floor(min / 60);
  if (hrs < 24) {
    return `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function DashboardContent({
  preloadedUser,
  preloadedCredits,
  preloadedStats,
  preloadedRecentReviews,
}: DashboardContentProps) {
  const user = usePreloadedQuery(preloadedUser);
  const credits = usePreloadedQuery(preloadedCredits);
  const stats = usePreloadedQuery(preloadedStats);
  const recentReviewsRaw = usePreloadedQuery(preloadedRecentReviews);

  const recentReviews = (recentReviewsRaw ?? []) as RecentReview[];

  const dashboardStats = [
    {
      title: "Available Credits",
      value: credits?.balance ?? 0,
      icon: CreditCard,
      description: "credits remaining",
    },
    {
      title: "Reviews This Month",
      value: stats?.reviewsThisMonth ?? 0,
      icon: FileCode,
      description: "reviews this month",
    },
    {
      title: "Connected Repositories",
      value: stats?.connectedRepositories ?? 0,
      icon: GitBranch,
      description: "active repositories",
    },
    {
      title: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      icon: TrendingUp,
      description: "all-time reviews",
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

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 font-mono">
        <div className="mb-4">
          <h2 className="font-bold text-3xl tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-muted-foreground">
            Overview of recent code review activity
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl tabular-nums">
                  {stat.value}
                </div>
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
              {recentReviews.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded border border-dashed">
                  <div className="text-center">
                    <FileCode className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-3 text-muted-foreground text-sm">
                      No recent reviews
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Connect a repository to get started
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
                  {recentReviews.map((review) => {
                    const status = review.status;
                    return (
                      <div
                        className="group rounded border px-3 py-2 text-xs transition-colors hover:bg-accent/40"
                        key={review._id}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1 truncate">
                            <a
                              className="truncate font-medium hover:underline"
                              href={review.prUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {review.repository.fullName}#{review.prNumber}
                            </a>
                          </div>
                          <span
                            className={`shrink-0 select-none rounded-sm border px-1.5 py-[2px] leading-none tracking-wide ${STATUS_CLASS[status]}`}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-neutral-500 dark:text-neutral-400">
                          {review.prTitle}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-500">
                          <span>{formatRelative(review.createdAt)}</span>
                          {review.completedAt && (
                            <span className="text-neutral-400 dark:text-neutral-600">
                              • done {formatRelative(review.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  className="flex items-center justify-between rounded border px-3 py-2 transition-colors hover:bg-accent/50"
                  href="/settings"
                >
                  <div className="flex items-center gap-2 truncate">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">Connect GitHub</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    install app
                  </span>
                </Link>
                <Link
                  className="flex items-center justify-between rounded border px-3 py-2 transition-colors hover:bg-accent/50"
                  href="/billing"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">Buy Credits</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    top up
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
