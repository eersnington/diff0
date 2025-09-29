"use client";

import { Icons } from "@d0/ui/icons";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

const TIMEOUT_MS = 2000;

export function CopyText({ value }: { value: string }) {
  const [_, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copy(value);
    setCopied(true);

    setTimeout(() => setCopied(false), TIMEOUT_MS);
  };

  return (
    <button
      className="flex items-center gap-2 rounded-full border border-border bg-background p-4 font-mono text-[#878787] text-xs transition-colors md:text-sm"
      onClick={handleCopy}
      type="button"
    >
      <span>{value}</span>
      {copied ? (
        <Icons.Check className="size-3.5" />
      ) : (
        <Icons.Copy className="size-3.5" />
      )}
    </button>
  );
}
