import { api } from "@diff0/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Github } from "lucide-react";
import Link from "next/link";
import { AnimatedText } from "@/components/animated-text";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default async function Page() {
  const currentUser = await preloadQuery(api.auth.getCurrentUser);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <Header preloaded={currentUser} />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-73px)] w-full flex-col items-center justify-center px-6 py-24 lg:px-8">
        {/* Flickering Grid Background */}
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full"
          color="rgb(107, 114, 128)"
          flickerChance={0.08}
          gridGap={6}
          maxOpacity={0.3}
          squareSize={4}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <a
            href="https://www.convex.dev/hackathons/modernstack"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              <span className="text-muted-foreground">
                Convex Modernstack Hackathon Entry
              </span>
            </div>
          </a>

          <h1 className="relative z-10 h-[120px] text-center font-departure-mono text-[40px] leading-tight md:h-auto md:text-[84px]">
            <AnimatedText text="AI Code Reviewer" />
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-balance text-lg text-muted-foreground leading-relaxed sm:text-xl">
            Your last line of defense before you merge. Catch bugs, improve code
            quality, and ship with confidence using AI-powered code reviews.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant={"default"}>
              <Link href={"/auth"} prefetch>
                Get Started →
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="https://github.com/eersnington/diff0"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Github className="mr-2 size-4" />
                Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
