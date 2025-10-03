import { z } from "zod";
import type { Sandbox } from "@daytonaio/sdk";
import { getDaytonaClient } from "./client";
import type { CreateSandboxOptions } from "./types";


// ---------------------------------------------
// Constants & Constraints
// ---------------------------------------------

const MIN_CPU = 1;
const MAX_CPU = 4;
const MIN_MEMORY = 1; // Gi
const MAX_MEMORY = 8;
const MIN_DISK = 3; // Gi
const MAX_DISK = 10;

const DEFAULT_CPU = 1;
const DEFAULT_MEMORY = 1;
const DEFAULT_DISK = 3;

const DEFAULT_SNAPSHOT = "daytona-medium";

const ALLOWED_SNAPSHOTS = new Set([
  "daytona-small",
  "daytona-medium",
  "daytona-large",
  "daytonaio/sandbox:0.4.3",
  "daytonaio/sandbox:0.4.1",
  "daytonaio/sandbox:0.3.0",
]);

// ---------------------------------------------
// Schemas
// ---------------------------------------------

const resourcesSchema = z
  .object({
    cpu: z.number().int().min(MIN_CPU).max(MAX_CPU).default(DEFAULT_CPU),
    memory: z.number().int().min(MIN_MEMORY).max(MAX_MEMORY).default(DEFAULT_MEMORY),
    disk: z.number().int().min(MIN_DISK).max(MAX_DISK).default(DEFAULT_DISK),
  })
  .strict();

const baseSchema = z.object({
  name: z.string().optional(),
  ephemeral: z.boolean().default(true),
  autoStopInterval: z.number().int().min(0).default(0),
  autoArchiveInterval: z.number().int().min(0).default(0),
  autoDeleteInterval: z.number().int().min(0).default(0),
  envVars: z.record(z.string()).optional(),
  labels: z.record(z.string()).optional(),
});

const normalCreationSchema = baseSchema.extend({
  snapshot: z.undefined(),
  language: z
    .enum(["python", "typescript", "javascript", "go", "java", "ruby", "rust"])
    .optional(),
  resources: resourcesSchema.optional(),
});

const snapshotCreationSchema = baseSchema.extend({
  snapshot: z
    .string()
    .refine((s) => ALLOWED_SNAPSHOTS.has(s), (s) => ({
      message: `Unsupported snapshot '${s}'. Allowed: ${[...ALLOWED_SNAPSHOTS].join(", ")}`,
    })),
  language: z.undefined(),
  resources: z.undefined(),
});

type NormalCreation = z.infer<typeof normalCreationSchema>;
type SnapshotCreation = z.infer<typeof snapshotCreationSchema>;
type ValidatedCreation = NormalCreation | SnapshotCreation;

// ---------------------------------------------
// Internal Helpers
// ---------------------------------------------

function normalizeOptions(
  options?: Partial<CreateSandboxOptions>
): ValidatedCreation {
  const o = options || {};
  const wantsSnapshot = typeof o.snapshot === "string" && o.snapshot.length > 0;

  if (wantsSnapshot) {
    if (o.language) {
      throw new Error(
        `Cannot specify 'language' (${o.language}) when using a snapshot (${o.snapshot}). Remove language or omit snapshot.`
      );
    }
    if (o.resources) {
      throw new Error(
        `Cannot specify 'resources' when using a snapshot (${o.snapshot}). Remove resources or omit snapshot.`
      );
    }
    return snapshotCreationSchema.parse(o);
  }

  return normalCreationSchema.parse(o);
}

function buildDaytonaParams(validated: ValidatedCreation): Record<string, unknown> {
  const base: Record<string, unknown> = {
    ephemeral: validated.ephemeral,
    autoStopInterval: validated.autoStopInterval,
    autoArchiveInterval: validated.autoArchiveInterval,
    autoDeleteInterval: validated.autoDeleteInterval,
    envVars: validated.envVars,
    labels:
      validated.labels ??
      (validated.name ? { name: validated.name } : { name: "diff0-sandbox" }),
  };

  if ("snapshot" in validated && validated.snapshot) {
    return {
      ...base,
      snapshot: validated.snapshot,
    };
  }

  // Normal (non-snapshot) creation path
  const normal = validated as NormalCreation;
  const params: Record<string, unknown> = { ...base };

  if (normal.language) {
    params.language = normal.language;
  }

  if (normal.resources) {
    const { cpu, memory, disk } = normal.resources;
    // Daytona TS docs show resources fields as strings with units (except cpu as string number)
    params.resources = {
      cpu: String(cpu ?? DEFAULT_CPU),
      memory: `${memory ?? DEFAULT_MEMORY}Gi`,
      disk: `${disk ?? DEFAULT_DISK}Gi`,
    };
  }

  return params;
}

// ---------------------------------------------
// Public API
// ---------------------------------------------

/**
 * Create a sandbox. Uses snapshot mode when `snapshot` is provided; otherwise
 * uses language/resources mode. Enforces mutual exclusivity.
 */
export async function createSandbox(
  options?: Partial<CreateSandboxOptions>
): Promise<Sandbox> {
  const validated = normalizeOptions(options);
  const createParams = buildDaytonaParams(validated);
  const daytona = getDaytonaClient();

  try {
    const sandbox = await daytona.create(createParams as never);
    return sandbox;
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
    throw new Error(`Failed to create sandbox (${creationModeLabel(validated)}): ${msg}`);
  }
}

/**
 * PR-specific sandbox factory. Defaults to a medium snapshot for faster cold start.
 * You can override snapshot or opt into language/resources explicitly by passing
 * { snapshot: undefined, language: "...", resources: {...} }.
 */
export async function createPrSandbox(
  options?: Partial<CreateSandboxOptions>
): Promise<Sandbox> {
  const defaults: Partial<CreateSandboxOptions> = {
    snapshot: DEFAULT_SNAPSHOT,
    ephemeral: true,
    autoStopInterval: 5, // minutes
    autoDeleteInterval: 0,
    labels: {
      purpose: "pr-analysis",
      ...(options?.labels || {}),
    },
  };

  return await createSandbox({ ...defaults, ...options });
}

/**
 * Find a sandbox by id and throw if missing.
 */
export async function findSandbox(id: string): Promise<Sandbox> {
  const daytona = getDaytonaClient();
  try {
    const sandbox = await daytona.findOne({ id });
    if (!sandbox) {
      throw new Error(`Sandbox ${id} not found`);
    }
    return sandbox;
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
    throw new Error(`Failed to find sandbox '${id}': ${msg}`);
  }
}

/**
 * Manage sandbox lifecycle transitions with uniform error wrapping.
 */
export async function manageLifecycle(
  sandboxId: string,
  action: "stop" | "start" | "archive" | "delete"
): Promise<void> {
  const sandbox = await findSandbox(sandboxId);
  try {
    switch (action) {
      case "stop":
        await sandbox.stop();
        break;
      case "start":
        await sandbox.start();
        break;
      case "archive":
        await sandbox.archive();
        break;
      case "delete":
        await sandbox.delete();
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
    throw new Error(`Failed to ${action} sandbox '${sandboxId}': ${msg}`);
  }
}

// ---------------------------------------------
// Utility
// ---------------------------------------------

function creationModeLabel(v: ValidatedCreation): string {
  return "snapshot" in v && v.snapshot ? `snapshot:${v.snapshot}` : "custom";
}
