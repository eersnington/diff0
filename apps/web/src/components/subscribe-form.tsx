"use client";

import { api } from "@d0/backend/convex/_generated/api";
import { Icons } from "@d0/ui/components/icons";
import { Button } from "@d0/ui/components/ui/button";
import { Input } from "@d0/ui/components/ui/input";
import { useAction } from "convex/react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

const TIMEOUT_MS = 5000;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="ml-auto rounded-full" type="submit">
      {pending ? <Icons.Loader className="size-4" /> : "Subscribe"}
    </Button>
  );
}

type Props = {
  group: string;
  placeholder: string;
  className?: string;
};

export function SubscribeForm({ group, placeholder, className }: Props) {
  const subscribe = useAction(api.web.subscribe);
  const [isSubmitted, setSubmitted] = useState(false);

  return (
    <div>
      <div>
        {isSubmitted ? (
          <div className="flex h-9 w-[290px] items-center justify-between border border-[#2C2C2C] px-2 py-0.5 text-primary text-sm">
            <p>Subscribed</p>

            <svg
              fill="none"
              height="17"
              width="17"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Check</title>
              <path
                d="m14.546 4.724-8 8-3.667-3.667.94-.94 2.727 2.72 7.06-7.053.94.94Z"
                fill="currentColor"
              />
            </svg>
          </div>
        ) : (
          <form
            action={async (formData) => {
              setSubmitted(true);
              await subscribe({
                email: formData.get("email") as string,
                userGroup: group,
              });

              setTimeout(() => {
                setSubmitted(false);
              }, TIMEOUT_MS);
            }}
            className="flex flex-col gap-4"
          >
            <Input
              aria-label="Email address"
              autoComplete="email"
              className={className}
              id="email"
              name="email"
              placeholder={placeholder}
              required
              type="email"
            />

            <SubmitButton />
          </form>
        )}
      </div>
    </div>
  );
}
