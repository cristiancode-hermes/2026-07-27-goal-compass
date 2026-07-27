# Goal Compass Frontend

## Architecture

The frontend is built with **Angular 22** using:
- **Standalone components** — no NgModules, each component declares its own imports
- **Zoneless change detection** — `provideZonelessChangeDetection()` in app config
- **Signal-based state** — signals for all component state, computed for derived values
- **Lazy-loaded routes** — each page component is lazy-loaded via `loadComponent`
- **Functional interceptors** — auth token injection via `HttpInterceptorFn`

## Route Structure

| Route | Component | Guard |
|-------|-----------|-------|
| /login | LoginPageComponent | noAuthGuard |
| /register | RegisterPageComponent | noAuthGuard |
| /dashboard | DashboardPageComponent | authGuard |
| /objectives | ObjectiveListPageComponent | authGuard |
| /objectives/:id | ObjectiveDetailPageComponent | authGuard |
| /teams | TeamListPageComponent | authGuard |
| /teams/:id | TeamDetailPageComponent | authGuard |
| /cycles | CycleListPageComponent | authGuard |

## Component State Pattern

Every data-fetching page follows the "state triad":
```typescript
protected readonly items = signal<T[]>([]);
protected readonly loading = signal(true);
protected readonly error = signal('');
```

Template renders in priority order: **loading → error → empty → normal**.

## Services

All API services inject `HttpClient` and use `/api` prefix. Feature services extend a base `ApiService` pattern. Responses are typed via generic methods.

## Shared Components

- **ProgressBarComponent** — Animated bar with status color and percentage
- **StatusBadgeComponent** — Colored pill with status icon
- **KpiCardComponent** — Metric display with label and trend
- **FormFieldComponent** — Labeled input with error state
- **SubmitButtonComponent** — Button with loading spinner
- **EmptyStateComponent** — Illustration + message + action CTA
- **ConfirmDialogComponent** — Modal confirmation dialog
- **LoadingSkeletonComponent** — Animated placeholder
- **ToastContainerComponent** — Toast notification system
- **DarkModeToggleComponent** — Theme toggle
- **UserAvatarComponent** — Initials-based avatar

## Design System

**Horizon Blue** palette with full dark mode support via `data-theme` attribute on `<html>`. All colors defined as CSS custom properties in `:root` and `[data-theme="dark"]` selectors.
