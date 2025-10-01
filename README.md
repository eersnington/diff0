# diff0

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
pnpm dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Your app will connect to the Convex cloud backend automatically.







## Project Structure

```
diff0/
├── apps/
│   ├── web/         # Frontend application (Next.js)
├── packages/
│   └── backend/     # Convex backend functions and schema
```

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm dev:web`: Start only the web application
- `pnpm dev:setup`: Setup and configure your Convex project
- `pnpm check-types`: Check TypeScript types across all apps
- `pnpm check`: Run Biome formatting and linting


# diff0 Agent (GitHub Bot's Permissions)
---

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

App is configured too

* Track PR lifecycle and comments.
* Post inline feedback via check runs and comments.
* Optionally manage issues.
* React to human commands in comments.