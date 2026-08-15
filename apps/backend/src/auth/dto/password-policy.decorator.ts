// =============================================
// Password Policy Decorator
// Single source of truth for the password policy
// enforced at registration. Reused verbatim by the
// reset-password and change-password flows so the
// rule can never drift between endpoints.
// =============================================

import { applyDecorators } from '@nestjs/common';
import { Matches, MinLength } from 'class-validator';

export function IsPasswordPolicy() {
  return applyDecorators(
    MinLength(8, { message: 'Password must be at least 8 characters' }),
    Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
      message: 'Password must contain at least one uppercase letter and one number',
    }),
  );
}
