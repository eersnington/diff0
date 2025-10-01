import type { StopCondition, ToolSet } from "ai";
import { generateObject, generateText, stepCountIs } from "ai";
import { z } from "zod";
import { getProvider, models } from "./models";

const IssueSchema = z.object({
  type: z.enum(["bug", "security", "performance", "style", "suggestion"]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  file: z.string(),
  line: z.number().optional(),
  message: z.string(),
  suggestion: z.string(),
});

const AnalysisResultSchema = z.object({
  issues: z.array(IssueSchema),
  confidence: z.number().min(0).max(1),
  requiresDocumentation: z.boolean(),
  requiresSandboxTesting: z.boolean(),
});

export type Issue = z.infer<typeof IssueSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export async function codeAnalysisAgent(input: {
  code: string;
  context: string;
  docs: string;
}): Promise<AnalysisResult> {
  const result = await generateObject({
    model: models.chat,
    schema: AnalysisResultSchema,
    ...(getProvider() === "openai" && {
      providerOptions: {
        openai: {
          reasoningEffort: "low" as const,
        },
      },
    }),
    prompt: `You are an expert code reviewer. Analyze the following code changes for issues.

Code Changes:
\`\`\`
${input.code}
\`\`\`

Context:
${input.context}

${input.docs ? `Documentation:\n${input.docs}\n` : ""}

Identify any bugs, security vulnerabilities, performance issues, style problems, or suggestions for improvement.
For each issue, provide:
- Type (bug, security, performance, style, suggestion)
- Severity (critical, high, medium, low)
- File and line number if applicable
- Clear message explaining the issue
- Specific suggestion for how to fix it

Also indicate:
- confidence: Your confidence level (0-1) in the analysis
- requiresDocumentation: Whether external documentation search would help
- requiresSandboxTesting: Whether the code should be tested in a sandbox
`,
  });

  return result.object;
}

const FixSchema = z.object({
  explanation: z.string(),
  changes: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      reasoning: z.string(),
    })
  ),
  testStrategy: z.string(),
  confidence: z.number().min(0).max(1),
});

export type Fix = z.infer<typeof FixSchema>;

export async function fixGenerationAgent(input: {
  issue: Issue;
  context: string;
  documentation: string;
  codebase: string;
}): Promise<Fix> {
  const result = await generateObject({
    model: models.chat,
    schema: FixSchema,
    ...(getProvider() === "openai" && {
      providerOptions: {
        openai: {
          reasoningEffort: "low" as const,
        },
      },
    }),
    prompt: `You are an expert code fixer. Generate a fix for the following issue.

Issue:
- Type: ${input.issue.type}
- Severity: ${input.issue.severity}
- File: ${input.issue.file}
- Line: ${input.issue.line || "N/A"}
- Message: ${input.issue.message}
- Suggestion: ${input.issue.suggestion}

Context:
${input.context}

Documentation:
${input.documentation}

Codebase Context:
${input.codebase}

Generate a complete fix that:
1. Addresses the issue completely
2. Follows best practices
3. Includes all necessary changes
4. Can be tested automatically

Provide:
- explanation: Clear explanation of what the fix does
- changes: Array of file changes with full content
- reasoning: Why this fix solves the problem
- testStrategy: How to test this fix
- confidence: Your confidence level (0-1) in the fix
`,
  });

  return result.object;
}

const tools = {
  analyzeCode: {
    description: "Analyze code for potential issues",
    inputSchema: z.object({
      code: z.string(),
      focusAreas: z.array(z.string()),
    }),
    execute: async ({ code, focusAreas }) =>
      `Analyzed ${code.length} characters focusing on: ${focusAreas.join(", ")}`,
  },
  searchDocumentation: {
    description: "Search for relevant documentation",
    inputSchema: z.object({
      query: z.string(),
      framework: z.string().optional(),
    }),
    execute: async ({ query, framework }) =>
      `Searching docs for: ${query}${framework ? ` in ${framework}` : ""}`,
  },
  testFix: {
    description: "Test a proposed fix in sandbox",
    inputSchema: z.object({
      fix: z.string(),
      testCommand: z.string(),
    }),
    execute: async ({ testCommand }) =>
      `Testing fix with command: ${testCommand}`,
  },
} satisfies ToolSet;

const hasAnswer: StopCondition<typeof tools> = ({ steps }) =>
  steps.some((step) => step.text?.includes("ANSWER:")) ?? false;

export async function agenticReviewLoop(input: {
  code: string;
  context: string;
  maxSteps?: number;
}): Promise<{ text: string; steps: number }> {
  const result = await generateText({
    model: models.chat,
    tools,
    stopWhen: input.maxSteps ? stepCountIs(input.maxSteps) : hasAnswer,
    ...(getProvider() === "openai" && {
      providerOptions: {
        openai: {
          reasoningEffort: "low" as const,
        },
      },
    }),
    prompt: `Analyze this code and provide recommendations. When you have a complete answer, respond with "ANSWER: [your recommendations]"

Code:
\`\`\`
${input.code}
\`\`\`

Context:
${input.context}
`,
  });

  return {
    text: result.text,
    steps: result.steps?.length || 0,
  };
}

export async function explainIssueAgent(input: {
  issue: Issue;
  context: string;
}): Promise<string> {
  const result = await generateText({
    model: models.chat,
    ...(getProvider() === "openai" && {
      providerOptions: {
        openai: {
          reasoningEffort: "low" as const,
        },
      },
    }),
    prompt: `Explain the following code issue in clear, simple terms that a developer can understand and act on.

Issue:
- Type: ${input.issue.type}
- Severity: ${input.issue.severity}
- File: ${input.issue.file}
- Line: ${input.issue.line || "N/A"}
- Message: ${input.issue.message}
- Suggestion: ${input.issue.suggestion}

Context:
${input.context}

Provide:
1. What the issue is
2. Why it's a problem
3. How to fix it
4. Example code if helpful
`,
  });

  return result.text;
}
