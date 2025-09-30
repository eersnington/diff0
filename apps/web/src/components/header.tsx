import { Button } from "@d0/ui/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4">
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
            <Button asChild size="sm">
              <a href={process.env.NEXT_PUBLIC_APP_URL}>Sign in</a>
            </Button>
          </li>
          <li>
            <Button asChild size="sm">
              <a href="https://github.com/eersnington/diff0">Github</a>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
