export type CartLine = {
  price: number;
  quantity: number;
};

export type PromoRule = {
  code: string;
  discountPercent: number;
  requiresElite: boolean;
  minSubtotal?: number;
};

export type PromoResult =
  | { ok: true; promo: PromoRule }
  | { ok: false; error: string };

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function promoDiscount(subtotal: number, percent: number): number {
  if (subtotal <= 0 || percent <= 0) return 0;
  return Math.round((subtotal * percent) / 100);
}

export function eliteUnitPrice(
  price: number,
  productIsElite: boolean,
  userIsElite: boolean,
): number {
  return productIsElite && userIsElite ? Math.round(price * 0.9) : price;
}

export function shippingCost(opts: {
  subtotal: number;
  isElite: boolean;
  method: 'standard' | 'express';
}): number {
  if (opts.subtotal === 0) return 0;
  if (opts.isElite) return 0;
  if (opts.method === 'express') return 30;
  return opts.subtotal > 150 ? 0 : 15;
}

export function taxRateForState(state: string): number {
  if (state === 'CA') return 0.0825;
  if (state === 'NY') return 0.08875;
  if (state === 'TX') return 0.0625;
  return 0.05;
}

export function taxAmount(taxableSubtotal: number, rate: number): number {
  return Number((Math.max(0, taxableSubtotal) * rate).toFixed(2));
}

export function evaluatePromo<T extends PromoRule>(opts: {
  code: string;
  promos: T[];
  isElite: boolean;
  subtotal: number;
}): { ok: true; promo: T } | { ok: false; error: string } {
  const code = opts.code.trim().toUpperCase();
  if (!code) {
    return { ok: false, error: 'Enter a voucher code.' };
  }

  const promo = opts.promos.find((p) => p.code === code);
  if (!promo) {
    return { ok: false, error: 'Voucher code does not match any active record logs.' };
  }

  if (promo.requiresElite && !opts.isElite) {
    return { ok: false, error: 'This voucher requires an active Elite Tier Membership.' };
  }

  if (promo.minSubtotal && opts.subtotal < promo.minSubtotal) {
    return {
      ok: false,
      error: `Voucher requires a minimum cart subtotal of $${promo.minSubtotal}.`,
    };
  }

  return { ok: true, promo };
}
