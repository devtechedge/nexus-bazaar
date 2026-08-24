import { describe, expect, it } from 'vitest';
import { UserRole, defaultUsers } from './db';
import { canOpenAdminPanel, canOpenSellerHub, pickActiveUser } from './rbac';

describe('canOpenSellerHub', () => {
  it('allows sellers and admins', () => {
    expect(canOpenSellerHub(UserRole.Seller)).toBe(true);
    expect(canOpenSellerHub(UserRole.Admin)).toBe(true);
  });

  it('blocks buyers', () => {
    expect(canOpenSellerHub(UserRole.Buyer)).toBe(false);
  });
});

describe('canOpenAdminPanel', () => {
  it('allows only admins', () => {
    expect(canOpenAdminPanel(UserRole.Admin)).toBe(true);
    expect(canOpenAdminPanel(UserRole.Seller)).toBe(false);
    expect(canOpenAdminPanel(UserRole.Buyer)).toBe(false);
  });
});

describe('pickActiveUser', () => {
  const fallback = defaultUsers[0];

  it('returns the matching user', () => {
    const user = pickActiveUser(defaultUsers, 'usr_seller', fallback);
    expect(user.role).toBe(UserRole.Seller);
  });

  it('falls back when the id is missing', () => {
    const user = pickActiveUser(defaultUsers, null, fallback);
    expect(user.id).toBe(fallback.id);
  });

  it('skips banned users', () => {
    const banned = { ...defaultUsers[0], isBanned: true };
    const pool = [banned, defaultUsers[1]];
    const user = pickActiveUser(pool, banned.id, fallback);
    expect(user.id).toBe(defaultUsers[1].id);
  });
});
