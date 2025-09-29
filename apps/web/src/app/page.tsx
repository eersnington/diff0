import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@d0/ui/tooltip";
import { AnimatedText } from "@/components/animated-text";
import { CopyText } from "@/components/copy-text";

export default function Page() {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
      <div className="-top-[118px] -z-10 pointer-events-none absolute inset-0 h-[80%] bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4.5rem_2rem] [transform:perspective(1000px)_rotateX(-63deg)]" />
      <div className="-z-10 pointer-events-none absolute inset-0 bg-gradient-to-t from-background to-transparent" />

      <h1 className="relative z-10 h-[120px] text-center font-departure text-[40px] leading-tight md:h-auto md:text-[84px]">
        <AnimatedText text="Production ready code" />
      </h1>

      <p className="relative z-10 mt-2 max-w-[80%] text-center md:mt-6 md:text-xl">
        An open-source starter kit based on{" "}
        <a className="underline" href="https://midday.ai?utm_source=v1-convex">
          Midday
        </a>
        . Now on{" "}
        <a className="underline" href="https://convex.dev/c/middayv1template">
          Convex
        </a>
        .
      </p>

      {/* In process */}
      {/* <span className="relative z-10 text-center text-[#878787] text-xs mt-2">
        Security verified by Kenshū.
      </span> */}

      <div className="mt-10 mb-8">
        <CopyText value="npm create @convex-dev/v1@latest" />
      </div>

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={process.env.NEXT_PUBLIC_APP_URL}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">Get started →</span>
              </div>
            </a>
          </TooltipTrigger>
          <TooltipContent className="text-xs" side="bottom" sideOffset={15}>
            Log in to the example dashboard
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="-bottom-[280px] -z-10 pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4.5rem_2rem] [transform:perspective(560px)_rotateX(63deg)]" />
      <div className="-z-10 pointer-events-none absolute bottom-[100px] h-1/2 w-full bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
