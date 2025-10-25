import { env } from "../../env";

export const PRODUCT_CREDIT_MAPPING: Record<string, number> = {
	[env.NEXT_PUBLIC_100_CREDITS_PRODUCT_ID ?? ""]: 100,
	[env.NEXT_PUBLIC_200_CREDITS_PRODUCT_ID ?? ""]: 200,
	[env.NEXT_PUBLIC_500_CREDITS_PRODUCT_ID ?? ""]: 500,
	[env.NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID ?? ""]: 1000,
};

export const PRODUCT_NAME_MAPPING: Record<string, string> = {
	[env.NEXT_PUBLIC_100_CREDITS_PRODUCT_ID ?? ""]: "100 Credits",
	[env.NEXT_PUBLIC_200_CREDITS_PRODUCT_ID ?? ""]: "200 Credits",
	[env.NEXT_PUBLIC_500_CREDITS_PRODUCT_ID ?? ""]: "500 Credits",
	[env.NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID ?? ""]: "1000 Credits",
};

export function getCreditsForProduct(productId: string): number {
	const credits = PRODUCT_CREDIT_MAPPING[productId];
	if (!credits) {
		console.error("[UNKNOWN PRODUCT CREDIT MAPPING] Product ID: ", productId);
		return 0;
	}
	return credits;
}

export function getNameForProduct(productId: string): string {
	const credits = PRODUCT_NAME_MAPPING[productId];
	if (!credits) {
		console.error("[UNKNOWN PRODUCT NAME MAPPING] Product ID: ", productId);
		return "Unknown Product";
	}
	return credits;
}
