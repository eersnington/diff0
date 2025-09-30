import type { Doc } from "@repo/backend/convex/_generated/dataModel";

export type User = Doc<"users"> & {
	avatarUrl?: string;
};
