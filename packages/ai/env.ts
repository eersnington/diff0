import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().startsWith("sk-").optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default("us-east-1"),
    AI_PROVIDER: z.enum(["openai", "bedrock"]).default("openai"),
    FIRECRAWL_API_KEY: z.string().startsWith("fc-").optional(),
    SCORECARD_API_KEY: z.string().optional(),
    SCORECARD_PROJECT_ID: z.string().optional(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AI_PROVIDER: process.env.AI_PROVIDER,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    SCORECARD_API_KEY: process.env.SCORECARD_API_KEY,
    SCORECARD_PROJECT_ID: process.env.SCORECARD_PROJECT_ID,
  },
});
