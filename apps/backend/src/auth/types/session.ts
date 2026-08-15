import { Role } from '@prisma/client';

// We avoid augmenting express-session directly because Passport types already
// extend Express Request with their own user type.

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  role: Role;
}
