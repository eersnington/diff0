export function Footer() {
  return (
    <footer className="relative z-10 border-border/40 border-t px-6 py-8 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center text-muted-foreground text-sm">
          © 2025 diff0. Open source under MIT License.
        </p>
        <div className="flex items-center gap-6">
          <a
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="https://github.com/eersnington/diff0"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/docs"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
