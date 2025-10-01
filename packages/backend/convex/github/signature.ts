import { env } from "../../env";

const MAX_LEN = 16;

export async function verifySignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  if (!env.GITHUB_WEBHOOK_SECRET) {
    throw new Error("GITHUB_WEBHOOK_SECRET not configured");
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(env.GITHUB_WEBHOOK_SECRET);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(MAX_LEN).padStart(2, "0"))
    .join("");
  const expectedSignature = `sha256=${hashHex}`;

  return signature === expectedSignature;
}
