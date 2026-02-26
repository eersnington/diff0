import { bedrock } from "@ai-sdk/amazon-bedrock";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { env } from "../env";

export const models = {
	haiku: bedrock("us.anthropic.claude-3-5-haiku-20241022-v1:0"),
	gflash: google("gemini-2.5-flash"),
	chat:
		env.AI_PROVIDER === "openai"
			? openai.chat("gpt-5-codex")
			: bedrock("global.anthropic.claude-sonnet-4-5-20250929-v1:0"),
	embeddings: openai("text-embedding-3-small"),
};

export const getProviderOptions = () =>
	env.AI_PROVIDER === "openai"
		? {
				openai: {
					reasoningEffort: "low" as const,
				},
			}
		: {};

export const getProvider = () => env.AI_PROVIDER;
