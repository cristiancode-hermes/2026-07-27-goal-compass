import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [noAuthGuard],
    children: [
      { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPageComponent) },
      { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPageComponent) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPageComponent) },
      { path: 'objectives', loadComponent: () => import('./pages/objectives/objective-list.page').then(m => m.ObjectiveListPageComponent) },
      { path: 'objectives/:id', loadComponent: () => import('./pages/objectives/objective-detail.page').then(m => m.ObjectiveDetailPageComponent) },
      { path: 'teams', loadComponent: () => import('./pages/teams/team-list.page').then(m => m.TeamListPageComponent) },
      { path: 'teams/:id', loadComponent: () => import('./pages/teams/team-detail.page').then(m => m.TeamDetailPageComponent) },
      { path: 'cycles', loadComponent: () => import('./pages/cycles/cycle-list.page').then(m => m.CycleListPageComponent) },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPageComponent),
  },
];
