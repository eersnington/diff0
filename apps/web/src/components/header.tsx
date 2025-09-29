"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@d0/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { SubscribeForm } from "./subscribe-form";

export function Header() {
  return (
    <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4">
      <span className="hidden font-medium text-sm md:block">convex-v1.run</span>

      <Link href="/">
        <Image
          alt="diff0 logo"
          className="md:-translate-x-1/2 md:absolute md:top-5 md:left-1/2"
          height={60}
          quality={100}
          src="/logo.png"
          width={60}
        />
      </Link>

      <nav className="md:mt-2">
        <ul className="flex items-center gap-4">
          <li>
            <a
              className="rounded-full bg-primary px-4 py-2 font-medium text-secondary text-sm"
              href={process.env.NEXT_PUBLIC_APP_URL}
            >
              Sign in
            </a>
          </li>
          <li>
            <a
              className="rounded-full bg-primary px-4 py-2 font-medium text-secondary text-sm"
              href="https://github.com/eersnington/diff0"
            >
              Github
            </a>
          </li>
          <li>
            <Dialog>
              <DialogTrigger
                asChild
                className="cursor-pointer rounded-full bg-secondary px-4 py-2 font-medium text-primary text-sm"
              >
                <span>Get updates</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stay updated</DialogTitle>
                  <DialogDescription>
                    Subscribe to our newsletter to get the latest news and
                    updates.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                  <SubscribeForm
                    group="v1-newsletter"
                    placeholder="Email address"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </li>
        </ul>
      </nav>
    </header>
  );
}
