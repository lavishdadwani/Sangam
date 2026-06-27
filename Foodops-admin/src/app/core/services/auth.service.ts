import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AdminUser, ApiResponse, LoginResponse } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'foodops-admin-token';

  public readonly currentAdmin = signal<AdminUser | null>(null);
  public readonly isAuthenticated = signal(this.hasToken());

  constructor(private api: ApiService, private router: Router) {}

  loginAdmin(email: string, password: string): Observable<void> {
    return this.api
      .post<ApiResponse<LoginResponse>>('v1/admin/auth/login', { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.data.token);
          this.currentAdmin.set(res.data.admin);
          this.isAuthenticated.set(true);
        }),
        map(() => void 0)
      );
  }

  fetchCurrentAdmin(): Observable<void> {
    return this.api.get<ApiResponse<AdminUser>>('v1/admin/auth/me').pipe(
      tap((res) => {
        this.currentAdmin.set(res.data);
        this.isAuthenticated.set(true);
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentAdmin.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
