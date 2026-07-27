import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (imageUrl()) {
      <img
        [src]="imageUrl()"
        [alt]="name()"
        class="avatar-img"
        [style.width.px]="size()"
        [style.height.px]="size()"
      />
    } @else {
      <div
        class="avatar-initials"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.fontSize.px]="fontSize"
        [style.background]="bgColor"
      >
        {{ initials }}
      </div>
    }
  `,
  styles: [`
    .avatar-img, .avatar-initials {
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .avatar-initials {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  `],
})
export class UserAvatarComponent {
  readonly name = input<string>('U');
  readonly imageUrl = input<string | null>(null);
  readonly size = input<number>(36);

  get initials(): string {
    return this.name()
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get fontSize(): number {
    return Math.max(10, Math.round(this.size() * 0.4));
  }

  get bgColor(): string {
    const colors = [
      '#1B4965', '#62B6CB', '#FF9F1C', '#2EC4B6',
      '#E63946', '#E9C46A', '#457B9D', '#A8DADC',
    ];
    let hash = 0;
    for (let i = 0; i < this.name().length; i++) {
      hash = this.name().charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
