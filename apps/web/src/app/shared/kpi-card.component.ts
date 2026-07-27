import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card">
      @if (icon()) {
        <div class="kpi-icon" [style.background]="iconBg()">
          <span>{{ icon() }}</span>
        </div>
      }
      <div class="kpi-content">
        <span class="kpi-value">{{ formattedValue }}</span>
        <span class="kpi-label">{{ label() }}</span>
      </div>
      @if (trend()) {
        <div class="kpi-trend" [class.trend-up]="trend() === 'up'" [class.trend-down]="trend() === 'down'">
          <span class="trend-arrow">{{ trend() === 'up' ? '↑' : trend() === 'down' ? '↓' : '→' }}</span>
          @if (trendValue()) {
            <span class="trend-value">{{ trendValue() }}%</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .kpi-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .kpi-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kpi-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1.2;
    }
    .kpi-label {
      font-size: 0.813rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.813rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }
    .trend-up {
      color: var(--color-success);
      background: rgba(46, 196, 182, 0.1);
    }
    .trend-down {
      color: var(--color-danger);
      background: rgba(230, 57, 70, 0.1);
    }
    .trend-arrow {
      font-size: 1rem;
    }
    .trend-value {
      font-family: 'JetBrains Mono', monospace;
    }
  `],
})
export class KpiCardComponent {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly trend = input<'up' | 'down' | 'neutral' | null>(null);
  readonly trendValue = input<number | null>(null);
  readonly icon = input<string | null>(null);
  readonly format = input<'number' | 'percent'>('number');

  get formattedValue(): string {
    const v = this.value();
    if (this.format() === 'percent') return `${Math.round(v)}%`;
    return v.toLocaleString();
  }

  readonly iconBg = computed(() => {
    const t = this.trend();
    if (t === 'up') return 'rgba(46, 196, 182, 0.1)';
    if (t === 'down') return 'rgba(230, 57, 70, 0.1)';
    return 'rgba(98, 182, 203, 0.1)';
  });
}
