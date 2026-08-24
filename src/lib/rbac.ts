import { User, UserRole } from './db';

export function canOpenSellerHub(role: UserRole): boolean {
  return role === UserRole.Seller || role === UserRole.Admin;
}

export function canOpenAdminPanel(role: UserRole): boolean {
  return role === UserRole.Admin;
}

export function pickActiveUser(
  usersList: User[],
  activeId: string | null,
  fallback: User,
): User {
  if (!activeId) {
    return usersList.find((u) => !u.isBanned) || fallback;
  }

  const user = usersList.find((u) => u.id === activeId);
  if (!user || user.isBanned) {
    return usersList.find((u) => !u.isBanned) || fallback;
  }

  return user;
}
