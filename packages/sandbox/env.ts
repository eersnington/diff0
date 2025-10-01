import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DAYTONA_API_KEY: z.string().min(1, "DAYTONA_API_KEY is required"),
  },
  clientPrefix: "NEXT_PUBLIC",
  client: {},
  runtimeEnv: {
    DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,
  },
  emptyStringAsUndefined: true,
});
