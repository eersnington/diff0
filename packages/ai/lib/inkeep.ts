import { agent, agentGraph } from "@inkeep/agents-sdk";

export const codeReviewerAgent = agent({
  id: "code-reviewer",
  name: "Code Reviewer",
  description: "Expert code reviewer that analyzes code for issues",
  prompt: `You are an expert code reviewer with deep knowledge of software engineering best practices.
Your job is to analyze code changes and identify:
- Bugs and logic errors
- Security vulnerabilities
- Performance issues
- Code style problems
- Potential improvements

When you find issues, explain them clearly and suggest specific fixes.`,
});

export const fixGeneratorAgent = agent({
  id: "fix-generator",
  name: "Fix Generator",
  description: "Generates code fixes for identified issues",
  prompt: `You are an expert at writing code fixes.
Given an issue description, you generate:
- Complete, working code fixes
- Clear explanations of what changed
- Test strategies to validate the fix

Your fixes follow best practices and are production-ready.`,
});

export const documentationSearchAgent = agent({
  id: "doc-searcher",
  name: "Documentation Searcher",
  description: "Searches and analyzes documentation",
  prompt: `You are an expert at finding relevant documentation.
Given a code issue or question, you:
- Identify the best documentation sources
- Extract relevant information
- Summarize key points clearly

You help developers understand how to use libraries and frameworks correctly.`,
});

export const testingAgent = agent({
  id: "testing-agent",
  name: "Testing Agent",
  description: "Validates code fixes through testing",
  prompt: `You are an expert at testing code.
You:
- Design test strategies for code changes
- Validate that fixes work correctly
- Identify edge cases and potential failures
- Ensure changes don't break existing functionality`,
});

export const reviewAgentGraph = agentGraph({
  id: "review-graph",
  name: "PR Review Agent System",
  description: "Multi-agent system for comprehensive PR review",
  defaultAgent: codeReviewerAgent,
  agents: () => [
    codeReviewerAgent,
    fixGeneratorAgent,
    documentationSearchAgent,
    testingAgent,
  ],
});

export function buildRepoContext(input: {
  files: Array<{ path: string; content: string }>;
  readme?: string;
  packageJson?: string;
}): string {
  const MAX_FILE_CONTENT_LENGTH = 1000;
  const MAX_FILES_IN_CONTEXT = 10;

  let context = "";

  if (input.readme) {
    context += `# README\n${input.readme}\n\n`;
  }

  if (input.packageJson) {
    context += `# Package Info\n${input.packageJson}\n\n`;
  }

  context += "# Files\n";
  for (const file of input.files.slice(0, MAX_FILES_IN_CONTEXT)) {
    context += `## ${file.path}\n${file.content.slice(0, MAX_FILE_CONTENT_LENGTH)}\n\n`;
  }

  return context;
}
