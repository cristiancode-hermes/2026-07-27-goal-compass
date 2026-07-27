import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormFieldComponent } from '../../shared/form-field.component';
import { SubmitButtonComponent } from '../../shared/submit-button.component';
import { ToastService } from '../../shared/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormFieldComponent, SubmitButtonComponent],
  template: `
    <div class="auth-form">
      <h2 class="auth-title">Welcome back</h2>
      <p class="auth-subtitle">Sign in to your Goal Compass account</p>

      <form (ngSubmit)="onSubmit()" class="form">
        <app-form-field
          label="Email"
          type="email"
          placeholder="you@company.com"
          [icon]="'✉'"
          [error]="emailError()"
          [(ngModel)]="email"
          name="email"
          #emailField="ngModel"
          required
        />

        <app-form-field
          label="Password"
          type="password"
          placeholder="Enter your password"
          [icon]="'🔒'"
          [error]="passwordError()"
          [(ngModel)]="password"
          name="password"
          #passwordField="ngModel"
          required
        />

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }

        <app-submit-button [loading]="loading()" [fullWidth]="true">
          Sign In
        </app-submit-button>
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
      color: var(--color-text);
      margin: 0;
    }
    .auth-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: -12px 0 0;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-error {
      padding: 10px 14px;
      background: rgba(230, 57, 70, 0.08);
      border: 1px solid rgba(230, 57, 70, 0.2);
      border-radius: var(--radius-md);
      color: var(--color-danger);
      font-size: 0.813rem;
      font-weight: 500;
    }
    .auth-switch {
      text-align: center;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0;
    }
    .auth-switch a {
      color: var(--color-primary);
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
