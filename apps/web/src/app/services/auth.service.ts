import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userSignal = signal<User | null>(null);
  readonly user = this.userSignal.asReadonly();

  private readonly TOKEN_KEY = 'goal_compass_token';
  private readonly USER_KEY = 'goal_compass_user';

  constructor() {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        this.userSignal.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.userSignal.set(res.user);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>('/api/auth/register', { name, email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.userSignal.set(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
