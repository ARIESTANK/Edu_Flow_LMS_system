import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token; // null on the server
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError(err => {
      // Expired or invalid token -> back to the login page. (A wrong password on /auth/login also returns 401, so skip it.)
      if (err?.status === 401 && !req.url.includes('/auth/login') && auth.isLoggedIn()) auth.logout();
      return throwError(() => err);
    }),
  );
};
