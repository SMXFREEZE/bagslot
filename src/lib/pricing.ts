// Marketplace pricing math

export const PLATFORM_FEE_PCT = 0.12; // 12%
export const MINIMUM_PRICE = 5;

export function suggestedPrice(itemWeightKg: number, pricePerKg: number, minimumPrice = MINIMUM_PRICE) {
  return Math.max(minimumPrice, Math.round(itemWeightKg * pricePerKg * 100) / 100);
}

export function platformFee(amount: number) {
  return Math.round(amount * PLATFORM_FEE_PCT * 100) / 100;
}

export function travelerPayout(amount: number) {
  return Math.round((amount - platformFee(amount)) * 100) / 100;
}

export function quote(itemWeightKg: number, pricePerKg: number, minimumPrice = MINIMUM_PRICE) {
  const total = suggestedPrice(itemWeightKg, pricePerKg, minimumPrice);
  const fee = platformFee(total);
  const payout = travelerPayout(total);
  return { total, fee, payout };
}
