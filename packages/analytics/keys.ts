import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_DATABUDDY_CLIENT_ID: z.string().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_DATABUDDY_CLIENT_ID:
        process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID,
    },
  });
