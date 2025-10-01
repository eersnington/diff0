import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
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
