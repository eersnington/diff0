import type { Doc } from "@d0/backend/convex/_generated/dataModel";

export type User = Doc<"users"> & {
  avatarUrl?: string;
};
