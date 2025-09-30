"use client";

import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { api } from "@d0/backend/convex/_generated/api";
import { Button } from "@d0/ui/components/ui/button";
import { Switch } from "@d0/ui/components/ui/switch";
import { useQuery } from "convex/react";
import { useState } from "react";

const MS_CONVERSION = 1000;
const HUNDRED = 100;

function formatSubscriptionEndDate(timestampStr?: string | null): string {
  if (!timestampStr) {
    return "N/A";
  }
  const timestamp = Number(timestampStr);

  if (Number.isNaN(timestamp)) {
    return "Invalid date";
  }

  const date = new Date(timestamp * MS_CONVERSION);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const Plan = ({
  name,
  description,
  isCurrent,
  amount,
  interval,
  onChangeInterval,
}: {
  name: string;
  description: string | null;
  isCurrent: boolean;
  amount: number;
  interval?: "month" | "year";
  onChangeInterval?: () => void;
}) => {
  return (
    <div
      className={`flex w-full select-none items-center rounded-md border border-border ${
        isCurrent && "border-primary/60"
      }`}
    >
      <div className="flex w-full flex-col items-start p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base text-primary">{name}</span>
          {Boolean(amount) && (
            <span className="flex items-center rounded-md bg-primary/10 px-1.5 font-medium text-primary/80 text-sm">
              ${amount / HUNDRED} / {interval === "month" ? "month" : "year"}
            </span>
          )}
        </div>
        <p className="text-start font-normal text-primary/60 text-sm">
          {description}
        </p>
      </div>

      {/* Billing Switch */}
      {Boolean(amount) && (
        <div className="flex items-center gap-2 px-4">
          <label
            className="text-start text-primary/60 text-sm"
            htmlFor="interval-switch"
          >
            {interval === "month" ? "Monthly" : "Yearly"}
          </label>
          <Switch
            checked={interval === "year"}
            id="interval-switch"
            onCheckedChange={() => onChangeInterval?.()}
          />
        </div>
      )}
    </div>
  );
};

export default function BillingSettings() {
  const user = useQuery(api.users.getUser);
  const products = useQuery(api.subscriptions.listAllProducts);

  const [selectedPlanInterval, setSelectedPlanInterval] = useState<
    "month" | "year"
  >("month");

  if (!user) {
    return null;
  }

  const monthlyProProduct = products?.find(
    (product) => product.recurringInterval === "month"
  );
  const yearlyProProduct = products?.find(
    (product) => product.recurringInterval === "year"
  );

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-2 p-6 py-2">
        <h2 className="font-medium text-primary text-xl">
          This is a demo app.
        </h2>
        <p className="font-normal text-primary/60 text-sm">
          Convex SaaS is a demo app that uses Polar test environment. You can
          find a list of test card numbers in this{" "}
          <a
            className="font-medium text-primary/80 underline"
            href="https://stripe.com/docs/testing#cards"
            rel="noreferrer"
            target="_blank"
          >
            resource from Stripe
          </a>
          .
        </p>
      </div>

      {/* Plans */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="font-medium text-primary text-xl">Plan</h2>
          <p className="flex items-start gap-1 font-normal text-primary/60 text-sm">
            You are currently on the{" "}
            <span className="flex h-[18px] items-center rounded-md bg-primary/10 px-1.5 font-medium text-primary/80 text-sm">
              {user.subscription ? user.subscription.product.name : "Free"}
            </span>
            plan.
          </p>
        </div>

        {!user.subscription && (
          <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
            <Plan
              amount={0}
              description="Some of the things, free forever."
              isCurrent={!user.subscription}
              name="Free"
            />
            {selectedPlanInterval === "month" && monthlyProProduct && (
              <Plan
                amount={monthlyProProduct.prices[0]?.priceAmount ?? 0}
                description={monthlyProProduct.description}
                interval={selectedPlanInterval}
                isCurrent={false}
                name={monthlyProProduct.name}
                onChangeInterval={() => {
                  setSelectedPlanInterval((state) =>
                    state === "month" ? "year" : "month"
                  );
                }}
              />
            )}
            {selectedPlanInterval === "year" && yearlyProProduct && (
              <Plan
                amount={yearlyProProduct.prices[0]?.priceAmount ?? 0}
                description={yearlyProProduct.description}
                interval={selectedPlanInterval}
                isCurrent={false}
                name={yearlyProProduct.name}
                onChangeInterval={() => {
                  setSelectedPlanInterval((state) =>
                    state === "month" ? "year" : "month"
                  );
                }}
              />
            )}
          </div>
        )}

        {user.subscription &&
          (user.subscription?.productId === monthlyProProduct?.id ||
            user.subscription?.productId === yearlyProProduct?.id) && (
            <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
              <div className="flex w-full items-center overflow-hidden rounded-md border border-primary/60">
                <div className="flex w-full flex-col items-start p-4">
                  <div className="flex items-end gap-2">
                    <span className="font-medium text-base text-primary">
                      {user.subscription?.product.name}
                    </span>
                    <p className="flex items-start gap-1 font-normal text-primary/60 text-sm">
                      {user.subscription.cancelAtPeriodEnd === true ? (
                        <span className="flex h-[18px] items-center font-medium text-red-500 text-sm">
                          Expires
                        </span>
                      ) : (
                        <span className="flex h-[18px] items-center font-medium text-green-500 text-sm">
                          Renews
                        </span>
                      )}
                      on:{" "}
                      {formatSubscriptionEndDate(
                        user.subscription.currentPeriodEnd
                      )}
                      .
                    </p>
                  </div>
                  <p className="text-start font-normal text-primary/60 text-sm">
                    {user.subscription?.product.description}
                  </p>
                </div>
              </div>
            </div>
          )}

        {!user.subscription && (
          <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-border border-t bg-secondary px-6 py-3 dark:bg-card">
            <p className="font-normal text-primary/60 text-sm">
              You will not be charged for testing the subscription upgrade.
            </p>
            {monthlyProProduct && yearlyProProduct && (
              <Button asChild size="sm" type="submit">
                <CheckoutLink
                  polarApi={api.subscriptions}
                  productIds={[
                    selectedPlanInterval === "month"
                      ? monthlyProProduct.id
                      : yearlyProProduct.id,
                  ]}
                >
                  Upgrade to PRO
                </CheckoutLink>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Manage Subscription */}
      {user.subscription && (
        <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2 p-6">
            <h2 className="font-medium text-primary text-xl">
              Manage Subscription
            </h2>
            <p className="flex items-start gap-1 font-normal text-primary/60 text-sm">
              Update your payment method, billing address, and more.
            </p>
          </div>

          <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-border border-t bg-secondary px-6 py-3 dark:bg-card">
            <p className="font-normal text-primary/60 text-sm">
              You will be redirected to the Polar Customer Portal.
            </p>

            <CustomerPortalLink polarApi={api.subscriptions}>
              <Button size="sm" type="submit">
                Manage
              </Button>
            </CustomerPortalLink>
          </div>
        </div>
      )}
    </div>
  );
}
