import { database } from "@repo/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
	database: prismaAdapter(database, {
		provider: "postgresql",
	}),
	plugins: [nextCookies(), organization()],
});
