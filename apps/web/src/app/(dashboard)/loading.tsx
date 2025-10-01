import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardGroupLoading() {
  return (
    <div className="p-4">
      <div className="grid gap-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-5 w-56 rounded-lg" />
            <Skeleton className="h-4 w-40 rounded-lg" />
          </div>
        </div>

        {/* Two cards row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>

        {/* Content block */}
        <div className="grid gap-3">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
