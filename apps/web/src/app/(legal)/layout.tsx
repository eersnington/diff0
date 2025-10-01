import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link className="font-departure-mono font-medium text-lg" href="/">
            diff0.dev
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/privacy"
            >
              Privacy
            </Link>
            <Button asChild size="sm" variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
