import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamsService } from '../../services/teams.service';
import { Team } from '../../models';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { SubmitButtonComponent } from '../../shared/submit-button.component';
import { FormFieldComponent } from '../../shared/form-field.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-team-list-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    LoadingSkeletonComponent, EmptyStateComponent,
    SubmitButtonComponent, FormFieldComponent,
  ],
  template: `
    <div class="team-list-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Teams</h1>
          <p class="page-subtitle">Collaborate and track OKRs across teams</p>
        </div>
        <button class="btn-primary" (click)="showCreateForm.set(true)">
          + New Team
        </button>
      </div>

      @if (loading()) {
        <div class="loading-grid">
          @for (_ of [1,2,3]; track $index) {
            <app-loading-skeleton [height]="'150px'" [radius]="'12px'" />
          }
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span>⚠️</span>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadTeams()">Retry</button>
        </div>
      } @else if (teams().length === 0) {
        <app-empty-state
          icon="👥"
          title="No teams yet"
          message="Create your first team to start collaborating"
          actionLabel="Create Team"
          (onAction)="showCreateForm.set(true)"
        />
      } @else {
        <div class="team-grid">
          @for (team of teams(); track team.id) {
            <a class="team-card" [routerLink]="['/teams', team.id]">
              <div class="team-card-header">
                <div class="team-avatar">{{ team.name.charAt(0).toUpperCase() }}</div>
                <h3 class="team-name">{{ team.name }}</h3>
              </div>
              @if (team.description) {
                <p class="team-desc">{{ team.description }}</p>
              }
              <div class="team-stats">
                <div class="team-stat">
                  <span class="stat-value">{{ team.memberCount ?? 0 }}</span>
                  <span class="stat-label">Members</span>
                </div>
                <div class="team-stat">
                  <span class="stat-value">{{ team.objectiveCount ?? 0 }}</span>
                  <span class="stat-label">Objectives</span>
                </div>
                <div class="team-stat">
                  <span class="stat-value">{{ team.progress ?? 0 }}%</span>
                  <span class="stat-label">Progress</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>

    <!-- Create Team Modal -->
    @if (showCreateForm()) {
      <div class="modal-overlay" (click)="showCreateForm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Create Team</h2>
            <button class="modal-close" (click)="showCreateForm.set(false)">×</button>
          </div>
          <form (ngSubmit)="createTeam()" class="modal-form">
            <app-form-field
              label="Team Name"
              placeholder="E.g., Engineering"
              [(ngModel)]="newName"
              name="newName"
              [error]="formError()"
            />
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                class="form-textarea"
                placeholder="Describe your team..."
                [(ngModel)]="newDescription"
                name="newDescription"
                rows="3"
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="showCreateForm.set(false)">Cancel</button>
              <app-submit-button [loading]="saving()" (onClick)="createTeam()">Create Team</app-submit-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .team-list-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .page-title { font-size: 2rem; font-weight: 700; margin: 0; color: var(--color-text); }
    .page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 4px 0 0; }
    .btn-primary { padding: 10px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .btn-primary:hover { background: var(--color-primary-hover); }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: var(--color-text-secondary); }
    .retry-btn { padding: 8px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; font-family: inherit; font-weight: 600; }
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .team-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 24px; text-decoration: none; display: flex; flex-direction: column; gap: 16px; transition: box-shadow 0.2s, transform 0.2s; }
    .team-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .team-card-header { display: flex; align-items: center; gap: 14px; }
    .team-avatar { width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; flex-shrink: 0; }
    .team-name { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--color-text); }
    .team-desc { font-size: 0.813rem; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
    .team-stats { display: flex; gap: 16px; padding-top: 12px; border-top: 1px solid var(--color-border-light); }
    .team-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 1.125rem; font-weight: 700; color: var(--color-text); }
    .stat-label { font-size: 0.688rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--color-surface); border-radius: var(--radius-lg); padding: 28px; max-width: 480px; width: 90%; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted); }
    .modal-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .form-textarea { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text); font-size: 0.875rem; font-family: inherit; resize: vertical; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel { padding: 10px 20px; background: var(--color-surface); color: var(--color-text-secondary); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  `],
})
export class TeamListPageComponent implements OnInit {
  private readonly teamsService = inject(TeamsService);
  private readonly toast = inject(ToastService);

  protected readonly teams = signal<Team[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly showCreateForm = signal(false);

  protected newName = '';
  protected newDescription = '';

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.error.set('');
    this.teamsService.getTeams().pipe(takeUntilDestroyed()).subscribe({
      next: (data) => { this.teams.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Failed to load teams'); },
    });
  }

  createTeam(): void {
    this.formError.set('');
    if (!this.newName.trim()) {
      this.formError.set('Team name is required');
      return;
    }
    this.saving.set(true);
    this.teamsService.createTeam({
      name: this.newName,
      description: this.newDescription,
    }).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateForm.set(false);
        this.newName = '';
        this.newDescription = '';
        this.toast.success('Team created successfully');
        this.loadTeams();
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to create team');
      },
    });
  }
}
