import type { FC } from "react";

export const Header: FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <header className="z-10 flex w-full flex-col border-border border-b bg-card px-6">
    <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-12">
      <div className="flex flex-col items-start gap-2">
        <h1 className="font-medium text-3xl text-primary/80">{title}</h1>
        <p className="font-normal text-base text-primary/60">{description}</p>
      </div>
    </div>
  </header>
);
