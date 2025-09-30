import "@repo/ui/styles/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ConvexClientProvider } from "./convex-client-provider";

export const metadata: Metadata = {
	title: "diff0 app",
	description: "OSS AI PR Review Agent",
};

export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)" },
		{ media: "(prefers-color-scheme: dark)" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConvexAuthNextjsServerProvider>
			<html lang="en" suppressHydrationWarning>
				<body
					className={cn(
						`${GeistSans.variable} ${GeistMono.variable}`,
						"antialiased",
					)}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						disableTransitionOnChange
						enableSystem
					>
						<TooltipProvider delayDuration={0}>
							<ConvexClientProvider>{children}</ConvexClientProvider>
						</TooltipProvider>
					</ThemeProvider>
				</body>
			</html>
		</ConvexAuthNextjsServerProvider>
	);
}
