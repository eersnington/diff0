# diff0

<img width="886" height="633" alt="389c7d29-f3d3-405a-a115-b69e774c24a0" src="https://github.com/user-attachments/assets/144be2af-1c61-4726-b296-92c3a0bc5447" />

An open-source AI code review agent for GitHub. Automatically analyzes pull requests, detects bugs, security issues, and performance problems, then posts actionable inline comments with one-click fixes.

Code reviews that catch bugs before they reach production.

### AI-Powered Code Analysis
- Multi-provider LLM support (OpenAI, AWS Bedrock, Google Gemini)
- Automatic PR analysis on open, reopen, synchronize, and ready_for_review
- Detects bugs, security vulnerabilities, performance issues, style problems
- Inline comments with GitHub's native suggestion blocks for one-click fixes
- Intelligent suggestion sanitization (code-only, no English instructions)

### Sandbox Execution Environment
- Ephemeral Daytona sandboxes for safe code analysis
- Isolated Git operations in secure containers
- Automatic workspace setup and cleanup (5-minute auto-delete)
- 3-tier diff retrieval fallback for reliability

### Review Pipeline
- Webhook-driven architecture with signature verification
- Idempotent event processing (prevents duplicate reviews)
- Real-time status tracking (pending → analyzing → reviewing → completed)
- Graceful degradation at every stage
- Summary-only fallback when inline positions fail

## How It Works

diff0 uses a webhook-driven pipeline to automatically review pull requests:

```
GitHub PR Event → Convex Webhook Handler → Event Router → PR Analysis Pipeline
                                                    ↓
                                    Sandbox Creation → Git Clone → Diff Analysis
                                                    ↓
                                    AI Code Review → Issue Detection → Comment Posting
                                                    ↓
                                    Credits Deduction → Status Update → Cleanup
```

### Review Pipeline Stages

1. **Webhook Processing** - Receives GitHub events, verifies signatures, logs idempotently
2. **Validation** - Checks PR triggers, skips drafts, verifies auto-review enabled
3. **Haiku Introduction** - Posts creative 3-line haiku (non-blocking)
4. **Sandbox Setup** - Creates ephemeral Daytona container, clones repo
5. **Diff Retrieval** - Fetches PR diff via GitHub API with 2-tier fallback
6. **AI Analysis** - Sends diff to LLM for bug/security/performance detection
7. **Position Mapping** - Maps line numbers to GitHub diff positions
8. **Review Posting** - Posts inline comments with suggestions or summary fallback
9. **Cleanup** - Deducts credits, updates status, deletes sandbox

## Development Setup

### Repository Structure

- **Frontend** (`apps/web/`) - Next.js application with dashboard, billing, and settings
- **Backend** (`packages/backend/convex/`) - Convex serverless functions handling webhooks, reviews, and database
- **AI** (`packages/ai/`) - LLM integration with OpenAI, Bedrock, and Gemini
- **Sandbox** (`packages/sandbox/`) - Daytona sandbox management for isolated execution
- **Analytics** (`packages/analytics/`) - Vercel Analytics and DataBuddy integration

### Prerequisites
- Node.js 22+
- pnpm
- Convex account
- GitHub App (for webhook integration)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/eersnington/diff0.git
cd diff0
pnpm install
```

2. Set up Convex backend:
```bash
pnpm dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

3. Set up environment variables:
```bash
# Copy example environment files
cp apps/web/.env.example apps/web/.env.local
cp packages/backend/.env.example packages/backend/.env.local
cp packages/ai/.env.example packages/ai/.env.local
```

4. Configure environment variables:

`apps/web/.env.local`
```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# DodoPayments
NEXT_PUBLIC_DODO_PAYMENTS_API_KEY=your-dodo-api-key
NEXT_PUBLIC_100_CREDITS_PRODUCT_ID=prod_xxx
NEXT_PUBLIC_200_CREDITS_PRODUCT_ID=prod_xxx
NEXT_PUBLIC_500_CREDITS_PRODUCT_ID=prod_xxx
NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID=prod_xxx
```

`packages/backend/.env.local`
```bash
# Convex
CONVEX_DEPLOYMENT=your-deployment

# GitHub App
GITHUB_APP_ID=your-app-id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# DodoPayments
DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_ENVIRONMENT=production

# Site URL
SITE_URL=http://localhost:3001
```

`packages/ai/.env.local`
```bash
# AI Provider (openai or bedrock)
AI_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=sk-proj-xxx

# AWS Bedrock (alternative)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Google Gemini (for haiku generation)
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key

# Firecrawl (optional, for documentation search)
FIRECRAWL_API_KEY=fc-xxx

# Scorecard AI (optional, for evaluation)
SCORECARD_API_KEY=your-api-key
SCORECARD_PROJECT_ID=your-project-id
```

5. Start development servers:
```bash
# Start all services
pnpm dev

# Or start specific services
pnpm dev:web      # Frontend only
pnpm dev:backend  # Convex backend only
```

### GitHub App Setup

1. Create a new GitHub App at https://github.com/settings/apps/new
2. Configure webhook URL: `https://your-domain.com/github/webhook`
3. Set webhook secret and add to environment variables
4. Configure permissions (see tables below)
5. Subscribe to webhook events (see tables below)
6. Generate and download private key
7. Install app on your repositories

### Linting and Formatting

```bash
# Check and fix code with Biome
pnpm check

# Type checking across all packages
pnpm check-types

# Ultracite (linting rules)
pnpm dlx ultracite init   # Initialize Ultracite in your project
pnpm dlx ultracite fix    # Format and fix code automatically
pnpm dlx ultracite check  # Check for issues without fixing
```

### Building and Deployment

```bash
# Build all packages and apps
pnpm build

# Deploy Convex backend
pnpm deploy:convex
```

## AI Agent System

diff0 provides a comprehensive AI agent for code review:

### Code Analysis
- `codeAnalysisAgent` - Analyzes diffs for bugs, security, performance, style issues
- `fixGenerationAgent` - Generates complete fixes for detected issues
- `explainIssueAgent` - Provides clear explanations of code problems
- `agenticReviewLoop` - Multi-step reasoning with tool use

### Creative Features
- `generatePrHaiku` - Creates welcoming 3-line haikus for PRs
- Tone: encouraging, playful, anticipatory

### Documentation Search
- `searchDocs` - Firecrawl-powered documentation search
- `searchFrameworkDocs` - Framework-specific documentation retrieval
- `scrapePage` - Extract markdown/HTML from documentation pages

### Sandbox Tools
- `createPrSandbox` - Ephemeral sandbox with auto-delete
- `cloneRepo` - Git clone with authentication
- `execCommand` - Safe command execution in containers
- `manageLifecycle` - Start, stop, archive, delete sandboxes

## Development Guidelines

### Code Organization
- TypeScript throughout with strict type checking
- Convex for serverless backend and real-time database
- Shared packages for AI, sandbox, and analytics
- Clean separation between frontend and backend

### Security
- Webhook signature verification (HMAC-SHA256)
- Scoped GitHub installation tokens (short-lived)
- User authorization checks (userId matching)
- Sandbox isolation (ephemeral, auto-delete)
- Command validation and path traversal protection

### Error Handling
- Idempotent webhook processing (delivery ID tracking)
- Graceful degradation at every pipeline stage
- 3-tier diff retrieval fallback
- Summary-only review fallback for position errors
- Guaranteed sandbox cleanup via finally blocks

---

# diff0 Agent (GitHub Bot's Permissions)

## Repository Permissions

| Permission      | Access Level            | Purpose                                                   |
| --------------- | ----------------------- | --------------------------------------------------------- |
| Pull requests   | Read & Write            | Fetch PRs, post comments, and track PR lifecycle events.  |
| Contents        | Read                    | Access repository files/diffs to analyze code.            |
| Checks          | Read & Write            | Create and update GitHub check runs and annotations.      |
| Issues          | Read & Write            | Open or manage issues for detected problems.              |
| Metadata        | Read                    | Access basic repository info (required).                  |
| Commit statuses | Read & Write            | Update commit status if using checks or CI-like feedback. |


---

## Subscribed Webhook Events

| Event                       | Triggers / Use                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pull request                | PR opened, reopened, synchronized, ready for review, edited, labeled, unlocked, etc. → main trigger for running your agent.    |
| Pull request review comment | Inline diff comments created, edited, deleted → respond to line-specific human feedback or commands.                           |
| Issue comment               | Issue or PR comment created, edited, deleted → handle `/fix` or other bot commands.                                            |
| Issues                      | Issue opened, edited, closed, reopened, labeled, assigned, etc. → optional, for creating or managing issues from bot findings. |
| Check run                   | Check run created, requested, rerequested, completed → post inline analysis results.                                           |
| Check suite                 | Check suite requested, rerequested, completed → update overall PR check status.                                                |


---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test webhook integration and review pipeline
5. Submit a pull request

We're excited to see what you build with diff0!
