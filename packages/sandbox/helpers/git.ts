import { z } from "zod";
import { findSandbox } from "./sandbox";
import type {
  GitAddOptions,
  GitBranchListResult,
  GitCloneOptions,
  GitCommitOptions,
  GitPushOptions,
  GitStatusResult,
} from "./types";

const BRANCH_PATTERN = /## (.+?)(?:\.\.\.|$)/;
const STATUS_PREFIX_LENGTH = 3;

const cloneSchema = z.object({
  url: z.string().url(),
  path: z.string().min(1),
  branch: z.string().optional(),
  token: z.string().optional(),
});

const commitSchema = z.object({
  path: z.string().min(1),
  message: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
});

const addSchema = z.object({
  path: z.string().min(1),
  files: z.array(z.string()),
});

const pushSchema = z.object({
  path: z.string().min(1),
  remote: z.string().default("origin"),
  branch: z.string().optional(),
  force: z.boolean().default(false),
});

export async function cloneRepo(
  sandboxId: string,
  options: GitCloneOptions
): Promise<{ message: string; path: string }> {
  const validated = cloneSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    await sandbox.git.clone(
      validated.url,
      validated.path,
      validated.branch,
      undefined,
      "git",
      validated.token
    );

    return {
      message: `Repository cloned to ${validated.path}`,
      path: validated.path,
    };
  } catch (error) {
    throw new Error(
      `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function checkoutRef(
  sandboxId: string,
  path: string,
  ref: string
): Promise<{ message: string; ref: string }> {
  const sandbox = await findSandbox(sandboxId);

  try {
    const result = await sandbox.process.executeCommand(
      `git checkout ${ref}`,
      path
    );

    if (result.exitCode !== 0) {
      throw new Error("Checkout failed");
    }

    return {
      message: `Checked out ${ref}`,
      ref,
    };
  } catch (error) {
    throw new Error(
      `Failed to checkout ${ref}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getStatus(
  sandboxId: string,
  path: string
): Promise<GitStatusResult> {
  const sandbox = await findSandbox(sandboxId);

  try {
    const result = await sandbox.process.executeCommand(
      "git status --porcelain -b",
      path
    );

    if (result.exitCode !== 0) {
      throw new Error("Status check failed");
    }

    const lines = result.result.split("\n").filter(Boolean);
    const branchLine = lines[0] || "";
    const branch = branchLine.match(BRANCH_PATTERN)?.[1] || "unknown";

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const status = line.slice(0, 2);
      const file = line.slice(STATUS_PREFIX_LENGTH);

      if (status[0] !== " " && status[0] !== "?") {
        staged.push(file);
      }
      if (status[1] === "M") {
        modified.push(file);
      }
      if (status[0] === "?") {
        untracked.push(file);
      }
    }

    return {
      branch,
      ahead: 0,
      behind: 0,
      staged,
      modified,
      untracked,
    };
  } catch (error) {
    throw new Error(
      `Failed to get git status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function listBranches(
  sandboxId: string,
  path: string
): Promise<GitBranchListResult> {
  const sandbox = await findSandbox(sandboxId);

  try {
    const result = await sandbox.process.executeCommand("git branch", path);

    if (result.exitCode !== 0) {
      throw new Error("Branch list failed");
    }

    const lines = result.result.split("\n").filter(Boolean);
    let current = "";
    const branches: string[] = [];

    for (const line of lines) {
      if (line.startsWith("* ")) {
        current = line.slice(2).trim();
        branches.push(current);
      } else {
        branches.push(line.trim());
      }
    }

    return { current, branches };
  } catch (error) {
    throw new Error(
      `Failed to list branches: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function addFiles(
  sandboxId: string,
  options: GitAddOptions
): Promise<{ message: string; filesAdded: number }> {
  const validated = addSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    await sandbox.git.add(validated.path, validated.files);

    return {
      message: `Added ${validated.files.length} file(s)`,
      filesAdded: validated.files.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to add files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function commit(
  sandboxId: string,
  options: GitCommitOptions
): Promise<{ message: string; sha: string }> {
  const validated = commitSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    await sandbox.git.commit(
      validated.path,
      validated.message,
      validated.author.name,
      validated.author.email
    );

    const shaResult = await sandbox.process.executeCommand(
      "git rev-parse HEAD",
      validated.path
    );

    return {
      message: `Committed: ${validated.message}`,
      sha: shaResult.result.trim(),
    };
  } catch (error) {
    throw new Error(
      `Failed to commit: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function push(
  sandboxId: string,
  options: GitPushOptions
): Promise<{ message: string; pushed: boolean }> {
  const validated = pushSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    await sandbox.git.push(validated.path);

    return {
      message: `Pushed to ${validated.remote}`,
      pushed: true,
    };
  } catch (error) {
    throw new Error(
      `Failed to push: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function pull(
  sandboxId: string,
  path: string
): Promise<{ message: string; updated: boolean }> {
  const sandbox = await findSandbox(sandboxId);

  try {
    const result = await sandbox.process.executeCommand("git pull", path);

    return {
      message: result.result.trim(),
      updated: !result.result.includes("Already up to date"),
    };
  } catch (error) {
    throw new Error(
      `Failed to pull: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function createBranch(
  sandboxId: string,
  path: string,
  branchName: string
): Promise<{ message: string; branch: string }> {
  const sandbox = await findSandbox(sandboxId);

  try {
    const result = await sandbox.process.executeCommand(
      `git checkout -b ${branchName}`,
      path
    );

    if (result.exitCode !== 0) {
      throw new Error("Branch creation failed");
    }

    return {
      message: `Created branch ${branchName}`,
      branch: branchName,
    };
  } catch (error) {
    throw new Error(
      `Failed to create branch: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
