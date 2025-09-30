import { GitBranch, Github } from "lucide-react";
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

export default function SettingsPage() {
  const githubAppName =
    process.env.NEXT_PUBLIC_GITHUB_APP_NAME || "diff0-ai-reviewer";

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
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-4">
          <h2 className="font-bold text-3xl tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your integrations and preferences
          </p>
        </div>

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
              <div className="rounded-lg border border-dashed p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <GitBranch className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    No GitHub App Installed
                  </h3>
                  <p className="mb-4 max-w-sm text-muted-foreground text-sm">
                    Install the diff0 GitHub App to connect your repositories
                    and start reviewing pull requests with AI assistance.
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

              <div className="space-y-2">
                <h4 className="font-medium text-sm">What happens next?</h4>
                <ol className="ml-4 list-decimal space-y-1 text-muted-foreground text-sm">
                  <li>Click the button above to install the GitHub App</li>
                  <li>Choose which repositories you want to give access to</li>
                  <li>Grant the necessary permissions for code reviews</li>
                  <li>Come back here to configure auto-review settings</li>
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
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No repositories connected yet. Install the GitHub App to get
                  started.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
