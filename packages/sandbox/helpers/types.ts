export type { Sandbox } from "@daytonaio/sdk";

export type SandboxLanguage = "python" | "typescript" | "javascript" | "go" | "java" | "ruby" | "rust";

export type CreateSandboxOptions = {
  name?: string;
  language?: SandboxLanguage;
  ephemeral?: boolean;
  snapshot?: string;
  autoStopInterval?: number;
  autoArchiveInterval?: number;
  autoDeleteInterval?: number;
  resources?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  labels?: Record<string, string>;
  envVars?: Record<string, string>;
};

export type DaytonaCreateParams = {
  language?: SandboxLanguage;
  envVars?: Record<string, string>;
  ephemeral?: boolean;
  autoStopInterval?: number;
  autoArchiveInterval?: number;
  autoDeleteInterval?: number;
  resources?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  labels?: Record<string, string>;
};

export type ExecCommandOptions = {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
};

export type ExecCommandResult = {
  exitCode: number;
  result: string;
  stderr: string;
};

export type RunCodeOptions = {
  code: string;
  argv?: string[];
  env?: Record<string, string>;
  timeout?: number;
};

export type RunCodeResult = {
  exitCode: number;
  result: string;
  stderr: string;
  artifacts?: Record<string, unknown>;
};

export type SessionCreateResult = {
  message: string;
  sessionId: string;
};

export type SessionExecResult = {
  exitCode: number;
  result: string;
  stderr: string;
};

export type SessionGetResult = {
  id: string;
  commands: Array<{
    command: string;
    exitCode: number;
  }>;
};

export type SessionDeleteResult = {
  message: string;
  sessionId: string;
};

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

export type PackageManager = "npm" | "yarn" | "pnpm" | "pip";
export type InstallTool = "npm" | "pip";
