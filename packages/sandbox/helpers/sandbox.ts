import type { Sandbox } from "@daytonaio/sdk";
import { z } from "zod";
import { getDaytonaClient } from "./client";
import type { CreateSandboxOptions } from "./types";

const RESOURCE_LIMITS = {
	MIN_CPU: 1,
	MAX_CPU: 4,
	MIN_MEMORY: 1,
	MAX_MEMORY: 8,
	MIN_DISK: 3,
	MAX_DISK: 10,
} as const;

const RESOURCE_DEFAULTS = {
	CPU: 1,
	MEMORY: 1,
	DISK: 3,
} as const;

const DEFAULT_SNAPSHOT = "daytona-medium";

const ALLOWED_SNAPSHOTS = new Set([
	"daytona-small",
	"daytona-medium",
	"daytona-large",
	"daytonaio/sandbox:0.4.3",
	"daytonaio/sandbox:0.4.1",
	"daytonaio/sandbox:0.3.0",
]);

const PR_SANDBOX_DEFAULTS = {
	AUTO_STOP_INTERVAL: 5,
	AUTO_DELETE_INTERVAL: 0,
} as const;

function extractErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "Unknown error";
}

const resourcesSchema = z
	.object({
		cpu: z
			.number()
			.int()
			.min(RESOURCE_LIMITS.MIN_CPU)
			.max(RESOURCE_LIMITS.MAX_CPU)
			.default(RESOURCE_DEFAULTS.CPU),
		memory: z
			.number()
			.int()
			.min(RESOURCE_LIMITS.MIN_MEMORY)
			.max(RESOURCE_LIMITS.MAX_MEMORY)
			.default(RESOURCE_DEFAULTS.MEMORY),
		disk: z
			.number()
			.int()
			.min(RESOURCE_LIMITS.MIN_DISK)
			.max(RESOURCE_LIMITS.MAX_DISK)
			.default(RESOURCE_DEFAULTS.DISK),
	})
	.strict();

const baseSchema = z.object({
	name: z.string().optional(),
	ephemeral: z.boolean().default(true),
	autoStopInterval: z.number().int().min(0).default(0),
	autoArchiveInterval: z.number().int().min(0).default(0),
	autoDeleteInterval: z.number().int().min(0).default(0),
	envVars: z.record(z.string(), z.string()).optional(),
	labels: z.record(z.string(), z.string()).optional(),
});

const normalCreationSchema = baseSchema.extend({
	snapshot: z.undefined(),
	language: z
		.enum(["python", "typescript", "javascript", "go", "java", "ruby", "rust"])
		.optional(),
	resources: resourcesSchema.optional(),
});

const snapshotCreationSchema = baseSchema.extend({
	snapshot: z.string().superRefine((s, ctx) => {
		if (!ALLOWED_SNAPSHOTS.has(s)) {
			ctx.addIssue({
				code: "custom", // Raw string instead of z.ZodIssueCode.custom
				message: `Unsupported snapshot '${s}'. Allowed: ${[...ALLOWED_SNAPSHOTS].join(", ")}`,
			});
		}
	}),
	language: z.undefined(),
	resources: z.undefined(),
});

type NormalCreation = z.infer<typeof normalCreationSchema>;
type SnapshotCreation = z.infer<typeof snapshotCreationSchema>;
type ValidatedCreation = NormalCreation | SnapshotCreation;

function normalizeOptions(
	options?: Partial<CreateSandboxOptions>,
): ValidatedCreation {
	const o = options || {};
	const wantsSnapshot = typeof o.snapshot === "string" && o.snapshot.length > 0;

	if (wantsSnapshot) {
		if (o.language) {
			throw new Error(
				`Cannot specify 'language' (${o.language}) when using a snapshot (${o.snapshot}). Remove language or omit snapshot.`,
			);
		}
		if (o.resources) {
			throw new Error(
				`Cannot specify 'resources' when using a snapshot (${o.snapshot}). Remove resources or omit snapshot.`,
			);
		}
		return snapshotCreationSchema.parse(o);
	}

	return normalCreationSchema.parse(o);
}

function buildDaytonaParams(
	validated: ValidatedCreation,
): Record<string, unknown> {
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

	const normal = validated as NormalCreation;
	const params: Record<string, unknown> = { ...base };

	if (normal.language) {
		params.language = normal.language;
	}

	if (normal.resources) {
		const { cpu, memory, disk } = normal.resources;
		params.resources = {
			cpu: String(cpu ?? RESOURCE_DEFAULTS.CPU),
			memory: `${memory ?? RESOURCE_DEFAULTS.MEMORY}Gi`,
			disk: `${disk ?? RESOURCE_DEFAULTS.DISK}Gi`,
		};
	}

	return params;
}

function creationModeLabel(v: ValidatedCreation): string {
	return "snapshot" in v && v.snapshot ? `snapshot:${v.snapshot}` : "custom";
}

export async function createSandbox(
	options?: Partial<CreateSandboxOptions>,
): Promise<Sandbox> {
	const validated = normalizeOptions(options);
	const createParams = buildDaytonaParams(validated);
	const daytona = getDaytonaClient();

	try {
		const sandbox = await daytona.create(createParams as never);
		return sandbox;
	} catch (error) {
		const msg = extractErrorMessage(error);
		throw new Error(
			`Failed to create sandbox (${creationModeLabel(validated)}): ${msg}`,
		);
	}
}

export async function createPrSandbox(
	options?: Partial<CreateSandboxOptions>,
): Promise<Sandbox> {
	const defaults: Partial<CreateSandboxOptions> = {
		snapshot: DEFAULT_SNAPSHOT,
		ephemeral: true,
		autoStopInterval: PR_SANDBOX_DEFAULTS.AUTO_STOP_INTERVAL,
		autoDeleteInterval: PR_SANDBOX_DEFAULTS.AUTO_DELETE_INTERVAL,
		labels: {
			purpose: "pr-analysis",
			...(options?.labels || {}),
		},
	};

	return await createSandbox({ ...defaults, ...options });
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
		const msg = extractErrorMessage(error);
		throw new Error(`Failed to find sandbox '${id}': ${msg}`);
	}
}

export async function manageLifecycle(
	sandboxId: string,
	action: "stop" | "start" | "archive" | "delete",
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
		const msg = extractErrorMessage(error);
		throw new Error(`Failed to ${action} sandbox '${sandboxId}': ${msg}`);
	}
}
