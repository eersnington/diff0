/** biome-ignore-all lint/performance/noImgElement: i will go bankrupt with <Image> cost */
/** biome-ignore-all lint/nursery/useImageSize: wrong*/
"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Id } from "@repo/backend/convex/_generated/dataModel";
import { username } from "@repo/backend/convex/utils/validators";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { UploadInput } from "@repo/ui/components/ui/upload-input";
import { useDoubleCheck } from "@repo/ui/utils";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import type { UploadFileResponse } from "@xixixao/uploadstuff/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Upload } from "lucide-react";

export default function DashboardSettings() {
	const user = useQuery(api.users.getUser);
	const { signOut } = useAuthActions();
	const updateUserImage = useMutation(api.users.updateUserImage);
	const updateUsername = useMutation(api.users.updateUsername);
	const removeUserImage = useMutation(api.users.removeUserImage);
	const generateUploadUrl = useMutation(api.users.generateUploadUrl);
	const deleteCurrentUserAccount = useAction(
		api.users.deleteCurrentUserAccount,
	);
	const { doubleCheck, getButtonProps } = useDoubleCheck();

	const handleUpdateUserImage = (uploaded: UploadFileResponse[]) =>
		updateUserImage({
			imageId: (uploaded[0]?.response as { storageId: Id<"_storage"> })
				.storageId,
		});

	const handleDeleteAccount = async () => {
		await deleteCurrentUserAccount();
		signOut();
	};

	const usernameForm = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			username: user?.username,
		},
		onSubmit: async ({ value }) => {
			await updateUsername({ username: value.username || "" });
		},
	});

	if (!user) {
		return null;
	}

	return (
		<div className="flex h-full w-full flex-col gap-6">
			{/* Avatar */}
			<div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
				<div className="flex w-full items-start justify-between rounded-lg p-6">
					<div className="flex flex-col gap-2">
						<h2 className="font-medium text-primary text-xl">Your Avatar</h2>
						<p className="font-normal text-primary/60 text-sm">
							This is your avatar. It will be displayed on your profile.
						</p>
					</div>
					<label
						className="group relative flex cursor-pointer overflow-hidden rounded-full transition active:scale-95"
						htmlFor="avatar_field"
					>
						{user.avatarUrl ? (
							<img
								alt={user.username ?? user.email}
								className="h-20 w-20 rounded-full object-cover"
								src={user.avatarUrl}
							/>
						) : (
							<div className="h-20 w-20 rounded-full bg-gradient-to-br from-10% from-lime-400 via-cyan-300 to-blue-500" />
						)}
						<div className="absolute z-10 hidden h-full w-full items-center justify-center bg-primary/40 group-hover:flex">
							<Upload className="h-6 w-6 text-secondary" />
						</div>
					</label>
					<UploadInput
						accept="image/*"
						className="peer sr-only"
						generateUploadUrl={generateUploadUrl}
						id="avatar_field"
						onUploadComplete={handleUpdateUserImage}
						required
						tabIndex={user ? -1 : 0}
						type="file"
					/>
				</div>
				<div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-border border-t bg-secondary px-6 dark:bg-card">
					<p className="font-normal text-primary/60 text-sm">
						Click on the avatar to upload a custom one from your files.
					</p>
					{user.avatarUrl && (
						<Button
							onClick={() => {
								removeUserImage({});
							}}
							size="sm"
							type="button"
							variant="secondary"
						>
							Reset
						</Button>
					)}
				</div>
			</div>

			{/* Username */}
			<form
				className="flex w-full flex-col items-start rounded-lg border border-border bg-card"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					usernameForm.handleSubmit();
				}}
			>
				<div className="flex w-full flex-col gap-4 rounded-lg p-6">
					<div className="flex flex-col gap-2">
						<h2 className="font-medium text-primary text-xl">Your Username</h2>
						<p className="font-normal text-primary/60 text-sm">
							This is your username. It will be displayed on your profile.
						</p>
					</div>
					<usernameForm.Field
						// biome-ignore lint/correctness/noChildrenProp: i disagree with this
						children={(field) => (
							<Input
								autoComplete="off"
								className={`w-80 bg-transparent ${
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
					{usernameForm.state.fieldMeta.username?.errors.length > 0 && (
						<p className="text-destructive text-sm dark:text-destructive-foreground">
							{usernameForm.state.fieldMeta.username?.errors.join(" ")}
						</p>
					)}
				</div>
				<div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-border border-t bg-secondary px-6 dark:bg-card">
					<p className="font-normal text-primary/60 text-sm">
						Please use 32 characters at maximum.
					</p>
					<Button size="sm" type="submit">
						Save
					</Button>
				</div>
			</form>

			{/* Delete Account */}
			<div className="flex w-full flex-col items-start rounded-lg border border-destructive bg-card">
				<div className="flex flex-col gap-2 p-6">
					<h2 className="font-medium text-primary text-xl">Delete Account</h2>
					<p className="font-normal text-primary/60 text-sm">
						Permanently delete your Convex SaaS account, all of your projects,
						links and their respective stats.
					</p>
				</div>
				<div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-border border-t bg-red-500/10 px-6 dark:bg-red-500/10">
					<p className="font-normal text-primary/60 text-sm">
						This action cannot be undone, proceed with caution.
					</p>
					<Button
						size="sm"
						variant="destructive"
						{...getButtonProps({
							onClick: doubleCheck ? handleDeleteAccount : undefined,
						})}
					>
						{doubleCheck ? "Are you sure?" : "Delete Account"}
					</Button>
				</div>
			</div>
		</div>
	);
}
