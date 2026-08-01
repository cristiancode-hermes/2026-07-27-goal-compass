import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'goal_compass_theme';
  readonly isDark = signal<boolean>(false);

  constructor() {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(this.THEME_KEY) : null;
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    this.isDark.set(dark);
  }

  toggle(): void {
    this.isDark.update(v => !v);
    this.applyTheme(this.isDark());
  }

  private applyTheme(dark: boolean): void {
    const theme = dark ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }
}
