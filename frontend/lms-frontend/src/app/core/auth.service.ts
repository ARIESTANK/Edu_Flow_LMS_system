import { Injectable, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL, apiMessage } from './api';
import { EnrollmentStatusService } from './enrollment-status.service';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: Exclude<Role, 'ADMIN'>;
}

interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: Role;
}

/** Accepts 'ADMIN', 'admin' or Spring's 'ROLE_ADMIN' */
export function normalizeRole(r: unknown): Role {
  const v = String(r ?? '').toUpperCase().replace(/^ROLE_/, '');
  return v === 'ADMIN' || v === 'TEACHER' ? v : 'STUDENT';
}

/** Where each role lands after login. A role only ever goes to its own area. */
export function homeFor(role: Role): string {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard';
    case 'STUDENT': return '/student/dashboard';
    default: return '/'; // TEACHER has no area yet
  }
}

const TOKEN_KEY = 'eduflow_token';
const USER_KEY = 'eduflow_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private router = inject(Router);
  private enrollment = inject(EnrollmentStatusService);

  private _user = signal<User | null>(this.loadUser());
  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user());

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadUser(): User | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const u = JSON.parse(raw) as User;
      return { ...u, role: normalizeRole(u.role) };
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  get token(): string | null {
    return this.isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  /** POST /api/users (public sign-up). The server never lets this create an ADMIN. */
  async register(req: RegisterRequest): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_URL}/users`, req));
    } catch (e: any) {
      throw new Error(apiMessage(e, 'Could not create the account. Check the form and try again.'));
    }
  }

  // ---------- Login ----------
  async login(email: string, password: string): Promise<void> {
    if (!email || !password) throw new Error('Email and password are required');

    let res: LoginResponse;
    try {
      // POST /api/auth/login returns token, userId, username, email, and role.
      res = await firstValueFrom(this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, password }));
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) throw new Error('Wrong email or password.');
      throw new Error(apiMessage(e, 'Could not sign in. Try again in a moment.'));
    }

    const user: User = {
      id: res.userId,
      name: res.username,
      email: res.email,
      role: normalizeRole(res.role),
    };

    if (this.isBrowser()) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.enrollment.reset();
    this._user.set(user);
    await this.router.navigate([homeFor(user.role)]);
  }

  /** POST /api/auth/change-password (the signed-in user's own password) */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword }));
    } catch (e: any) {
      throw new Error(apiMessage(e, 'Could not change the password. Try again.'));
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.enrollment.reset();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(...roles: Role[]): boolean {
    const u = this._user();
    return !!u && roles.includes(u.role);
  }
}
