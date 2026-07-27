import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found">
      <div class="nf-content">
        <span class="nf-icon">🧭</span>
        <h1 class="nf-title">404</h1>
        <h2 class="nf-subtitle">Page Not Found</h2>
        <p class="nf-message">The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/dashboard" class="nf-link">Go to Dashboard →</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 24px;
    }
    .nf-content {
      text-align: center;
      max-width: 400px;
    }
    .nf-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 16px;
    }
    .nf-title {
      font-size: 4rem;
      font-weight: 800;
      color: var(--color-primary);
      margin: 0;
      line-height: 1;
    }
    .nf-subtitle {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 8px 0;
    }
    .nf-message {
      font-size: 0.938rem;
      color: var(--color-text-secondary);
      margin: 12px 0 24px;
      line-height: 1.5;
    }
    .nf-link {
      display: inline-block;
      padding: 12px 24px;
      background: var(--color-primary);
      color: #fff;
      border-radius: var(--radius-md);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      transition: background 0.2s;
    }
    .nf-link:hover {
      background: var(--color-primary-hover);
    }
  `],
})
export class NotFoundPageComponent {}
