import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ObjectivesService } from '../../services/objectives.service';
import { TeamsService } from '../../services/teams.service';
import { CyclesService } from '../../services/cycles.service';
import { Objective, Team, Cycle } from '../../models';
import { ProgressBarComponent } from '../../shared/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ToastService } from '../../shared/toast.service';
import { SubmitButtonComponent } from '../../shared/submit-button.component';
import { FormFieldComponent } from '../../shared/form-field.component';

@Component({
  selector: 'app-objective-list-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ProgressBarComponent, StatusBadgeComponent,
    LoadingSkeletonComponent, EmptyStateComponent,
    SubmitButtonComponent, FormFieldComponent,
  ],
  template: `
    <div class="obj-list-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Objectives</h1>
          <p class="page-subtitle">Manage your OKRs across teams and cycles</p>
        </div>
        <button class="btn-primary" (click)="showNewForm.set(true)">
          + New Objective
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input
          class="search-input"
          type="text"
          placeholder="Search objectives..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="loadObjectives()"
        />
        <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="loadObjectives()">
          <option value="">All Status</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="behind">Behind</option>
          <option value="completed">Completed</option>
          <option value="not_started">Not Started</option>
        </select>
        <select class="filter-select" [(ngModel)]="cycleFilter" (ngModelChange)="loadObjectives()">
          <option value="">All Cycles</option>
          @for (cycle of cycles(); track cycle.id) {
            <option [value]="cycle.id">{{ cycle.name }}</option>
          }
        </select>
        <select class="filter-select" [(ngModel)]="teamFilter" (ngModelChange)="loadObjectives()">
          <option value="">All Teams</option>
          @for (team of teams(); track team.id) {
            <option [value]="team.id">{{ team.name }}</option>
          }
        </select>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-grid">
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <app-loading-skeleton [height]="'180px'" [radius]="'12px'" />
          }
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadObjectives()">Retry</button>
        </div>
      } @else if (objectives().length === 0) {
        <app-empty-state
          icon="🎯"
          title="No objectives found"
          message="Create your first objective to start tracking progress"
          actionLabel="New Objective"
          (onAction)="showNewForm.set(true)"
        />
      } @else {
        <!-- Objective Grid -->
        <div class="obj-grid">
          @for (obj of objectives(); track obj.id) {
            <a class="obj-card" [routerLink]="['/objectives', obj.id]">
              <div class="obj-card-header">
                <h3 class="obj-card-title">{{ obj.title }}</h3>
                <app-status-badge [status]="obj.status" />
              </div>
              @if (obj.description) {
                <p class="obj-card-desc">{{ obj.description }}</p>
              }
              <div class="obj-card-meta">
                @if (obj.team) {
                  <span class="obj-meta-tag">{{ obj.team.name }}</span>
                }
                @if (obj.cycle) {
                  <span class="obj-meta-tag">{{ obj.cycle.name }}</span>
                }
                @if (obj.owner) {
                  <span class="obj-meta-tag">{{ obj.owner.name }}</span>
                }
              </div>
              <div class="obj-card-progress">
                <div class="obj-progress-header">
                  <span class="obj-progress-label">Progress</span>
                  <span class="obj-progress-value">{{ obj.progress }}%</span>
                </div>
                <app-progress-bar [value]="obj.progress" [height]="'6px'" [showLabel]="false" />
              </div>
              @if (obj.confidence) {
                <div class="obj-card-footer">
                  <span class="confidence-badge" [style.background]="getConfidenceColor(obj.confidence)">
                    {{ obj.confidence }}% confidence
                  </span>
                </div>
              }
            </a>
          }
        </div>
      }
    </div>

    <!-- New Objective Modal -->
    @if (showNewForm()) {
      <div class="modal-overlay" (click)="showNewForm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">New Objective</h2>
            <button class="modal-close" (click)="showNewForm.set(false)">×</button>
          </div>
          <form (ngSubmit)="createObjective()" class="modal-form">
            <app-form-field
              label="Title"
              placeholder="E.g., Improve customer satisfaction"
              [(ngModel)]="newTitle"
              name="newTitle"
            />
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                class="form-textarea"
                placeholder="Describe your objective..."
                [(ngModel)]="newDescription"
                name="newDescription"
                rows="3"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Team</label>
                <select class="form-select" [(ngModel)]="newTeamId" name="newTeamId">
                  <option value="">No team</option>
                  @for (t of teams(); track t.id) {
                    <option [value]="t.id">{{ t.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Cycle</label>
                <select class="form-select" [(ngModel)]="newCycleId" name="newCycleId">
                  <option value="">Select cycle</option>
                  @for (c of cycles(); track c.id) {
                    <option [value]="c.id">{{ c.name }}</option>
                  }
                </select>
              </div>
            </div>
            @if (formError()) {
              <div class="form-error">{{ formError() }}</div>
            }
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="showNewForm.set(false)">Cancel</button>
              <app-submit-button [loading]="saving()" (onClick)="createObjective()">Create</app-submit-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .obj-list-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;
    }
    .page-title { font-size: 2rem; font-weight: 700; margin: 0; color: var(--color-text); }
    .page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 4px 0 0; }
    .btn-primary {
      padding: 10px 20px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
      white-space: nowrap;
    }
    .btn-primary:hover { background: var(--color-primary-hover); }
    .filters-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 10px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.875rem;
      font-family: inherit;
    }
    .search-input::placeholder { color: var(--color-text-muted); }
    .filter-select {
      padding: 10px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.875rem;
      font-family: inherit;
      cursor: pointer;
    }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .error-state {
      display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px;
      color: var(--color-text-secondary);
    }
    .error-icon { font-size: 2rem; }
    .retry-btn {
      padding: 8px 20px; background: var(--color-primary); color: #fff;
      border: none; border-radius: var(--radius-md); cursor: pointer; font-family: inherit; font-weight: 600;
    }
    .obj-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .obj-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .obj-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .obj-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .obj-card-title { font-size: 1rem; font-weight: 600; color: var(--color-text); margin: 0; }
    .obj-card-desc { font-size: 0.813rem; color: var(--color-text-secondary); margin: 0; line-height: 1.4; }
    .obj-card-meta { display: flex; flex-wrap: wrap; gap: 6px; }
    .obj-meta-tag {
      padding: 2px 8px;
      font-size: 0.688rem;
      font-weight: 600;
      background: var(--color-bg);
      color: var(--color-text-secondary);
      border-radius: var(--radius-full);
    }
    .obj-card-progress { display: flex; flex-direction: column; gap: 6px; }
    .obj-progress-header { display: flex; justify-content: space-between; font-size: 0.75rem; }
    .obj-progress-label { color: var(--color-text-secondary); }
    .obj-progress-value { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--color-text); }
    .obj-card-footer { display: flex; gap: 6px; }
    .confidence-badge {
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-size: 0.688rem;
      font-weight: 600;
      color: #fff;
    }
    /* Modal styles */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      animation: fadeIn 0.15s ease;
    }
    .modal {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 28px;
      max-width: 500px;
      width: 90%;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.2s ease;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted); }
    .modal-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .form-textarea, .form-select {
      padding: 10px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.875rem;
      font-family: inherit;
    }
    .form-textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-error {
      padding: 10px 14px; background: rgba(230,57,70,0.08);
      border: 1px solid rgba(230,57,70,0.2); border-radius: var(--radius-md);
      color: var(--color-danger); font-size: 0.813rem; font-weight: 500;
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel {
      padding: 10px 20px; background: var(--color-surface); color: var(--color-text-secondary);
      border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
      font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ObjectiveListPageComponent implements OnInit {
  private readonly objectivesService = inject(ObjectivesService);
  private readonly teamsService = inject(TeamsService);
  private readonly cyclesService = inject(CyclesService);
  private readonly toast = inject(ToastService);

  protected readonly objectives = signal<Objective[]>([]);
  protected readonly teams = signal<Team[]>([]);
  protected readonly cycles = signal<Cycle[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly showNewForm = signal(false);

  protected searchQuery = '';
  protected statusFilter = '';
  protected cycleFilter = '';
  protected teamFilter = '';

  // New objective form
  protected newTitle = '';
  protected newDescription = '';
  protected newTeamId = '';
  protected newCycleId = '';

  ngOnInit(): void {
    forkJoin({
      teams: this.teamsService.getTeams().pipe(catchError(() => of([]))),
      cycles: this.cyclesService.getCycles().pipe(catchError(() => of([]))),
    }).pipe(takeUntilDestroyed()).subscribe(res => {
      this.teams.set(res.teams);
      this.cycles.set(res.cycles);
      this.loadObjectives();
    });
  }

  loadObjectives(): void {
    this.loading.set(true);
    this.error.set('');
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.cycleFilter) params.cycleId = this.cycleFilter;
    if (this.teamFilter) params.teamId = this.teamFilter;

    this.objectivesService.getObjectives(params).pipe(takeUntilDestroyed()).subscribe({
      next: (data) => { this.objectives.set(data); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.error.set('Failed to load objectives'); },
    });
  }

  createObjective(): void {
    this.formError.set('');
    if (!this.newTitle.trim()) {
      this.formError.set('Title is required');
      return;
    }
    this.saving.set(true);
    this.objectivesService.createObjective({
      title: this.newTitle,
      description: this.newDescription,
      teamId: this.newTeamId || undefined,
      cycleId: this.newCycleId || undefined,
    } as any).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showNewForm.set(false);
        this.newTitle = '';
        this.newDescription = '';
        this.newTeamId = '';
        this.newCycleId = '';
        this.toast.success('Objective created successfully');
        this.loadObjectives();
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to create objective');
      },
    });
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'var(--color-success)';
    if (confidence >= 50) return 'var(--color-secondary)';
    if (confidence >= 30) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }
}
