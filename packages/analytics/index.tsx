import type { ReactNode } from "react";
import { DatabuddyProvider } from "./databuddy/provider";
import { VercelProvider } from "./vercel/provider";

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <>
    <VercelProvider />
    <DatabuddyProvider />
    {children}
  </>
);
