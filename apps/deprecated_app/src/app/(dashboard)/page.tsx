import { Header } from "@/app/(dashboard)/_components/header";

export const metadata = {
	title: "Home",
};

import { buttonVariants } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/utils";
import { ExternalLink, Plus } from "lucide-react";

export default function Page() {
	return (
		<>
			<Header
				description="Build your app on top of Convex SaaS, explore the documentation and start your journey."
				title="Create your App"
			/>
			<div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
				<div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
					<div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
						<div className="flex w-full flex-col rounded-lg p-6">
							<div className="flex flex-col gap-2">
								<h2 className="font-medium text-primary text-xl">
									Get Started
								</h2>
								<p className="font-normal text-primary/60 text-sm">
									Explore the Dashboard and get started with your first app.
								</p>
							</div>
						</div>
						<div className="flex w-full px-6">
							<div className="w-full border-border border-b" />
						</div>
						<div className="relative mx-auto flex w-full flex-col items-center p-6">
							<div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-lg border border-border bg-secondary px-6 py-24 dark:bg-card">
								<div className="z-10 flex max-w-[460px] flex-col items-center gap-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card hover:border-primary/40">
										<Plus className="h-8 w-8 stroke-[1.5px] text-primary/60" />
									</div>
									<div className="flex flex-col items-center gap-2">
										<p className="font-medium text-base text-primary">
											Create your App
										</p>
										<p className="text-center font-normal text-base text-primary/60">
											Build your app on top of Convex SaaS, explore the
											documentation and start your journey.
										</p>
										<span className="hidden select-none items-center rounded-full bg-green-500/5 px-3 py-1 font-medium text-green-700 text-xs tracking-tight ring-1 ring-green-600/20 ring-inset backdrop-blur-md md:flex dark:bg-green-900/40 dark:text-green-100">
											TIP: Try changing the language!
										</span>
									</div>
								</div>
								<div className="z-10 flex items-center justify-center">
									<a
										className={cn(
											`${buttonVariants({ variant: "ghost", size: "sm" })} gap-2`,
										)}
										href="https://github.com/get-convex/v1/tree/main/docs"
										rel="noreferrer"
										target="_blank"
									>
										<span className="font-medium text-primary/60 text-sm group-hover:text-primary">
											Explore Documentation
										</span>
										<ExternalLink className="h-4 w-4 stroke-[1.5px] text-primary/60 group-hover:text-primary" />
									</a>
								</div>
								<div className="base-grid absolute h-full w-full opacity-40" />
								<div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
