"use server";

import {
  addFiles,
  cloneRepo,
  commit,
  createPrSandbox,
  installDependencies,
  installTool,
  manageLifecycle,
  push,
  runTests,
} from "@diff0/sandbox";

const SHA_PREFIX_LENGTH = 7;
const TEST_TIMEOUT_MS = 120_000;

async function analyzePrAndFix(input: {
  repoUrl: string;
  headSha: string;
  githubToken: string;
}) {
  let sandboxId: string | null = null;

  try {
    const sandbox = await createPrSandbox({
      name: `pr-${input.headSha.slice(0, SHA_PREFIX_LENGTH)}`,
      labels: { pr: input.headSha },
    });
    sandboxId = sandbox.id;

    await cloneRepo(sandboxId, {
      url: input.repoUrl,
      path: "repo",
      branch: input.headSha,
      token: input.githubToken,
    });

    await installDependencies(sandboxId, "repo", "npm");

    await installTool(sandboxId, "@ast-grep/cli", "npm");

    const testResult = await runTests(
      sandboxId,
      "repo",
      "npm test",
      TEST_TIMEOUT_MS
    );

    if (testResult.exitCode !== 0) {
      return {
        success: false,
        message: "Tests failed",
        output: testResult.result,
      };
    }

    return {
      success: true,
      message: "All tests passed",
      output: testResult.result,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      output: "",
    };
  } finally {
    if (sandboxId) {
      await manageLifecycle(sandboxId, "delete").catch(() => null);
    }
  }
}

async function applyFixToPr(input: {
  repoUrl: string;
  headSha: string;
  githubToken: string;
  fixContent: string;
  targetFile: string;
}) {
  let sandboxId: string | null = null;

  try {
    const sandbox = await createPrSandbox({
      name: `fix-${input.headSha.slice(0, SHA_PREFIX_LENGTH)}`,
    });
    sandboxId = sandbox.id;

    await cloneRepo(sandboxId, {
      url: input.repoUrl,
      path: "repo",
      branch: input.headSha,
      token: input.githubToken,
    });

    await addFiles(sandboxId, {
      path: "repo",
      files: ["."],
    });

    await commit(sandboxId, {
      path: "repo",
      message: "fix: Apply automated fixes",
      author: {
        name: "PR Agent",
        email: "agent@diff0.dev",
      },
    });

    await push(sandboxId, {
      path: "repo",
    });

    const verifyResult = await runTests(
      sandboxId,
      "repo",
      "npm test",
      TEST_TIMEOUT_MS
    );

    return {
      success: verifyResult.exitCode === 0,
      message:
        verifyResult.exitCode === 0
          ? "Fix applied successfully"
          : "Tests still failing after fix",
      output: verifyResult.result,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      output: "",
    };
  } finally {
    if (sandboxId) {
      await manageLifecycle(sandboxId, "delete").catch(() => null);
    }
  }
}
