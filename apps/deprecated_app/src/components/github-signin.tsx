"use client";

import { authClient } from "@repo/backend/lib/auth-client";
import { Button } from "@repo/design-system/components/ui/button";

export function GitHubSignIn() {
	const signIn = async () => {
		await authClient.signIn.social({
			provider: "github",
			newUserCallbackURL: "/onboarding",
			callbackURL: "/",
		});
	};

	return (
		<Button className="font-mono" onClick={() => signIn()} variant="outline">
			Sign in with GitHub
		</Button>
	);
}
