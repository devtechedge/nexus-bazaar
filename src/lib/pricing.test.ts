import { describe, expect, it } from 'vitest';
import {
  cartSubtotal,
  eliteUnitPrice,
  evaluatePromo,
  promoDiscount,
  shippingCost,
  taxAmount,
  taxRateForState,
} from './pricing';

const PROMOS = [
  { code: 'NEXUS10', discountPercent: 10, requiresElite: false },
  { code: 'ELITEPRO', discountPercent: 20, requiresElite: true },
  { code: 'BIGSAVER', discountPercent: 15, requiresElite: false, minSubtotal: 200 },
];

describe('cartSubtotal', () => {
  it('sums price × quantity', () => {
    expect(
      cartSubtotal([
        { price: 299, quantity: 1 },
        { price: 50, quantity: 2 },
      ]),
    ).toBe(399);
  });

  it('returns 0 for an empty cart', () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe('promoDiscount', () => {
  it('rounds 10% of 299 to 30', () => {
    expect(promoDiscount(299, 10)).toBe(30);
  });

  it('returns 0 for empty or zero-percent carts', () => {
    expect(promoDiscount(0, 10)).toBe(0);
    expect(promoDiscount(100, 0)).toBe(0);
  });
});

describe('eliteUnitPrice', () => {
  it('applies 10% off elite SKUs for elite members', () => {
    expect(eliteUnitPrice(299, true, true)).toBe(269);
  });

  it('leaves the list price otherwise', () => {
    expect(eliteUnitPrice(299, true, false)).toBe(299);
    expect(eliteUnitPrice(299, false, true)).toBe(299);
  });
});

describe('shippingCost', () => {
  it('is free for elite members', () => {
    expect(shippingCost({ subtotal: 40, isElite: true, method: 'express' })).toBe(0);
  });

  it('charges $30 for non-elite express', () => {
    expect(shippingCost({ subtotal: 40, isElite: false, method: 'express' })).toBe(30);
  });

  it('is free standard shipping over $150', () => {
    expect(shippingCost({ subtotal: 151, isElite: false, method: 'standard' })).toBe(0);
  });

  it('charges $15 standard at or below $150', () => {
    expect(shippingCost({ subtotal: 150, isElite: false, method: 'standard' })).toBe(15);
  });

  it('is 0 when the cart is empty', () => {
    expect(shippingCost({ subtotal: 0, isElite: false, method: 'standard' })).toBe(0);
  });
});

describe('tax', () => {
  it('uses CA / NY / TX / fallback rates', () => {
    expect(taxRateForState('CA')).toBe(0.0825);
    expect(taxRateForState('NY')).toBe(0.08875);
    expect(taxRateForState('TX')).toBe(0.0625);
    expect(taxRateForState('WA')).toBe(0.05);
  });

  it('rounds taxable × rate to cents', () => {
    expect(taxAmount(100, 0.0825)).toBe(8.25);
    expect(taxAmount(-10, 0.0825)).toBe(0);
  });
});

describe('evaluatePromo', () => {
  it('applies a public code', () => {
    const result = evaluatePromo({
      code: 'nexus10',
      promos: PROMOS,
      isElite: false,
      subtotal: 80,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.promo.code).toBe('NEXUS10');
  });

  it('rejects unknown codes', () => {
    const result = evaluatePromo({
      code: 'NOPE',
      promos: PROMOS,
      isElite: false,
      subtotal: 80,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/does not match/i);
  });

  it('blocks elite-only codes for non-elite buyers', () => {
    const result = evaluatePromo({
      code: 'ELITEPRO',
      promos: PROMOS,
      isElite: false,
      subtotal: 80,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Elite/i);
  });

  it('enforces a minimum subtotal', () => {
    const result = evaluatePromo({
      code: 'BIGSAVER',
      promos: PROMOS,
      isElite: false,
      subtotal: 199,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/minimum cart subtotal/i);
  });
});
