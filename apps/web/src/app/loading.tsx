import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="p-4">
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-48 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded-lg" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>

        <div className="grid gap-3">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
