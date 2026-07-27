import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'goal_compass_theme';
  readonly isDark = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    this.isDark.set(dark);
    this.applyTheme(dark);

    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private applyTheme(dark: boolean): void {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
