/**
 * Title: auth.guard.ts
 * Author: Nolan Berryhill
 * Date: 1/21/2024
 */

// imports statements
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

// export authGuard equation to access site
export const authGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService) //inject CookieService

  if(cookie.get('session_user')) {
    console.log('You are logged in and have a valid session cookie set!')
    return true
  } else {
    console.log('You must be logged in to access this page!')

    const router = inject(Router)
    router .navigate(['/security/signin'], { queryParams: { returnURL: state.url}})
    return false //return false
  }
};
