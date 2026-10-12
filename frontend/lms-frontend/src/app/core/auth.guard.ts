import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role, homeFor } from './auth.service';

/**
 * Usage: { path: 'admin', canActivate: [authGuard], data: { roles: ['ADMIN'] }, ... }
 * - Not signed in            -> /login
 * - Signed in, wrong role    -> that user's own home page (never the other role's area)
 */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.user();
  if (!user) return router.createUrlTree(['/login']);

  const roles = route.data?.['roles'] as Role[] | undefined;
  if (roles && !roles.includes(user.role)) return router.createUrlTree([homeFor(user.role)]);

  return true;
};
