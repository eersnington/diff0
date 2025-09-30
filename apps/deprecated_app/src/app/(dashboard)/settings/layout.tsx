"use client";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LayoutContainer = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const isSettingsPath = pathname === "/settings";
	const isBillingPath = pathname === "/settings/billing";
	return (
		<div className="flex h-full w-full px-6 py-8">
			<div className="mx-auto flex h-full w-full max-w-screen-xl gap-12">
				<div className="hidden w-full max-w-64 flex-col gap-0.5 lg:flex">
					<Link
						className={cn(
							`${buttonVariants({ variant: "ghost" })} ${isSettingsPath && "bg-primary/5"}`,
							"justify-start rounded-md",
						)}
						href="/settings"
					>
						<span
							className={cn(
								`text-primary/80 text-sm ${isSettingsPath && "font-medium text-primary"}`,
							)}
						>
							General
						</span>
					</Link>
					<Link
						className={cn(
							`${buttonVariants({ variant: "ghost" })} ${isBillingPath && "bg-primary/5"} justify-start rounded-md`,
						)}
						href="/settings/billing"
					>
						<span
							className={cn(
								`text-primary/80 text-sm ${isBillingPath && "font-medium text-primary"}`,
							)}
						>
							Billing
						</span>
					</Link>
				</div>
				{children}
			</div>
		</div>
	);
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <LayoutContainer>{children}</LayoutContainer>;
}
