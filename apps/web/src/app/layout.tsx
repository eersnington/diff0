import "./styles.css";
import { Provider as AnalyticsProvider } from "@d0/analytics/client";
import { cn } from "@d0/ui/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ConvexClientProvider } from "./convex-client-provider";

const DepartureMono = localFont({
  src: "../fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diff0.dev"),
  title: "diff0",
  description: "OSS AI PR Review Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${DepartureMono.variable} ${GeistSans.variable} ${GeistMono.variable}`,
          "dark antialiased"
        )}
      >
        <ConvexClientProvider>
          <Header />
          {children}
          <Footer />
        </ConvexClientProvider>

        <AnalyticsProvider />
      </body>
    </html>
  );
}
