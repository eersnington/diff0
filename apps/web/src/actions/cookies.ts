"use server";

import { cookies } from "next/headers";

const SEVEN_DAYS_IN_SECONDS = 604_800;

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function setCookie(
  name: string,
  value: string,
  options?: { maxAge?: number }
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: options?.maxAge ?? SEVEN_DAYS_IN_SECONDS,
    path: "/",
    sameSite: "lax",
  });
}
