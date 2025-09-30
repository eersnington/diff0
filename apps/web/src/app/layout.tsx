import type { Metadata } from "next";
import { Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import "../index.css";
import localFont from "next/font/local";
import Providers from "@/components/providers";

const departureMono = localFont({
  src: "../fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixel-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "diff0 - OSS AI Code Review Agent",
  description:
    "Open-source AI code reviewer that helps you catch bugs before you merge",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${departureMono.variable} ${pixelifySans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
