import { z } from "zod";
import type {
  FsUploadOptions,
  FsDownloadResult,
  FsListOptions,
  FsListResult,
  FsSearchOptions,
  FsSearchResult,
  FsReplaceOptions,
  FsReplaceResult,
} from "./types";
import { findSandbox } from "./sandbox";

const uploadSchema = z.object({
  content: z.union([z.instanceof(Buffer), z.string()]),
  destination: z.string().min(1),
});

const listSchema = z.object({
  path: z.string().min(1),
  recursive: z.boolean().default(false),
});

const searchSchema = z.object({
  path: z.string().min(1),
  pattern: z.string().min(1),
  filePattern: z.string().optional(),
});

const replaceSchema = z.object({
  files: z.array(z.string()),
  search: z.string().min(1),
  replace: z.string(),
});

export async function uploadFile(
  sandboxId: string,
  options: FsUploadOptions
): Promise<{ message: string; path: string; size: number }> {
  const validated = uploadSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    const content =
      typeof validated.content === "string"
        ? Buffer.from(validated.content)
        : validated.content;

    await sandbox.fs.uploadFile(content, validated.destination);

    return {
      message: `Uploaded file to ${validated.destination}`,
      path: validated.destination,
      size: content.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function downloadFile(
  sandboxId: string,
  path: string
): Promise<FsDownloadResult> {
  const sandbox = await findSandbox(sandboxId);

  try {
    const content = await sandbox.fs.downloadFile(path);

    return {
      content,
      size: content.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to download file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function listFiles(
  sandboxId: string,
  options: FsListOptions
): Promise<FsListResult> {
  const validated = listSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    const cmd = validated.recursive
      ? `find ${validated.path} -type f -o -type d`
      : `ls -la ${validated.path}`;

    const result = await sandbox.process.executeCommand(cmd);

    if (result.exitCode !== 0) {
      throw new Error("List failed");
    }

    const files = result.result
      .split("\n")
      .filter(Boolean)
      .map((line) => ({
        name: line.split("/").pop() || "",
        path: line,
        size: 0,
        isDirectory: line.includes("/"),
      }));

    return { files };
  } catch (error) {
    throw new Error(
      `Failed to list files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function deleteFile(
  sandboxId: string,
  path: string
): Promise<{ message: string; deleted: boolean }> {
  const sandbox = await findSandbox(sandboxId);

  try {
    await sandbox.fs.deleteFile(path);

    return {
      message: `Deleted ${path}`,
      deleted: true,
    };
  } catch (error) {
    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function searchFiles(
  sandboxId: string,
  options: FsSearchOptions
): Promise<FsSearchResult> {
  const validated = searchSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    const files = await sandbox.fs.findFiles(
      validated.path,
      validated.pattern
    );

    const matches = files.map((file) => ({
      file: file.file,
      line: file.line,
      content: validated.pattern,
    }));

    return { matches };
  } catch (error) {
    throw new Error(
      `Failed to search files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function replaceInFiles(
  sandboxId: string,
  options: FsReplaceOptions
): Promise<FsReplaceResult> {
  const validated = replaceSchema.parse(options);
  const sandbox = await findSandbox(sandboxId);

  try {
    await sandbox.fs.replaceInFiles(
      validated.files,
      validated.search,
      validated.replace
    );

    return {
      filesModified: validated.files.length,
      replacements: validated.files.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to replace in files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}