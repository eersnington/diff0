"use client";

import { api } from "@diff0/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CENTS_TO_CURRENCY_UNIT = 100;

export function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const paymentDetails = useQuery(
    api.payments.queries.getPaymentDetails,
    paymentId ? { paymentId } : "skip"
  );

  if (!paymentId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Invalid Request</CardTitle>
          <CardDescription>No payment ID provided in the URL</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/billing">Return to Billing</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentDetails === undefined) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Order
          </CardTitle>
          <CardDescription>
            Please wait while we confirm your payment...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!paymentDetails) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Order Not Found</CardTitle>
          <CardDescription>
            We couldn't find an order with this payment ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/billing">Return to Billing</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { order, credits } = paymentDetails;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        <CardDescription>
          {order.creditsAmount} credits have been added to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg bg-muted p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Product:</span>
            <span className="font-medium">{order.productName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">
              {order.currency.toUpperCase()}{" "}
              {(order.amount / CENTS_TO_CURRENCY_UNIT).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credits:</span>
            <span className="font-bold text-green-600">
              +{order.creditsAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">{order.status}</span>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="mb-2 text-muted-foreground text-sm">Current Balance</p>
          <p className="font-bold text-3xl">{credits.balance} credits</p>
        </div>

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
