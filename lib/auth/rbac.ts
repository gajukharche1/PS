import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "./session";

const ROLE_RANK: Record<UserRole, number> = {
  visitor: 1,
  owner: 2,
  moderator: 3,
  admin: 4,
};

export function hasRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[targetRole];
}

export function canManageListing(
  user: AuthenticatedUser,
  listingOwnerId: string | null
): boolean {
  // Admins & moderators can manage any listing
  if (hasRole(user.role, UserRole.moderator)) {
    return true;
  }

  // Owners can only manage listings they own
  if (user.role === UserRole.owner && listingOwnerId === user.id) {
    return true;
  }

  return false;
}

export function assertAuthorized(
  user: AuthenticatedUser | null,
  requiredRole: UserRole = UserRole.visitor
): asserts user is AuthenticatedUser {
  if (!user) {
    throw new Error("Unauthorized: Authentication required.");
  }

  if (!hasRole(user.role, requiredRole)) {
    throw new Error(`Forbidden: Insufficient privileges. Required: ${requiredRole}`);
  }
}
