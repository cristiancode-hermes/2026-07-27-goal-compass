import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [style.width]="width()" [style.height]="height()">
      @if (lines()) {
        @for (item of [].constructor(lines()); track $index) {
          <div
            class="skeleton-line"
            [style.width.%] = "100 - ($index * 10)"
            [style.height]="lineHeight()"
          ></div>
        }
      } @else {
        <div class="skeleton-block" [style.borderRadius]="radius()"></div>
      }
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-line, .skeleton-block {
      background: linear-gradient(90deg, var(--color-border-light) 25%, var(--color-surface-hover) 50%, var(--color-border-light) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-sm);
    }
    .skeleton-line {
      height: 14px;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class LoadingSkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('auto');
  readonly lines = input<number>(0);
  readonly lineHeight = input<string>('14px');
  readonly radius = input<string>('var(--radius-md)');
}
