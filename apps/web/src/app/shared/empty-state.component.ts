import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon() }}</div>
      <h3 class="empty-title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty-message">{{ message() }}</p>
      }
      @if (actionLabel()) {
        <button class="empty-action" (click)="onAction.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 8px;
    }
    .empty-message {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0 0 24px;
      max-width: 360px;
      line-height: 1.5;
    }
    .empty-action {
      padding: 10px 20px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }
    .empty-action:hover {
      background: var(--color-primary-hover);
    }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('📋');
  readonly title = input<string>('No items found');
  readonly message = input<string>('');
  readonly actionLabel = input<string>('');
  readonly onAction = output<void>();
}
