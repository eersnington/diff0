import { generateText } from "ai";
import { models, getProvider } from "./models";

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

/**
 * Generate a short playful haiku announcing that an AI review will follow.
 *
 * The result is intentionally *brief* to avoid noise at PR open time.
 */
export async function generatePrHaiku(input: HaikuInput): Promise<HaikuResult> {
  const provider = getProvider();
  const modelHint = "chat";
  const safe = sanitize(input);

  const stats =
    safe.additions !== undefined && safe.deletions !== undefined && safe.filesChanged !== undefined
      ? ` (+${safe.additions} / -${safe.deletions}, ${safe.filesChanged} file${safe.filesChanged === 1 ? "" : "s"})`
      : "";

  const prompt = buildPrompt({
    title: safe.title,
    repo: safe.repoFullName,
    pr: safe.prNumber,
    author: safe.author,
    stats,
  });

  try {
    const result = await generateText({
      model: models.chat,
      prompt,
      ...(provider === "openai" && {
        providerOptions: {
          openai: {
            reasoningEffort: "low" as const,
          },
        },
      }),
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
    return fallbackResult(provider, modelHint);
  } catch {
    return fallbackResult(provider, modelHint);
  }
}

/**
 * Minimal input sanitation to avoid prompt bloat.
 */
function sanitize(input: HaikuInput): HaikuInput {
  const trim = (s: string) => s.trim().replace(/\s+/g, " ").slice(0, 160);
  return {
    title: trim(input.title || "Update"),
    repoFullName: trim(input.repoFullName),
    prNumber: input.prNumber,
    author: input.author ? trim(input.author) : undefined,
    additions: input.additions,
    deletions: input.deletions,
    filesChanged: input.filesChanged,
  };
}

function buildPrompt(params: {
  title: string;
  repo: string;
  pr: number;
  author?: string;
  stats: string;
}): string {
  return `You are a witty but concise AI assistant.
Write a SINGLE 3-line haiku (only 3 newline-separated lines) announcing that an AI code review will follow shortly.

Guidelines:
- Reference PR #${params.pr}.
- Reference repository "${params.repo}" briefly (shorten to just its name or keep owner/repo form).
- Optionally nod to author ${
    params.author ? `"${params.author}"` : "(if provided)"
  }.
- Tone: encouraging, playful, NOT sarcastic, no apologies.
- Avoid filler like "Here is" / "Haiku:" / markdown backticks / code blocks / quotes.
- Do NOT mention internal tooling, tokens, or the word "analysis".
- Avoid repeating the PR title verbatim unless it is short and evocative.
- End the final line with something anticipating review (e.g., "review winds soon" / "eyes of code awake").

PR Title: ${params.title}
${
  params.author
    ? `Author: ${params.author}\n`
    : ""
}Repo: ${params.repo}${params.stats ? `\nStats: ${params.stats}` : ""}

Return ONLY the 3-line haiku.`;
}

function postProcess(raw: string): string {
  // Remove extraneous wrapping quotes or markdown artifacts.
  let text = raw.trim();
  text = text.replace(/^```[\s\S]*?```$/g, (m) => m.replace(/```/g, "").trim());
  // If model returned more than 3 lines, take first 3 non-empty lines.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);
  return lines.join("\n");
}

function isValidHaiku(h: string): boolean {
  if (!h) return false;
  const lines = h.split(/\n/);
  if (lines.length !== 3) return false;
  // Reject if lines are excessively long (avoid rambly output).
  if (lines.some((l) => l.length > 80)) return false;
  // Basic safety: avoid leaking system words.
  const forbidden = /(api key|token|internal|stack trace)/i;
  if (forbidden.test(h)) return false;
  return true;
}

function fallbackResult(provider: string, modelHint: string): HaikuResult {
  const fallbackHaiku =
    "Fresh branch petals drift\nPull Request wakes the repo\nCalm bot eyes review soon";
  return {
    haiku: fallbackHaiku,
    provider,
    modelHint,
    fallback: true,
  };
}

/**
 * Convenience wrapper that catches and always returns *some* haiku.
 */
export async function safeGeneratePrHaiku(
  input: HaikuInput
): Promise<HaikuResult> {
  try {
    return await generatePrHaiku(input);
  } catch {
    return fallbackResult(getProvider(), "chat");
  }
}
