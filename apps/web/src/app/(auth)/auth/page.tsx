"use client";

import { authClient } from "@diff0/backend/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8">
        <div className="block dark:hidden">
          <Link href={"/"} passHref>
            <Image
              alt="diff0 logo"
              className="rounded-xl"
              height={64}
              src="/logo-dark.svg"
              width={64}
            />
          </Link>
        </div>
        <div className="hidden dark:block">
          <Link href={"/"} passHref>
            <Image
              alt="diff0 logo"
              className="rounded-xl"
              height={64}
              src="/logo.svg"
              width={64}
            />
          </Link>
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Welcome to diff0</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Sign in to start reviewing your PRs with AI assistance 😎
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              className={cn("w-full gap-2")}
              disabled={loading}
              onClick={async () => {
                await authClient.signIn.social(
                  {
                    provider: "github",
                    callbackURL: "/dashboard",
                  },
                  {
                    onRequest: () => setLoading(true),
                    onResponse: () => setLoading(false),
                  }
                );
              }}
              variant="outline"
            >
              <svg
                height="1em"
                viewBox="0 0 24 24"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>github logo</title>
                <path
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                  fill="currentColor"
                />
              </svg>
              Sign in with Github
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-muted-foreground text-sm">
        By continuing, you agree to our{" "}
        <Link className="text-primary hover:underline" href="/terms">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="text-primary hover:underline" href="/privacy">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
