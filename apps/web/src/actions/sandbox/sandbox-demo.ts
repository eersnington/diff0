"use server";

import {
  createSandbox,
  type ExecCommandResult,
  execCommand,
  manageLifecycle,
  type RunCodeResult,
  runCode,
} from "@diff0/sandbox";

export async function executeUserCode(code: string): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  const sandbox = await createSandbox({
    name: "user-code-execution",
    resources: {
      cpu: 2,
      memory: 4,
      disk: 8,
    },
  });

  try {
    const result: RunCodeResult = await runCode(sandbox.id, {
      code,
      env: { NODE_ENV: "production" },
    });

    return {
      success: result.exitCode === 0,
      output: result.result,
      error: result.stderr || undefined,
    };
  } finally {
    await manageLifecycle(sandbox.id, "delete").catch(() => null);
  }
}

export async function cloneAndBuildRepo(repoUrl: string): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  const sandbox = await createSandbox({
    name: "build-task",
    resources: {
      cpu: 2,
      memory: 4,
      disk: 8,
    },
  });

  try {
    await execCommand(sandbox.id, {
      command: `git clone ${repoUrl} /workspace/repo`,
    });

    await execCommand(sandbox.id, {
      command: "npm install",
      cwd: "/workspace/repo",
    });

    const buildResult: ExecCommandResult = await execCommand(sandbox.id, {
      command: "npm run build",
      cwd: "/workspace/repo",
      timeout: 300_000,
    });

    return {
      success: buildResult.exitCode === 0,
      output: buildResult.result,
      error: buildResult.stderr || undefined,
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await manageLifecycle(sandbox.id, "delete").catch(() => null);
  }
}

export async function runShellCommand(
  command: string,
  cwd?: string
): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  const sandbox = await createSandbox({
    name: "shell-command",
  });

  try {
    const result: ExecCommandResult = await execCommand(sandbox.id, {
      command,
      cwd,
    });

    return {
      success: result.exitCode === 0,
      output: result.result,
      error: result.stderr || undefined,
    };
  } finally {
    await manageLifecycle(sandbox.id, "delete").catch(() => null);
  }
}
