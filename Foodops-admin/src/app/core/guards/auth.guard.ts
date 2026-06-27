import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

const isTokenExpired = (token: string): boolean => {
  try {
    // JWT payload is the second segment, base64url encoded
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = this.authService.getToken();

    if (!token) {
      return this.router.parseUrl('/auth/login');
    }

    if (isTokenExpired(token)) {
      this.authService.logout();
      return this.router.parseUrl('/auth/login');
    }

    return true;
  }
}
