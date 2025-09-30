"use client";

import { api } from "@repo/backend/convex/_generated/api";
import { username } from "@repo/backend/convex/utils/validators";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";

export default function OnboardingUsername() {
	const user = useQuery(api.users.getUser);
	const updateUsername = useMutation(api.users.updateUsername);
	const router = useRouter();

	const { pending } = useFormStatus();

	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			username: "",
		},
		onSubmit: async ({ value }) => {
			await updateUsername({
				username: value.username,
			});
		},
	});

	console.log("user", user);

	useEffect(() => {
		if (!user) {
			return;
		}
		if (user?.username) {
			router.push("/");
		}
	}, [user]);

	if (!user) {
		return null;
	}

	return (
		<div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
			<div className="flex flex-col items-center gap-2">
				<span className="mb-2 select-none text-6xl">👋</span>
				<h3 className="text-center font-medium text-2xl text-primary">
					Welcome!
				</h3>
				<p className="text-center font-normal text-base text-primary/60">
					Let's get started by choosing a username.
				</p>
			</div>
			<form
				className="flex w-full flex-col items-start gap-1"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="flex w-full flex-col gap-1.5">
					<label className="sr-only" htmlFor="username">
						Username
					</label>
					<form.Field
						// biome-ignore lint/correctness/noChildrenProp: i disagree here
						children={(field) => (
							<Input
								autoComplete="off"
								className={`bg-transparent ${
									field.state.meta?.errors.length > 0 &&
									"border-destructive focus-visible:ring-destructive"
								}`}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Username"
								required
								value={field.state.value}
							/>
						)}
						name="username"
						validators={{
							onSubmit: username,
						}}
					/>
				</div>

				<div className="flex flex-col">
					{form.state.fieldMeta.username?.errors.length > 0 && (
						<span className="mb-2 text-destructive text-sm dark:text-destructive-foreground">
							{form.state.fieldMeta.username?.errors.join(" ")}
						</span>
					)}
				</div>

				<Button className="w-full" size="sm" type="submit">
					{pending ? <Loader2 className="animate-spin" /> : "Continue"}
				</Button>
			</form>

			<p className="px-6 text-center font-normal text-primary/60 text-sm leading-normal">
				You can update your username at any time from your account settings.
			</p>
		</div>
	);
}
