import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (state) => {
  const router = inject(Router);

  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  return isLoggedIn ? true : router.parseUrl('/auth/login');
};
