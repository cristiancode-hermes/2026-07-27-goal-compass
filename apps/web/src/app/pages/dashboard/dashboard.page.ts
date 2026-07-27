import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../services/dashboard.service';
import { CyclesService } from '../../services/cycles.service';
import { TeamsService } from '../../services/teams.service';
import { DashboardData, Cycle, Team } from '../../models';
import { ProgressBarComponent } from '../../shared/progress-bar.component';
import { KpiCardComponent } from '../../shared/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ProgressBarComponent, KpiCardComponent, StatusBadgeComponent,
    LoadingSkeletonComponent, EmptyStateComponent,
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview of your OKR progress</p>
        </div>
        <div class="header-controls">
          <select class="filter-select" [(ngModel)]="selectedCycleId" (ngModelChange)="loadDashboard()">
            <option value="">All Cycles</option>
            @for (cycle of cycles(); track cycle.id) {
              <option [value]="cycle.id">{{ cycle.name }}</option>
            }
          </select>
          <select class="filter-select" [(ngModel)]="selectedTeamId" (ngModelChange)="loadDashboard()">
            <option value="">All Teams</option>
            @for (team of teams(); track team.id) {
              <option [value]="team.id">{{ team.name }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-grid">
          <app-loading-skeleton [height]="'120px'" [radius]="'12px'" />
          <app-loading-skeleton [height]="'120px'" [radius]="'12px'" />
          <app-loading-skeleton [height]="'120px'" [radius]="'12px'" />
          <app-loading-skeleton [height]="'120px'" [radius]="'12px'" />
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadDashboard()">Retry</button>
        </div>
      } @else {
        <!-- Overall Progress -->
        <div class="overall-progress-card">
          <div class="progress-header">
            <h3>Overall Progress</h3>
            <span class="progress-percent">{{ dashData()?.overallProgress ?? 0 }}%</span>
          </div>
          <app-progress-bar [value]="dashData()?.overallProgress ?? 0" [height]="'12px'" />
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          @for (kpi of dashData()?.kpiCards; track kpi.label) {
            <app-kpi-card
              [value]="kpi.value"
              [label]="kpi.label"
              [trend]="kpi.trend"
              [trendValue]="kpi.trendValue ?? null"
            />
          }
        </div>

        <!-- Two-column section -->
        <div class="dashboard-columns">
          <!-- Objectives list -->
          <div class="dashboard-section">
            <div class="section-header">
              <h3 class="section-title">Objectives</h3>
              <a class="section-link" routerLink="/objectives">View all →</a>
            </div>

            @if ((dashData()?.objectives?.length ?? 0) === 0) {
              <app-empty-state
                icon="🎯"
                title="No objectives yet"
                message="Create your first objective to start tracking progress"
              />
            } @else {
              <div class="objective-mini-list">
                @for (obj of dashData()?.objectives?.slice(0, 5); track obj.id) {
                  <a class="objective-mini-card" [routerLink]="['/objectives', obj.id]">
                    <div class="obj-mini-header">
                      <span class="obj-mini-title">{{ obj.title }}</span>
                      <app-status-badge [status]="obj.status" />
                    </div>
                    <app-progress-bar [value]="obj.progress" [height]="'6px'" />
                  </a>
                }
              </div>
            }
          </div>

          <!-- Activity + Team Progress -->
          <div class="dashboard-right">
            <div class="dashboard-section">
              <h3 class="section-title">Recent Activity</h3>
              @if ((dashData()?.recentActivity?.length ?? 0) === 0) {
                <p class="text-muted">No recent activity</p>
              } @else {
                <div class="activity-list">
                  @for (activity of dashData()?.recentActivity?.slice(0, 5); track activity.id) {
                    <div class="activity-item">
                      <span class="activity-dot" [style.background]="getActivityColor(activity.type)"></span>
                      <div class="activity-content">
                        <p class="activity-message">{{ activity.message }}</p>
                        <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="dashboard-section">
              <h3 class="section-title">Team Progress</h3>
              @if ((dashData()?.teamProgress?.length ?? 0) === 0) {
                <p class="text-muted">No teams found</p>
              } @else {
                <div class="team-progress-list">
                  @for (tp of dashData()?.teamProgress; track tp.teamId) {
                    <div class="team-progress-item">
                      <div class="tp-header">
                        <span class="tp-name">{{ tp.teamName }}</span>
                        <span class="tp-count">{{ tp.completedCount }}/{{ tp.objectiveCount }}</span>
                      </div>
                      <app-progress-bar [value]="tp.progress" [height]="'6px'" />
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 24px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title { font-size: 2rem; font-weight: 700; margin: 0; color: var(--color-text); }
    .page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 4px 0 0; }
    .header-controls { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-select {
      padding: 8px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.875rem;
      font-family: inherit;
      cursor: pointer;
    }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px;
      color: var(--color-text-secondary);
    }
    .error-icon { font-size: 2rem; }
    .retry-btn {
      padding: 8px 20px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
    }
    .overall-progress-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 24px;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .progress-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    .progress-percent { font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 700; color: var(--color-primary); }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .dashboard-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .dashboard-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title { font-size: 1rem; font-weight: 600; margin: 0; }
    .section-link { font-size: 0.813rem; color: var(--color-primary); text-decoration: none; font-weight: 600; }
    .section-link:hover { text-decoration: underline; }
    .objective-mini-list { display: flex; flex-direction: column; gap: 8px; }
    .objective-mini-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border-radius: var(--radius-md);
      text-decoration: none;
      background: var(--color-bg);
      transition: background 0.2s;
    }
    .objective-mini-card:hover { background: var(--color-surface-hover); }
    .obj-mini-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .obj-mini-title { font-size: 0.813rem; font-weight: 600; color: var(--color-text); }
    .dashboard-right { display: flex; flex-direction: column; gap: 24px; }
    .activity-list { display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; gap: 10px; align-items: flex-start; }
    .activity-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .activity-content { flex: 1; }
    .activity-message { font-size: 0.813rem; color: var(--color-text); margin: 0; line-height: 1.4; }
    .activity-time { font-size: 0.688rem; color: var(--color-text-muted); }
    .team-progress-list { display: flex; flex-direction: column; gap: 12px; }
    .team-progress-item { display: flex; flex-direction: column; gap: 6px; }
    .tp-header { display: flex; justify-content: space-between; font-size: 0.813rem; }
    .tp-name { font-weight: 600; color: var(--color-text); }
    .tp-count { color: var(--color-text-secondary); }
    .text-muted { font-size: 0.813rem; color: var(--color-text-muted); margin: 0; }
    @media (max-width: 900px) {
      .dashboard-columns { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cyclesService = inject(CyclesService);
  private readonly teamsService = inject(TeamsService);
  private readonly toast = inject(ToastService);

  protected readonly dashData = signal<DashboardData | null>(null);
  protected readonly cycles = signal<Cycle[]>([]);
  protected readonly teams = signal<Team[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected selectedCycleId = '';
  protected selectedTeamId = '';

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);
    forkJoin({
      cycles: this.cyclesService.getCycles().pipe(catchError(() => of([]))),
      teams: this.teamsService.getTeams().pipe(catchError(() => of([]))),
    }).pipe(takeUntilDestroyed()).subscribe({
      next: (res) => {
        this.cycles.set(res.cycles);
        this.teams.set(res.teams);
        this.loadDashboard();
      },
      error: () => {
        this.loadDashboard();
      },
    });
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');
    const params: any = {};
    if (this.selectedCycleId) params.cycleId = this.selectedCycleId;
    if (this.selectedTeamId) params.teamId = this.selectedTeamId;

    this.dashboardService.getDashboard(params).pipe(takeUntilDestroyed()).subscribe({
      next: (data) => {
        this.dashData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load dashboard data');
      },
    });
  }

  getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      check_in: 'var(--color-success)',
      objective_created: 'var(--color-primary)',
      kr_updated: 'var(--color-secondary)',
      team_joined: 'var(--color-accent)',
      cycle_started: 'var(--color-warning)',
    };
    return colors[type] || 'var(--color-text-muted)';
  }
}
