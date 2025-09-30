"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const options = [
  {
    key: "show",
    icon: Eye,
    label: "Show email",
  },
  {
    key: "hide",
    icon: EyeOff,
    label: "Hide email",
  },
];

type EmailVisibilitySwitcherProps = {
  value?: boolean;
  onChange?(hidden: boolean): void;
  defaultValue?: boolean;
  className?: string;
};

export const EmailVisibilitySwitcher = ({
  value,
  onChange,
  defaultValue = false,
  className,
}: EmailVisibilitySwitcherProps) => {
  const [hidden, setHidden] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });
  const [mounted, setMounted] = useState(false);

  const handleClick = useCallback(
    (isHidden: boolean) => {
      setHidden(isHidden);
    },
    [setHidden]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-8 space-x-2 rounded-full bg-background p-1 ring-1 ring-border",
        className
      )}
    >
      {options.map(({ key, icon: Icon, label }) => {
        const isActive = (key === "hide") === hidden;

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleClick(key === "hide")}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeEmailVisibility"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative z-10 m-auto h-4 w-4",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
