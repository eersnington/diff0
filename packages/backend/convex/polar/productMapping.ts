import { env } from "../../env";

export const PRODUCT_CREDIT_MAPPING: Record<string, number> = {
  [env.NEXT_PUBLIC_100_CREDITS_PRODUCT_ID ?? ""]: 100,
  [env.NEXT_PUBLIC_200_CREDITS_PRODUCT_ID ?? ""]: 200,
  [env.NEXT_PUBLIC_500_CREDITS_PRODUCT_ID ?? ""]: 500,
  [env.NEXT_PUBLIC_1000_CREDITS_PRODUCT_ID ?? ""]: 1000,
};

export function getCreditsForProduct(productId: string): number {
  const credits = PRODUCT_CREDIT_MAPPING[productId];
  if (!credits) {
    throw new Error(`Unknown product ID: ${productId}`);
  }
  return credits;
}