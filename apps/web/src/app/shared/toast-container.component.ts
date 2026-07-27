import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-warning]="toast.type === 'warning'"
          [class.toast-info]="toast.type === 'info'"
        >
          <span class="toast-icon">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ' }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.25s ease;
      font-size: 0.875rem;
    }
    .toast-success { border-left: 4px solid var(--color-success); }
    .toast-error { border-left: 4px solid var(--color-danger); }
    .toast-warning { border-left: 4px solid var(--color-warning); }
    .toast-info { border-left: 4px solid var(--color-secondary); }
    .toast-icon { font-size: 1rem; font-weight: 700; flex-shrink: 0; }
    .toast-success .toast-icon { color: var(--color-success); }
    .toast-error .toast-icon { color: var(--color-danger); }
    .toast-warning .toast-icon { color: var(--color-warning); }
    .toast-info .toast-icon { color: var(--color-secondary); }
    .toast-message { flex: 1; color: var(--color-text); line-height: 1.4; }
    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--color-text-muted);
      padding: 0 2px;
      line-height: 1;
    }
    .toast-close:hover { color: var(--color-text); }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastContainerComponent {
  private readonly toastService = new ToastService();

  protected toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
