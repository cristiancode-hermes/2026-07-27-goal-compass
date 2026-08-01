import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-form">
      <h2 class="auth-title">Welcome back</h2>
      <p class="auth-subtitle">Sign in to your Goal Compass account</p>

      <form (ngSubmit)="onSubmit()" class="form">
        <div class="form-field">
          <label class="form-label">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            [(ngModel)]="email"
            name="email"
            class="form-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="form-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            [(ngModel)]="password"
            name="password"
            class="form-input"
            required
          />
        </div>

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }

        <button type="submit" class="submit-btn" [disabled]="loading()">
          @if (loading()) {
            <span class="spinner"></span>
          }
          <span>Sign In</span>
        </button>
      </form>

      <p class="auth-switch">
        Don't have an account? <a routerLink="/register">Create one</a>
      </p>
    </div>
  `,
  styles: [`
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }
    .auth-subtitle {
      font-size: 0.875rem;
      color: #666;
      margin: -12px 0 0;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1a1a2e;
    }
    .form-input {
      padding: 12px 14px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 0.938rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus {
      border-color: #1b4965;
    }
    .form-error {
      padding: 10px 14px;
      background: rgba(230, 57, 70, 0.08);
      border: 1px solid rgba(230, 57, 70, 0.2);
      border-radius: 8px;
      color: #e63946;
      font-size: 0.813rem;
      font-weight: 500;
    }
    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      background: #1b4965;
      color: #fff;
      min-height: 42px;
      width: 100%;
    }
    .submit-btn:hover:not(:disabled) {
      background: #143c52;
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-switch {
      text-align: center;
      font-size: 0.875rem;
      color: #666;
      margin: 0;
    }
    .auth-switch a {
      color: #1b4965;
      text-decoration: none;
      font-weight: 600;
    }
    .auth-switch a:hover {
      text-decoration: underline;
    }
  `],
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly emailError = signal('');
  protected readonly passwordError = signal('');

  onSubmit(): void {
    this.error.set('');
    this.emailError.set('');
    this.passwordError.set('');

    if (!this.email) {
      this.emailError.set('Email is required');
      return;
    }
    if (!this.password) {
      this.passwordError.set('Password is required');
      return;
    }

    this.loading.set(true);
    this.auth.login(this.email, this.password).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid email or password. Please try again.');
      },
    });
  }
}
