import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4">
      <span className="hidden font-medium text-sm md:block">diff0.dev</span>

      <Link href="/">
        <Image
          alt="diff0 logo"
          className="md:-translate-x-1/2 md:absolute md:top-5 md:left-1/2"
          height={60}
          quality={100}
          src="/logo.svg"
          width={60}
        />
      </Link>

      <nav className="md:mt-2">
        <ul className="flex items-center gap-4">
          <li>
            <Button asChild>
              <Link href={"/todos"} prefetch>
                Sign in
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <a
                href="https://github.com/eersnington/diff0"
                rel="noopener"
                target="_blank"
              >
                Github
              </a>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
