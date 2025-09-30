import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4">
      <span className="hidden font-departure-mono font-medium text-lg md:block">
        diff0.dev
      </span>

      <nav className="md:mt-2">
        <ul className="flex items-center gap-4">
          <li>
            <Button asChild variant={"outline"}>
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
