"use client";

import { api } from "@diff0/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2, GitBranch, Github, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";

export function SettingsContent() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  const installations = useQuery(api.github.installation.getUserInstallations);
  const repositories = useQuery(
    api.github.installation.getConnectedRepositories
  );
  const isLoading = installations === undefined || repositories === undefined;

  const githubAppName =
    env.NEXT_PUBLIC_GITHUB_APP_NAME ||
    "please-add-the-app-name-into-the-env-file";

  useEffect(() => {
    if (showToast) {
      return;
    }

    const success = searchParams?.get("success");
    const error = searchParams?.get("error");

    if (success === "github_connected") {
      toast.success("GitHub App connected successfully!");
      setShowToast(true);
    } else if (error) {
      toast.error(`Error: ${error}`);
      setShowToast(true);
    }
  }, [searchParams, showToast]);

  const hasInstallations = installations && installations.length > 0;
  const activeInstallations = installations?.filter((i) => !i.suspendedAt);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="grid gap-4">
          {/* Page header */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          {/* GitHub Integration card */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-lg" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-64 rounded-lg" />
              <div className="grid gap-2 md:grid-cols-2">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-56 rounded-lg" />
            </div>
          </div>
          {/* Connected Repositories card */}
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-56 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to enable AI-powered code reviews on
            your repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasInstallations ? (
            <div className="space-y-4">
              {activeInstallations?.map((installation) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-4"
                  key={installation._id}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{installation.accountLogin}</p>
                      <p className="text-muted-foreground text-sm">
                        {installation.accountType} •{" "}
                        {installation.repositorySelection === "all"
                          ? "All repositories"
                          : "Selected repositories"}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`https://github.com/settings/installations/${installation.installationId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Manage
                    </a>
                  </Button>
                </div>
              ))}

              <Button asChild variant="outline">
                <a
                  href={`https://github.com/apps/${githubAppName}/installations/new`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Install on Another Account
                </a>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <GitBranch className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">
                  No GitHub App Installed
                </h3>
                <p className="mb-4 max-w-sm text-muted-foreground text-sm">
                  Install the diff0 GitHub App to connect your repositories and
                  start reviewing pull requests with AI assistance.
                </p>
                <Button asChild>
                  <a
                    href={`https://github.com/apps/${githubAppName}/installations/new`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Install GitHub App
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm">What happens next?</h4>
            <ol className="ml-4 list-decimal space-y-1 text-muted-foreground text-sm">
              <li>Click the button above to install the GitHub App</li>
              <li>Choose which repositories you want to give access to</li>
              <li>Grant the necessary permissions for code reviews</li>
              <li>Come back here to see your connected repositories</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage which repositories have AI code review enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!repositories || repositories.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {hasInstallations
                  ? "No repositories connected yet. Add repositories to your installation."
                  : "No repositories connected yet. Install the GitHub App to get started."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {repositories.map((repo) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={repo._id}
                >
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{repo.fullName}</p>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        {repo.language && <span>{repo.language}</span>}
                        {repo.language && <span>•</span>}
                        <span>{repo.private ? "Private" : "Public"}</span>
                        {repo.stargazersCount > 0 && (
                          <>
                            <span>•</span>
                            <span>⭐ {repo.stargazersCount}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {repo.autoReviewEnabled ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Enabled</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <XCircle className="h-4 w-4" />
                        <span>Disabled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
