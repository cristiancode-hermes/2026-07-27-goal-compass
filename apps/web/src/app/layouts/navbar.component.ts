import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { DarkModeToggleComponent } from '../shared/dark-mode-toggle.component';
import { UserAvatarComponent } from '../shared/user-avatar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, DarkModeToggleComponent, UserAvatarComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  readonly navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/objectives', label: 'Objectives', icon: '🎯' },
    { path: '/teams', label: 'Teams', icon: '👥' },
    { path: '/cycles', label: 'Cycles', icon: '🔄' },
  ];

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  logout(): void {
    this.auth.logout();
  }
}
