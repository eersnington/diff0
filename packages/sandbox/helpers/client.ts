import { Daytona } from "@daytonaio/sdk";
import { env } from "@/env";

let daytonaInstance: Daytona | null = null;

export function getDaytonaClient(): Daytona {
  if (!daytonaInstance) {
    if (!env.DAYTONA_API_KEY) {
      throw new Error("DAYTONA_API_KEY is required");
    }
    daytonaInstance = new Daytona({ apiKey: env.DAYTONA_API_KEY });
  }
  return daytonaInstance;
}