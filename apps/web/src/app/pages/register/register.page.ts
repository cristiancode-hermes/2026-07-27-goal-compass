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
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormFieldComponent, SubmitButtonComponent],
  template: `
    <div class="auth-form">
      <h2 class="auth-title">Create account</h2>
      <p class="auth-subtitle">Start managing your OKRs with Goal Compass</p>

      <form (ngSubmit)="onSubmit()" class="form">
        <app-form-field
          label="Full Name"
          type="text"
          placeholder="John Doe"
          [icon]="'👤'"
          [error]="nameError()"
          [(ngModel)]="name"
          name="name"
          required
        />

        <app-form-field
          label="Email"
          type="email"
          placeholder="you@company.com"
          [icon]="'✉'"
          [error]="emailError()"
          [(ngModel)]="email"
          name="email"
          required
        />

        <app-form-field
          label="Password"
          type="password"
          placeholder="Create a strong password"
          [icon]="'🔒'"
          [error]="passwordError()"
          [(ngModel)]="password"
          name="password"
          required
        />

        <app-form-field
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          [icon]="'🔒'"
          [error]="confirmError()"
          [(ngModel)]="confirmPassword"
          name="confirmPassword"
          required
        />

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }

        <app-submit-button [loading]="loading()" [fullWidth]="true">
          Create Account
        </app-submit-button>
      </form>

      <p class="auth-switch">
        Already have an account? <a routerLink="/login">Sign in</a>
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
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected name = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly nameError = signal('');
  protected readonly emailError = signal('');
  protected readonly passwordError = signal('');
  protected readonly confirmError = signal('');

  onSubmit(): void {
    this.error.set('');
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmError.set('');

    let valid = true;
    if (!this.name.trim()) { this.nameError.set('Name is required'); valid = false; }
    if (!this.email) { this.emailError.set('Email is required'); valid = false; }
    if (!this.password) { this.passwordError.set('Password is required'); valid = false; }
    else if (this.password.length < 6) { this.passwordError.set('Password must be at least 6 characters'); valid = false; }
    if (this.password !== this.confirmPassword) { this.confirmError.set('Passwords do not match'); valid = false; }
    if (!valid) return;

    this.loading.set(true);
    this.auth.register(this.name, this.email, this.password).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Account created successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
