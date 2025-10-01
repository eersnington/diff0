# GitHub Webhook Integration

This directory contains the webhook and event handler infrastructure for receiving GitHub events.

## What's Implemented

### 1. Webhook Signature Verification (`signature.ts`)
- Verifies GitHub webhook signatures using HMAC-SHA256
- Ensures requests are actually from GitHub
- Uses `GITHUB_WEBHOOK_SECRET` environment variable

### 2. Webhook HTTP Endpoint (`webhooks.ts`)
- Receives POST requests from GitHub at `/github/webhook`
- Validates webhook signature
- Logs all events to the database
- Queues event processing asynchronously
- Returns 200 OK immediately to GitHub

### 3. Event Handlers (`handlers.ts`)
- `logWebhookEvent`: Stores webhook events in the database
- `getWebhookEvent`: Retrieves webhook events by delivery ID
- `markEventProcessed`: Marks events as processed with optional error message
- `routeEvent`: Routes events to appropriate handlers based on event type

### 4. HTTP Route Registration (`../http.ts`)
- Registers the webhook endpoint at `/github/webhook`

## Event Flow

```
GitHub → POST /github/webhook → Verify Signature → Log to DB → Queue Processing → Route Event
```

1. GitHub sends webhook POST request
2. Signature is verified
3. Event is logged to `webhookEvents` table
4. Event processing is queued asynchronously
5. Event is routed to appropriate handler (currently stubs)
6. Event is marked as processed

## Supported Events

The router currently handles these event types:
- `pull_request` - PR opened, synchronized, etc.
- `issue_comment` - Comments on PRs/issues
- `pull_request_review_comment` - Inline review comments
- `installation` - App installed/uninstalled
- `installation_repositories` - Repos added/removed
- `check_run` - Check run created/completed
- `check_suite` - Check suite requested/completed

## Environment Variables Required

```bash
GITHUB_APP_ID="123456"
GITHUB_APP_CLIENT_ID="Iv1.xxxxx"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET="your_webhook_secret_here"
```

## Database Schema

Events are stored in the `webhookEvents` table with:
- `source`: "github" or "polar"
- `eventType`: The GitHub event type (e.g., "pull_request")
- `deliveryId`: Unique delivery ID from GitHub
- `installationId`: GitHub App installation ID
- `payload`: Full webhook payload
- `processed`: Boolean flag
- `processedAt`: Timestamp when processed
- `error`: Error message if processing failed
- `createdAt`: Timestamp when received

## Testing

### 1. Install Dependencies
```bash
cd packages/backend
pnpm install
```

### 2. Set Environment Variables
Add the required GitHub App credentials to `.env.local`

### 3. Deploy to Convex
```bash
pnpm dev
```

### 4. Configure GitHub Webhook
In your GitHub App settings, set webhook URL to:
```
https://your-convex-deployment.convex.site/github/webhook
```

### 5. Test Webhook Delivery
- Install the app on a test repository
- Create a PR
- Check the `webhookEvents` table in Convex dashboard

## Next Steps

To add actual event processing:

1. Implement handlers in the `routeEvent` switch statement
2. Create separate handler files for each event type
3. Call those handlers from `routeEvent`

Example:
```typescript
case "pull_request":
  await ctx.runAction(internal.github.prReview.handlePullRequest, {
    payload: event.payload,
  });
  break;
```

## TypeScript Errors

The TypeScript errors about `internal.github` not existing are expected until Convex generates the types after first deployment. They will resolve automatically once you run `pnpm dev` and Convex generates the API types.