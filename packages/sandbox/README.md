# Daytona Sandbox Package Architecture

## Goal

Build primitives for ephemeral sandbox management to enable PR reviewer functionality with:

- Secure, isolated code execution
- Git operations (clone, checkout, commit, push)
- File system operations (upload, download, search, replace)
- Process execution (shell commands, code runs, test execution)
- AST-grep integration for code analysis

## Module Structure

### 1. `helpers/types.ts`

**Purpose**: Central type definitions for all SDK operations

**New Types to Add**:

```typescript
// Git Operations
export type GitCloneOptions = {
  url: string;
  path: string;
  branch?: string;
  token?: string;
};

export type GitCommitOptions = {
  path: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
};

export type GitAddOptions = {
  path: string;
  files: string[];
};

export type GitPushOptions = {
  path: string;
  remote?: string;
  branch?: string;
  force?: boolean;
};

export type GitStatusResult = {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
};

export type GitBranchListResult = {
  current: string;
  branches: string[];
};

// File System Operations
export type FsUploadOptions = {
  content: Buffer | string;
  destination: string;
};

export type FsDownloadResult = {
  content: Buffer;
  size: number;
};

export type FsListOptions = {
  path: string;
  recursive?: boolean;
};

export type FsListResult = {
  files: Array<{
    name: string;
    path: string;
    size: number;
    isDirectory: boolean;
  }>;
};

export type FsSearchOptions = {
  path: string;
  pattern: string;
  filePattern?: string;
};

export type FsSearchResult = {
  matches: Array<{
    file: string;
    line: number;
    content: string;
  }>;
};

export type FsReplaceOptions = {
  files: string[];
  search: string;
  replace: string;
};

export type FsReplaceResult = {
  filesModified: number;
  replacements: number;
};
```

### 2. `helpers/git.ts`

**Purpose**: Git operations for PR workflow

**Functions to Implement**:

```typescript
/**
 * Clone a repository into the sandbox
 * @param sandboxId - Sandbox ID
 * @param options - Clone options (url, path, branch, token)
 * @returns Success message
 */
export async function cloneRepo(
  sandboxId: string,
  options: GitCloneOptions
): Promise<{ message: string; path: string }>;

/**
 * Checkout a specific branch or commit
 * @param sandboxId - Sandbox ID
 * @param path - Repo path
 * @param ref - Branch name or commit SHA
 * @returns Success message
 */
export async function checkoutRef(
  sandboxId: string,
  path: string,
  ref: string
): Promise<{ message: string; ref: string }>;

/**
 * Get git status (staged, modified, untracked files)
 * @param sandboxId - Sandbox ID
 * @param path - Repo path
 * @returns Status information
 */
export async function getStatus(
  sandboxId: string,
  path: string
): Promise<GitStatusResult>;

/**
 * List all branches
 * @param sandboxId - Sandbox ID
 * @param path - Repo path
 * @returns Branch list with current branch
 */
export async function listBranches(
  sandboxId: string,
  path: string
): Promise<GitBranchListResult>;

/**
 * Stage files for commit
 * @param sandboxId - Sandbox ID
 * @param options - Add options (path, files)
 * @returns Success message
 */
export async function addFiles(
  sandboxId: string,
  options: GitAddOptions
): Promise<{ message: string; filesAdded: number }>;

/**
 * Commit staged changes
 * @param sandboxId - Sandbox ID
 * @param options - Commit options (path, message, author)
 * @returns Commit SHA
 */
export async function commit(
  sandboxId: string,
  options: GitCommitOptions
): Promise<{ message: string; sha: string }>;

/**
 * Push commits to remote
 * @param sandboxId - Sandbox ID
 * @param options - Push options (path, remote, branch, force)
 * @returns Success message
 */
export async function push(
  sandboxId: string,
  options: GitPushOptions
): Promise<{ message: string; pushed: boolean }>;

/**
 * Pull changes from remote
 * @param sandboxId - Sandbox ID
 * @param path - Repo path
 * @returns Success message
 */
export async function pull(
  sandboxId: string,
  path: string
): Promise<{ message: string; updated: boolean }>;

/**
 * Create a new branch
 * @param sandboxId - Sandbox ID
 * @param path - Repo path
 * @param branchName - New branch name
 * @returns Success message
 */
export async function createBranch(
  sandboxId: string,
  path: string,
  branchName: string
): Promise<{ message: string; branch: string }>;
```

**Implementation Notes**:

- Use `sandbox.git.clone()` with proper authentication token
- Use `sandbox.process.executeCommand()` for operations not in SDK (status, branches)
- Parse git command output to return structured data
- Handle authentication errors gracefully

### 3. `helpers/fs.ts`

**Purpose**: File system operations for code analysis and modification

**Functions to Implement**:

```typescript
/**
 * Upload file content to sandbox
 * @param sandboxId - Sandbox ID
 * @param options - Upload options (content, destination)
 * @returns Success message
 */
export async function uploadFile(
  sandboxId: string,
  options: FsUploadOptions
): Promise<{ message: string; path: string; size: number }>;

/**
 * Download file from sandbox
 * @param sandboxId - Sandbox ID
 * @param path - File path
 * @returns File content as Buffer
 */
export async function downloadFile(
  sandboxId: string,
  path: string
): Promise<FsDownloadResult>;

/**
 * List files in directory
 * @param sandboxId - Sandbox ID
 * @param options - List options (path, recursive)
 * @returns File list
 */
export async function listFiles(
  sandboxId: string,
  options: FsListOptions
): Promise<FsListResult>;

/**
 * Delete file or directory
 * @param sandboxId - Sandbox ID
 * @param path - Path to delete
 * @returns Success message
 */
export async function deleteFile(
  sandboxId: string,
  path: string
): Promise<{ message: string; deleted: boolean }>;

/**
 * Search for text/pattern in files
 * @param sandboxId - Sandbox ID
 * @param options - Search options (path, pattern, filePattern)
 * @returns Search results
 */
export async function searchFiles(
  sandboxId: string,
  options: FsSearchOptions
): Promise<FsSearchResult>;

/**
 * Replace text in files
 * @param sandboxId - Sandbox ID
 * @param options - Replace options (files, search, replace)
 * @returns Replace results
 */
export async function replaceInFiles(
  sandboxId: string,
  options: FsReplaceOptions
): Promise<FsReplaceResult>;
```

**Implementation Notes**:

- Use `sandbox.fs.uploadFile()` for file uploads
- Use `sandbox.fs.downloadFile()` for downloads
- Use `sandbox.fs.findFiles()` for searches
- Use `sandbox.fs.replaceInFiles()` for replacements
- Handle binary files appropriately

### 4. `helpers/sandbox.ts` (Updates)

**Current Implementation**: Basic create/find/lifecycle
**Updates Needed**:

- Add better ephemeral defaults for PR agent use case
- Add resource presets (small/medium/large)
- Add tags/labels for tracking PR-related sandboxes

**New Functions**:

```typescript
/**
 * Create ephemeral sandbox optimized for PR analysis
 * @param options - Creation options with PR-specific defaults
 * @returns Sandbox instance
 */
export async function createPrSandbox(
  options?: Partial<CreateSandboxOptions>
): Promise<Sandbox>;
```

**PR-Specific Defaults**:

```typescript
{
  ephemeral: true,
  autoStopInterval: 5,  // Stop after 5 min inactivity
  autoDeleteInterval: 0,  // Delete immediately on stop
  resources: {
    cpu: 2,      // Enough for npm install, tests
    memory: 4,   // Enough for build tools
    disk: 8      // Enough for deps + cloned repo
  },
  labels: {
    purpose: 'pr-analysis',
    ...userLabels
  }
}
```

### 5. `helpers/process.ts` (Updates)

**Current Implementation**: Basic exec and code run
**Updates Needed**:

- Add convenience methods for common operations
- Add session management for long-running tests
- Add timeout handling

**New Functions**:

```typescript
/**
 * Install dependencies (npm/pip/etc)
 * @param sandboxId - Sandbox ID
 * @param path - Project path
 * @param packageManager - 'npm' | 'yarn' | 'pnpm' | 'pip'
 * @returns Installation result
 */
export async function installDependencies(
  sandboxId: string,
  path: string,
  packageManager: "npm" | "yarn" | "pnpm" | "pip"
): Promise<ExecCommandResult>;

/**
 * Run tests with timeout and session management
 * @param sandboxId - Sandbox ID
 * @param path - Project path
 * @param testCommand - Test command to run
 * @param timeout - Timeout in milliseconds
 * @returns Test result
 */
export async function runTests(
  sandboxId: string,
  path: string,
  testCommand: string,
  timeout?: number
): Promise<ExecCommandResult>;

/**
 * Install tool globally (ast-grep, prettier, eslint, etc)
 * @param sandboxId - Sandbox ID
 * @param tool - Tool name
 * @param packageManager - Package manager to use
 * @returns Installation result
 */
export async function installTool(
  sandboxId: string,
  tool: string,
  packageManager: "npm" | "pip"
): Promise<ExecCommandResult>;
```

### 6. `helpers/index.ts` (Updates)

**Export all modules**:

```typescript
export * from "./types";
export * from "./client";
export * from "./sandbox";
export * from "./process";
export * from "./git";
export * from "./fs";

// Re-export Sandbox type for convenience
export type { Sandbox } from "@daytonaio/sdk";
```

## PR Agent Workflow Example

### Use Case: Analyze PR, Run Tests, Apply Fixes

```typescript
import {
  createPrSandbox,
  cloneRepo,
  checkoutRef,
  uploadFile,
  execCommand,
  installDependencies,
  installTool,
  runTests,
  searchFiles,
  replaceInFiles,
  addFiles,
  commit,
  push,
  manageLifecycle,
} from "@diff0/sandbox";

export async function analyzePrAndApplyFixes(prData: {
  repoUrl: string;
  headSha: string;
  baseSha: string;
  diffContent: string;
  githubToken: string;
}) {
  let sandboxId: string | null = null;

  try {
    // 1. Create ephemeral sandbox
    const sandbox = await createPrSandbox({
      name: `pr-${prData.headSha.slice(0, 7)}`,
      labels: {
        purpose: "pr-analysis",
        pr: prData.headSha,
      },
    });
    sandboxId = sandbox.id;

    // 2. Clone repo and checkout PR branch
    await cloneRepo(sandboxId, {
      url: prData.repoUrl,
      path: "repo",
      branch: prData.headSha,
      token: prData.githubToken,
    });

    // 3. Install dependencies
    await installDependencies(sandboxId, "repo", "npm");

    // 4. Install ast-grep for code analysis
    await installTool(sandboxId, "ast-grep", "npm");

    // 5. Run ast-grep to find issues
    const astGrepResult = await execCommand(sandboxId, {
      command: `sg "async function $NAME($PARAMS) { $BODY }" -p "\\$BODY: not { try { $CATCH } catch }" --lang ts --json`,
      cwd: "repo",
    });

    const issues = JSON.parse(astGrepResult.result);

    // 6. Run tests to validate
    const testResult = await runTests(
      sandboxId,
      "repo",
      "npm test -- --coverage",
      120000 // 2 min timeout
    );

    // 7. If tests fail, search for error patterns
    if (testResult.exitCode !== 0) {
      const errorPatterns = await searchFiles(sandboxId, {
        path: "repo",
        pattern: "FAILED|Error:",
      });

      // 8. Apply fixes (example: add error handling)
      for (const issue of issues) {
        await replaceInFiles(sandboxId, {
          files: [issue.file],
          search: issue.matched,
          replace: `try {\n${issue.matched}\n} catch (error) {\n  console.error(error);\n}`,
        });
      }

      // 9. Commit and push fixes
      await addFiles(sandboxId, {
        path: "repo",
        files: ["."],
      });

      await commit(sandboxId, {
        path: "repo",
        message: "fix: Add error handling to async functions",
        author: {
          name: "PR Agent",
          email: "agent@diff0.dev",
        },
      });

      await push(sandboxId, {
        path: "repo",
      });

      // 10. Re-run tests to verify
      const verifyResult = await runTests(
        sandboxId,
        "repo",
        "npm test",
        120000
      );

      return {
        success: verifyResult.exitCode === 0,
        issuesFound: issues.length,
        testsFixed: verifyResult.exitCode === 0,
      };
    }

    return {
      success: true,
      issuesFound: issues.length,
      testsFixed: false,
    };
  } finally {
    // Always cleanup
    if (sandboxId) {
      await manageLifecycle(sandboxId, "delete");
    }
  }
}
```

## Package Exports Configuration

Update `packages/sandbox/package.json`:

```json
{
  "name": "@diff0/sandbox",
  "type": "module",
  "exports": {
    ".": "./helpers/index.ts",
    "./types": "./helpers/types.ts",
    "./client": "./helpers/client.ts",
    "./sandbox": "./helpers/sandbox.ts",
    "./process": "./helpers/process.ts",
    "./git": "./helpers/git.ts",
    "./fs": "./helpers/fs.ts"
  }
}
```

## Error Handling Strategy

All functions should:

1. Validate inputs with Zod schemas
2. Catch and re-throw with context
3. Log errors with sandbox ID for tracing
4. Return structured error information

Example:

```typescript
try {
  const validated = schema.parse(options);
  // operation
} catch (error) {
  console.error(`[Sandbox ${sandboxId}] Operation failed:`, error);
  throw new Error(
    `Failed to ${operation}: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}
```

## Security Considerations

1. **Token Management**: Never log tokens, use secure env vars
2. **Resource Limits**: Enforce CPU/memory/disk limits
3. **Timeout Protection**: All operations have timeouts
4. **Ephemeral by Default**: No data persistence
5. **Input Validation**: All inputs validated with Zod

## Performance Optimization

1. **Parallel Operations**: Use Promise.all for independent tasks
2. **Resource Presets**: Pre-configured for common use cases
3. **Session Reuse**: Reuse sessions for multiple commands
4. **Lazy Cleanup**: Auto-delete on stop (ephemeral)
