import { api } from "@diff0/backend/convex/_generated/api";
import { getToken } from "@diff0/backend/lib/auth-server";
import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");

  if (!installationId) {
    return NextResponse.redirect(
      new URL("/settings?error=missing_installation_id", request.url)
    );
  }

  try {
    const token = await getToken();

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth?callbackUrl=/settings", request.url)
      );
    }

    await fetchMutation(
      api.github.installation.handleInstallationCallback,
      {
        installationId,
        setupAction: setupAction || "install",
      },
      { token }
    );

    return NextResponse.redirect(
      new URL("/settings?success=github_connected", request.url)
    );
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error("GitHub callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings?error=${error instanceof Error ? error.message : "unknown"}`,
        request.url
      )
    );
  }
}
