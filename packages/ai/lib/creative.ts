import { generateText } from "ai";
import { getProvider, models } from "./models";

const LIMITS = {
  MAX_INPUT_LENGTH: 160,
  MAX_HAIKU_LINE_LENGTH: 80,
  HAIKU_LINES: 3,
} as const;

const REGEX_PATTERNS = {
  whitespace: /\s+/g,
  newlines: /\r?\n/,
  newline: /\n/,
  codeBlock: /^```[\s\S]*?```$/g,
  forbidden: /(api key|token|internal|stack trace)/i,
} as const;

const FALLBACK_HAIKU =
  "Fresh branch petals drift\nPull Request wakes the repo\nCalm bot eyes review soon";

export type HaikuInput = {
  title: string;
  repoFullName: string;
  prNumber: number;
  author?: string;
  additions?: number;
  deletions?: number;
  filesChanged?: number;
};

export type HaikuResult = {
  haiku: string;
  provider: string;
  modelHint: string;
  fallback: boolean;
};

function sanitizeString(
  input: string,
  maxLength = LIMITS.MAX_INPUT_LENGTH
): string {
  return input
    .trim()
    .replace(REGEX_PATTERNS.whitespace, " ")
    .slice(0, maxLength);
}

function sanitize(input: HaikuInput): HaikuInput {
  return {
    title: sanitizeString(input.title || "Update"),
    repoFullName: sanitizeString(input.repoFullName),
    prNumber: input.prNumber,
    author: input.author ? sanitizeString(input.author) : undefined,
    additions: input.additions,
    deletions: input.deletions,
    filesChanged: input.filesChanged,
  };
}

function formatStats(
  additions?: number,
  deletions?: number,
  filesChanged?: number
): string {
  if (
    additions === undefined ||
    deletions === undefined ||
    filesChanged === undefined
  ) {
    return "";
  }
  const fileLabel = filesChanged === 1 ? "file" : "files";
  return ` (+${additions} / -${deletions}, ${filesChanged} ${fileLabel})`;
}

function buildPrompt(params: {
  title: string;
  repo: string;
  pr: number;
  author?: string;
  stats: string;
}): string {
  const authorLine = params.author ? `Author: ${params.author}\n` : "";
  const statsLine = params.stats ? `\nStats: ${params.stats}` : "";
  const authorRef = params.author ? `"${params.author}"` : "(if provided)";

  return `You are a witty but concise AI assistant.
Write a SINGLE 3-line haiku (only 3 newline-separated lines) announcing that an AI code review will follow shortly.

Guidelines:
- Reference PR #${params.pr}.
- Reference repository "${params.repo}" briefly (shorten to just its name or keep owner/repo form).
- Optionally nod to author ${authorRef}.
- Tone: encouraging, playful, NOT sarcastic, no apologies.
- Avoid filler like "Here is" / "Haiku:" / markdown backticks / code blocks / quotes.
- Do NOT mention internal tooling, tokens, or the word "analysis".
- Avoid repeating the PR title verbatim unless it is short and evocative.
- End the final line with something anticipating review (e.g., "review winds soon" / "eyes of code awake").

PR Title: ${params.title}
${authorLine}Repo: ${params.repo}${statsLine}

Return ONLY the 3-line haiku.`;
}

function postProcess(raw: string): string {
  let text = raw.trim();
  text = text.replace(REGEX_PATTERNS.codeBlock, (m) =>
    m.replace(/```/g, "").trim()
  );
  const lines = text
    .split(REGEX_PATTERNS.newlines)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, LIMITS.HAIKU_LINES);
  return lines.join("\n");
}

function isValidHaiku(haiku: string): boolean {
  if (!haiku) return false;

  const lines = haiku.split(REGEX_PATTERNS.newline);
  if (lines.length !== LIMITS.HAIKU_LINES) return false;

  if (lines.some((line) => line.length > LIMITS.MAX_HAIKU_LINE_LENGTH)) {
    return false;
  }

  if (REGEX_PATTERNS.forbidden.test(haiku)) return false;

  return true;
}

function createFallbackResult(
  provider: string,
  modelHint: string
): HaikuResult {
  return {
    haiku: FALLBACK_HAIKU,
    provider,
    modelHint,
    fallback: true,
  };
}

export async function generatePrHaiku(input: HaikuInput): Promise<HaikuResult> {
  const provider = getProvider();
  const modelHint = "chat";
  const safe = sanitize(input);

  const stats = formatStats(safe.additions, safe.deletions, safe.filesChanged);

  const prompt = buildPrompt({
    title: safe.title,
    repo: safe.repoFullName,
    pr: safe.prNumber,
    author: safe.author,
    stats,
  });

  try {
    const result = await generateText({
      model: models.gflash,
      prompt,
      maxOutputTokens: 256,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    });

    const haiku = postProcess(result.text);
    if (isValidHaiku(haiku)) {
      return {
        haiku,
        provider,
        modelHint,
        fallback: false,
      };
    }
    return createFallbackResult(provider, modelHint);
  } catch {
    return createFallbackResult(provider, modelHint);
  }
}

export async function safeGeneratePrHaiku(
  input: HaikuInput
): Promise<HaikuResult> {
  try {
    return await generatePrHaiku(input);
  } catch {
    return createFallbackResult(getProvider(), "chat");
  }
}
