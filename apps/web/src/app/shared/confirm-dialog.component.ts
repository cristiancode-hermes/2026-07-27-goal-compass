import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="dialog-overlay" (click)="onCancel.emit()">
        <div class="dialog" (click)="$event.stopPropagation()">
          @if (title()) {
            <h3 class="dialog-title">{{ title() }}</h3>
          }
          @if (message()) {
            <p class="dialog-message">{{ message() }}</p>
          }
          <div class="dialog-actions">
            <button class="btn-cancel" (click)="onCancel.emit()">Cancel</button>
            <button
              class="btn-confirm"
              [class.btn-danger]="danger()"
              (click)="onConfirm.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease;
    }
    .dialog {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 28px;
      max-width: 400px;
      width: 90%;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.2s ease;
    }
    .dialog-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 12px;
    }
    .dialog-message {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0 0 24px;
      line-height: 1.5;
    }
    .dialog-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn-cancel, .btn-confirm {
      padding: 8px 18px;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-family: inherit;
    }
    .btn-cancel {
      background: var(--color-surface);
      color: var(--color-text-secondary);
      border: 1.5px solid var(--color-border);
    }
    .btn-cancel:hover {
      background: var(--color-surface-hover);
    }
    .btn-confirm {
      background: var(--color-primary);
      color: #fff;
    }
    .btn-confirm:hover {
      background: var(--color-primary-hover);
    }
    .btn-confirm.btn-danger {
      background: var(--color-danger);
    }
    .btn-confirm.btn-danger:hover {
      background: #c1121f;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class ConfirmDialogComponent {
  readonly visible = input<boolean>(false);
  readonly title = input<string>('Confirm');
  readonly message = input<string>('Are you sure?');
  readonly confirmLabel = input<string>('Confirm');
  readonly danger = input<boolean>(false);
  readonly onConfirm = output<void>();
  readonly onCancel = output<void>();
}
