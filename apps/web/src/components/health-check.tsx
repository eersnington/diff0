/** biome-ignore-all lint/style/noNestedTernary: no */
"use client";

import type { api } from "@diff0/backend/convex/_generated/api";
import { type Preloaded, usePreloadedQuery } from "convex/react";

type HealthCheckProps = {
  preloadedHealthCheck: Preloaded<typeof api.healthCheck.get>;
};

export function HealthCheck({ preloadedHealthCheck }: HealthCheckProps) {
  const healthCheck = usePreloadedQuery(preloadedHealthCheck);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`size-2 rounded-full ${
          healthCheck === "OK"
            ? "bg-green-500"
            : healthCheck === undefined
              ? "bg-orange-400"
              : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground text-sm">
        API Status:{" "}
        {healthCheck === undefined
          ? "Checking..."
          : healthCheck === "OK"
            ? "Connected"
            : "Error"}
      </span>
    </div>
  );
}
