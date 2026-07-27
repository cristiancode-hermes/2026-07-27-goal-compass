import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [style.background]="bgColor" [style.color]="color">
      <span class="status-dot" [style.background]="color"></span>
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `],
})
export class StatusBadgeComponent {
  readonly status = input<string>('not_started');

  readonly statusConfig = computed<{ label: string; bg: string; color: string }>(() => {
    const s = this.status();
    const map: Record<string, { label: string; bg: string; color: string }> = {
      on_track: { label: 'On Track', bg: 'rgba(46, 196, 182, 0.12)', color: 'var(--color-success)' },
      at_risk: { label: 'At Risk', bg: 'rgba(233, 196, 106, 0.12)', color: 'var(--color-warning)' },
      behind: { label: 'Behind', bg: 'rgba(230, 57, 70, 0.12)', color: 'var(--color-danger)' },
      completed: { label: 'Completed', bg: 'rgba(46, 196, 182, 0.12)', color: 'var(--color-success)' },
      not_started: { label: 'Not Started', bg: 'rgba(108, 117, 125, 0.1)', color: 'var(--color-text-secondary)' },
      draft: { label: 'Draft', bg: 'rgba(108, 117, 125, 0.1)', color: 'var(--color-text-secondary)' },
      active: { label: 'Active', bg: 'rgba(27, 73, 101, 0.1)', color: 'var(--color-primary)' },
      archived: { label: 'Archived', bg: 'rgba(108, 117, 125, 0.08)', color: 'var(--color-text-muted)' },
      in_progress: { label: 'In Progress', bg: 'rgba(98, 182, 203, 0.12)', color: 'var(--color-secondary)' },
      blocked: { label: 'Blocked', bg: 'rgba(230, 57, 70, 0.12)', color: 'var(--color-danger)' },
      low: { label: 'Low', bg: 'rgba(46, 196, 182, 0.1)', color: 'var(--color-success)' },
      medium: { label: 'Medium', bg: 'rgba(233, 196, 106, 0.1)', color: 'var(--color-warning)' },
      high: { label: 'High', bg: 'rgba(230, 57, 70, 0.1)', color: 'var(--color-danger)' },
      critical: { label: 'Critical', bg: 'rgba(230, 57, 70, 0.15)', color: 'var(--color-danger)' },
    };
    return map[s] || { label: s.replace(/_/g, ' '), bg: 'rgba(108, 117, 125, 0.1)', color: 'var(--color-text-secondary)' };
  });

  get label(): string { return this.statusConfig().label; }
  get bgColor(): string { return this.statusConfig().bg; }
  get color(): string { return this.statusConfig().color; }
}
