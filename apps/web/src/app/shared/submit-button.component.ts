import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      class="submit-btn"
      [class.loading]="loading()"
      [class.full-width]="fullWidth()"
      [class.btn-secondary]="variant() === 'secondary'"
      [class.btn-ghost]="variant() === 'ghost'"
      [class.btn-danger]="variant() === 'danger'"
      [disabled]="loading() || disabled()"
      (click)="onClick.emit()"
    >
      @if (loading()) {
        <span class="spinner"></span>
      }
      <span [class.visually-hidden]="loading()">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--color-primary);
      color: #fff;
      min-height: 42px;
    }
    .submit-btn:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .submit-btn.full-width {
      width: 100%;
    }
    .submit-btn.btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1.5px solid var(--color-border);
    }
    .submit-btn.btn-secondary:hover:not(:disabled) {
      background: var(--color-surface-hover);
    }
    .submit-btn.btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
      padding: 6px 12px;
    }
    .submit-btn.btn-ghost:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
    .submit-btn.btn-danger {
      background: var(--color-danger);
      color: #fff;
    }
    .submit-btn.btn-danger:hover:not(:disabled) {
      background: #c1121f;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .visually-hidden {
      opacity: 0;
    }
  `],
})
export class SubmitButtonComponent {
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly type = input<string>('submit');
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly onClick = output<void>();
}
