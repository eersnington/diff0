import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../index.css";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import Providers from "@/components/providers";

const departureMono = localFont({
  src: "../fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diff0.dev"),
  title:
    "diff0 - OSS AI Code Review Agent | Catch bugs before they reach prod!",
  description:
    "Open-source AI code reviewer agent that helps you catch bugs before you merge to prod",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${departureMono.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
