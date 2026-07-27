import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="auth-brand">
          <span class="auth-brand-icon">🧭</span>
          <span class="auth-brand-text">Goal Compass</span>
        </div>
        <div class="auth-card">
          <router-outlet />
        </div>
        <p class="auth-footer">OKR & Goal Management Platform</p>
      </div>
    </div>
  `,
  styleUrl: './auth-layout.css',
})
export class AuthLayoutComponent {}
