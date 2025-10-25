import { z } from "zod";
import { findSandbox } from "./sandbox";
import type {
	ExecCommandOptions,
	ExecCommandResult,
	InstallTool,
	PackageManager,
	RunCodeOptions,
	RunCodeResult,
	SessionCreateResult,
	SessionDeleteResult,
	SessionExecResult,
	SessionGetResult,
} from "./types";

const execCommandSchema = z.object({
	command: z.string().min(1),
	cwd: z.string().optional(),
	env: z.record(z.string(), z.string()).optional(), // Keys: string, Values: string  timeout: z.number().optional(),
});

const runCodeSchema = z.object({
	code: z.string().min(1),
	argv: z.array(z.string()).optional(),
	env: z.record(z.string(), z.string()).optional(),
});

const sessionExecSchema = z.object({
	sessionId: z.string().min(1),
	command: z.string().min(1),
	async: z.boolean().default(false),
});

export async function execCommand(
	sandboxId: string,
	options: ExecCommandOptions,
): Promise<ExecCommandResult> {
	const validated = execCommandSchema.parse(options);
	const sandbox = await findSandbox(sandboxId);

	const response = await sandbox.process.executeCommand(
		validated.command,
		validated.cwd,
		validated.env,
	);

	return {
		exitCode: response.exitCode,
		result: response.result,
		stderr: "",
	};
}

export async function runCode(
	sandboxId: string,
	options: RunCodeOptions,
): Promise<RunCodeResult> {
	const validated = runCodeSchema.parse(options);
	const sandbox = await findSandbox(sandboxId);

	const params = {
		argv: validated.argv,
		env: validated.env,
	};

	const response = await sandbox.process.codeRun(validated.code, params);

	return {
		exitCode: response.exitCode,
		result: response.result,
		stderr: "",
		artifacts: response.artifacts as Record<string, unknown> | undefined,
	};
}

export async function createSession(
	sandboxId: string,
	sessionId: string,
): Promise<SessionCreateResult> {
	const sandbox = await findSandbox(sandboxId);
	await sandbox.process.createSession(sessionId);

	return {
		message: `Session ${sessionId} created`,
		sessionId,
	};
}

export async function execInSession(
	sandboxId: string,
	sessionId: string,
	command: string,
	async = false,
): Promise<SessionExecResult> {
	const validated = sessionExecSchema.parse({
		sessionId,
		command,
		async,
	});

	const result = await execCommand(sandboxId, {
		command: validated.command,
		cwd: undefined,
		env: undefined,
	});

	return {
		exitCode: result.exitCode,
		result: result.result,
		stderr: result.stderr,
	};
}

export async function getSession(
	sandboxId: string,
	sessionId: string,
): Promise<SessionGetResult> {
	const sandbox = await findSandbox(sandboxId);
	const session = await sandbox.process.getSession(sessionId);

	return {
		id: sessionId,
		commands: (session.commands || []).map((cmd) => ({
			command: cmd.command,
			exitCode: cmd.exitCode ?? 0,
		})),
	};
}

export async function deleteSession(
	sandboxId: string,
	sessionId: string,
): Promise<SessionDeleteResult> {
	const sandbox = await findSandbox(sandboxId);
	await sandbox.process.deleteSession(sessionId);

	return {
		message: `Session ${sessionId} deleted`,
		sessionId,
	};
}

const INSTALL_TIMEOUT = 300_000;
const TOOL_INSTALL_TIMEOUT = 180_000;
const TEST_DEFAULT_TIMEOUT = 120_000;
const TEST_POLL_INTERVAL = 5000;

export async function installDependencies(
	sandboxId: string,
	path: string,
	packageManager: PackageManager,
): Promise<ExecCommandResult> {
	const commands: Record<PackageManager, string> = {
		npm: "npm ci",
		yarn: "yarn install --frozen-lockfile",
		pnpm: "pnpm install --frozen-lockfile",
		pip: "pip install -r requirements.txt",
	};

	return await execCommand(sandboxId, {
		command: commands[packageManager],
		cwd: path,
		timeout: INSTALL_TIMEOUT,
	});
}

export async function runTests(
	sandboxId: string,
	_path: string,
	testCommand: string,
	timeout = TEST_DEFAULT_TIMEOUT,
): Promise<ExecCommandResult> {
	const sessionId = `test-${Date.now()}`;

	try {
		await createSession(sandboxId, sessionId);
		await execInSession(sandboxId, sessionId, testCommand, true);

		let attempts = 0;
		const maxAttempts = Math.ceil(timeout / TEST_POLL_INTERVAL);

		while (attempts < maxAttempts) {
			const session = await getSession(sandboxId, sessionId);
			const lastCommand = session.commands.at(-1);

			if (lastCommand && lastCommand.exitCode !== undefined) {
				await deleteSession(sandboxId, sessionId);
				return {
					exitCode: lastCommand.exitCode,
					result: lastCommand.command,
					stderr: "",
				};
			}

			await new Promise((resolve) => setTimeout(resolve, TEST_POLL_INTERVAL));
			attempts++;
		}

		await deleteSession(sandboxId, sessionId);
		throw new Error("Test execution timed out");
	} catch (error) {
		await deleteSession(sandboxId, sessionId).catch(() => null);
		throw error;
	}
}

export async function installTool(
	sandboxId: string,
	tool: string,
	packageManager: InstallTool,
): Promise<ExecCommandResult> {
	const commands: Record<InstallTool, string> = {
		npm: `npm install -g ${tool}`,
		pip: `pip install ${tool}`,
	};

	return await execCommand(sandboxId, {
		command: commands[packageManager],
		timeout: TOOL_INSTALL_TIMEOUT,
	});
}
