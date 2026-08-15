// =============================================
// Roles Decorator
// Use @Roles('ADMIN') above any route to
// restrict it to admin users only
// =============================================

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
