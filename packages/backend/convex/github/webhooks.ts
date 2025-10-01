import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";
import { verifySignature } from "./signature";

export const handleGitHubWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");
  const deliveryId = request.headers.get("x-github-delivery");
  const payload = await request.text();

  const isValid = await verifySignature(payload, signature);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  if (!(event && deliveryId)) {
    return new Response("Missing required headers", { status: 400 });
  }

  const parsedPayload = JSON.parse(payload);

  await ctx.runMutation(internal.github.handlers.logWebhookEvent, {
    source: "github",
    eventType: event,
    deliveryId,
    installationId: parsedPayload.installation?.id
      ? String(parsedPayload.installation.id)
      : undefined,
    payload: parsedPayload,
  });

  await ctx.scheduler.runAfter(0, internal.github.handlers.routeEvent, {
    eventType: event,
    deliveryId,
  });

  return new Response("OK", { status: 200 });
});
