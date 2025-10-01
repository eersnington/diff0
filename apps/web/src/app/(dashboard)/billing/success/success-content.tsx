"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const REDIRECT_COUNTDOWN_SECONDS = 5;
const COUNTDOWN_INTERVAL_MS = 1000;

export function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const [countdown, setCountdown] = useState(REDIRECT_COUNTDOWN_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = "/billing";
          return 0;
        }
        return prev - 1;
      });
    }, COUNTDOWN_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        <CardDescription>
          Your credits have been added to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkoutId && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-muted-foreground text-sm">Order ID</p>
            <p className="font-mono text-sm">{checkoutId}</p>
          </div>
        )}

        <p className="text-center text-muted-foreground text-sm">
          Redirecting to billing page in {countdown} seconds...
        </p>

        <div className="flex gap-2">
          <Button asChild className="flex-1" variant="outline">
            <Link href="/billing">View Billing</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}