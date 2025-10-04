import { api } from "@diff0/backend/convex/_generated/api";
import { getToken } from "@diff0/backend/lib/auth-server";
import { preloadQuery } from "convex/nextjs";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage() {
  const token = await getToken();

  const preloadedGithubSettingsData = await preloadQuery(
    api.github.installation.getGithubSettingsData,
    {},
    { token }
  );

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

        <Suspense fallback={<SettingsLoading />}>
          <SettingsContent
            preloadedGithubSettingsData={preloadedGithubSettingsData}
          />
        </Suspense>
      </div>
    </>
  );
}

function SettingsLoading() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-[300px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
}
