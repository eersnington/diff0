import type { Sandbox } from "@daytonaio/sdk";
import { z } from "zod";
import { getDaytonaClient } from "./client";
import type { CreateSandboxOptions, DaytonaCreateParams } from "./types";

const MIN_CPU = 1;
const MAX_CPU = 4;
const DEFAULT_CPU = 1;
const MIN_MEMORY = 1;
const MAX_MEMORY = 8;
const DEFAULT_MEMORY = 1;
const MIN_DISK = 3;
const MAX_DISK = 10;
const DEFAULT_DISK = 3;

const createSandboxSchema = z.object({
  name: z.string().optional(),
  language: z
    .enum(["python", "typescript", "javascript", "go", "java", "ruby", "rust"])
    .optional(),
  ephemeral: z.boolean().default(true),
  autoStopInterval: z.number().default(0),
  autoArchiveInterval: z.number().default(0),
  autoDeleteInterval: z.number().default(0),
  resources: z
    .object({
      cpu: z.number().min(MIN_CPU).max(MAX_CPU).default(DEFAULT_CPU),
      memory: z
        .number()
        .min(MIN_MEMORY)
        .max(MAX_MEMORY)
        .default(DEFAULT_MEMORY),
      disk: z.number().min(MIN_DISK).max(MAX_DISK).default(DEFAULT_DISK),
    })
    .optional(),
  labels: z.record(z.string()).optional(),
  envVars: z.record(z.string()).optional(),
});

export async function createSandbox(
  options?: Partial<CreateSandboxOptions>
): Promise<Sandbox> {
  const validated = createSandboxSchema.parse(options || {});
  const daytona = getDaytonaClient();

  try {
    const createParams: DaytonaCreateParams = {
      language: validated.language,
      envVars: validated.envVars,
      ephemeral: validated.ephemeral,
      autoStopInterval: validated.autoStopInterval,
      autoArchiveInterval: validated.autoArchiveInterval,
      autoDeleteInterval: validated.autoDeleteInterval,
      resources: validated.resources,
      labels: validated.labels ?? { name: validated.name ?? "diff0-sandbox" },
    };

    const sandbox = await daytona.create(createParams);
    return sandbox;
  } catch (error) {
    throw new Error(
      `Failed to create sandbox: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function createPrSandbox(
  options?: Partial<CreateSandboxOptions>
): Promise<Sandbox> {
  const prDefaults: CreateSandboxOptions = {
    ephemeral: true,
    autoStopInterval: 5,
    autoDeleteInterval: 0,
    resources: {
      cpu: 2,
      memory: 4,
      disk: 8,
    },
    labels: {
      purpose: "pr-analysis",
      ...(options?.labels || {}),
    },
  };

  return await createSandbox({ ...prDefaults, ...options });
}

export async function findSandbox(id: string): Promise<Sandbox> {
  const daytona = getDaytonaClient();

  try {
    const sandbox = await daytona.findOne({ id });
    if (!sandbox) {
      throw new Error(`Sandbox ${id} not found`);
    }
    return sandbox;
  } catch (error) {
    throw new Error(
      `Failed to find sandbox: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

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
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to ${action} sandbox: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
