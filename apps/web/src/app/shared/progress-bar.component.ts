import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-wrapper">
      <div class="progress-bar-track" [style.height]="height()">
        <div
          class="progress-bar-fill"
          [style.width.%]="clampedValue"
          [style.background]="barColor()"
          [style.height]="height()"
        ></div>
      </div>
      @if (showLabel()) {
        <span class="progress-label" [style.color]="textColor()">{{ clampedValue }}%</span>
      }
    </div>
  `,
  styles: [`
    .progress-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress-bar-track {
      flex: 1;
      background: var(--color-border-light);
      border-radius: var(--radius-full);
      overflow: hidden;
      min-width: 60px;
    }
    .progress-bar-fill {
      border-radius: var(--radius-full);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
    }
    .progress-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      min-width: 40px;
      text-align: right;
    }
  `],
})
export class ProgressBarComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly showLabel = input<boolean>(true);
  readonly height = input<string>('8px');
  readonly color = input<string | null>(null);

  get clampedValue(): number {
    return Math.min(100, Math.max(0, Math.round((this.value() / this.max()) * 100)));
  }

  readonly barColor = computed(() => {
    if (this.color()) return this.color()!;
    const v = this.clampedValue;
    if (v >= 80) return 'var(--color-success)';
    if (v >= 50) return 'var(--color-secondary)';
    if (v >= 25) return 'var(--color-warning)';
    return 'var(--color-danger)';
  });

  readonly textColor = computed(() => {
    if (this.color()) return this.color()!;
    const v = this.clampedValue;
    if (v >= 80) return 'var(--color-success)';
    if (v >= 50) return 'var(--color-secondary)';
    if (v >= 25) return 'var(--color-warning)';
    return 'var(--color-danger)';
  });
}
