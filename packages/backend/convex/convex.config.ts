import betterAuth from "@convex-dev/better-auth/convex.config";
import dodopayments from "@dodopayments/convex/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(betterAuth);
app.use(dodopayments);

export default app;
