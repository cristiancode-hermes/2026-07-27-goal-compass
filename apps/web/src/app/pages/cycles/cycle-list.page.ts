import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CyclesService } from '../../services/cycles.service';
import { Cycle } from '../../models';
import { ProgressBarComponent } from '../../shared/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { SubmitButtonComponent } from '../../shared/submit-button.component';
import { FormFieldComponent } from '../../shared/form-field.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-cycle-list-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ProgressBarComponent, StatusBadgeComponent,
    LoadingSkeletonComponent, EmptyStateComponent,
    SubmitButtonComponent, FormFieldComponent,
  ],
  template: `
    <div class="cycle-list-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Cycles</h1>
          <p class="page-subtitle">Manage OKR cycles and time periods</p>
        </div>
        <button class="btn-primary" (click)="showCreateForm.set(true)">
          + New Cycle
        </button>
      </div>

      @if (loading()) {
        <div class="loading-grid">
          @for (_ of [1,2,3]; track $index) {
            <app-loading-skeleton [height]="'160px'" [radius]="'12px'" />
          }
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span>⚠️</span>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadCycles()">Retry</button>
        </div>
      } @else if (cycles().length === 0) {
        <app-empty-state
          icon="🔄"
          title="No cycles yet"
          message="Create your first OKR cycle to organize objectives by time period"
          actionLabel="New Cycle"
          (onAction)="showCreateForm.set(true)"
        />
      } @else {
        <div class="cycle-grid">
          @for (cycle of cycles(); track cycle.id) {
            <div class="cycle-card" [class.cycle-active]="cycle.status === 'active'">
              <div class="cycle-card-header">
                <h3 class="cycle-name">{{ cycle.name }}</h3>
                <app-status-badge [status]="cycle.status" />
              </div>
              @if (cycle.description) {
                <p class="cycle-desc">{{ cycle.description }}</p>
              }
              <div class="cycle-dates">
                <div class="cycle-date">
                  <span class="date-label">Start</span>
                  <span class="date-value">{{ cycle.startDate | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="cycle-date">
                  <span class="date-label">End</span>
                  <span class="date-value">{{ cycle.endDate | date:'MMM d, yyyy' }}</span>
                </div>
              </div>
              <div class="cycle-stats">
                <span class="cycle-stat">
                  <strong>{{ cycle.objectiveCount ?? 0 }}</strong> objectives
                </span>
                <span class="cycle-stat">
                  <strong>{{ cycle.progress ?? 0 }}%</strong> progress
                </span>
              </div>
              <app-progress-bar [value]="cycle.progress ?? 0" [height]="'6px'" />
              <div class="cycle-actions">
                <button class="btn-action" (click)="activateCycle(cycle)" [disabled]="cycle.status !== 'draft'">
                  Activate
                </button>
                <button class="btn-action btn-action-close" (click)="closeCycle(cycle)" [disabled]="cycle.status !== 'active'">
                  Close
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create Cycle Modal -->
    @if (showCreateForm()) {
      <div class="modal-overlay" (click)="showCreateForm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Create Cycle</h2>
            <button class="modal-close" (click)="showCreateForm.set(false)">×</button>
          </div>
          <form (ngSubmit)="createCycle()" class="modal-form">
            <app-form-field
              label="Cycle Name"
              placeholder="E.g., Q3 2026"
              [(ngModel)]="newName"
              name="newName"
              [error]="formError()"
            />
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" [(ngModel)]="newDescription" name="newDescription" rows="2" placeholder="Optional description"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input class="form-input" type="date" [(ngModel)]="newStartDate" name="newStartDate" />
              </div>
              <div class="form-group">
                <label class="form-label">End Date</label>
                <input class="form-input" type="date" [(ngModel)]="newEndDate" name="newEndDate" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="showCreateForm.set(false)">Cancel</button>
              <app-submit-button [loading]="saving()" (onClick)="createCycle()">Create</app-submit-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .cycle-list-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .page-title { font-size: 2rem; font-weight: 700; margin: 0; color: var(--color-text); }
    .page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 4px 0 0; }
    .btn-primary { padding: 10px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .btn-primary:hover { background: var(--color-primary-hover); }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: var(--color-text-secondary); }
    .retry-btn { padding: 8px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; font-family: inherit; font-weight: 600; }
    .cycle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .cycle-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px; transition: box-shadow 0.2s; }
    .cycle-card:hover { box-shadow: var(--shadow-md); }
    .cycle-card.cycle-active { border-color: var(--color-secondary); }
    .cycle-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .cycle-name { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .cycle-desc { font-size: 0.813rem; color: var(--color-text-secondary); margin: 0; line-height: 1.4; }
    .cycle-dates { display: flex; gap: 24px; }
    .cycle-date { display: flex; flex-direction: column; gap: 2px; }
    .date-label { font-size: 0.688rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .date-value { font-size: 0.813rem; font-weight: 500; color: var(--color-text); }
    .cycle-stats { display: flex; gap: 16px; }
    .cycle-stat { font-size: 0.813rem; color: var(--color-text-secondary); }
    .cycle-stat strong { color: var(--color-text); }
    .cycle-actions { display: flex; gap: 8px; }
    .btn-action { padding: 6px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-action:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-action-close { background: var(--color-surface); color: var(--color-text); border: 1.5px solid var(--color-border); }
    .btn-action-close:hover:not(:disabled) { background: var(--color-surface-hover); }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--color-surface); border-radius: var(--radius-lg); padding: 28px; max-width: 500px; width: 90%; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted); }
    .modal-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .form-textarea, .form-input { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text); font-size: 0.875rem; font-family: inherit; }
    .form-textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-cancel { padding: 10px 20px; background: var(--color-surface); color: var(--color-text-secondary); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  `],
})
export class CycleListPageComponent implements OnInit {
  private readonly cyclesService = inject(CyclesService);
  private readonly toast = inject(ToastService);

  protected readonly cycles = signal<Cycle[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly showCreateForm = signal(false);

  protected newName = '';
  protected newDescription = '';
  protected newStartDate = '';
  protected newEndDate = '';

  ngOnInit(): void {
    this.loadCycles();
  }

  loadCycles(): void {
    this.loading.set(true);
    this.error.set('');
    this.cyclesService.getCycles().pipe(takeUntilDestroyed()).subscribe({
      next: (data) => { this.cycles.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Failed to load cycles'); },
    });
  }

  createCycle(): void {
    this.formError.set('');
    if (!this.newName.trim()) { this.formError.set('Cycle name is required'); return; }
    if (!this.newStartDate) { this.formError.set('Start date is required'); return; }
    if (!this.newEndDate) { this.formError.set('End date is required'); return; }

    this.saving.set(true);
    this.cyclesService.createCycle({
      name: this.newName,
      description: this.newDescription,
      startDate: this.newStartDate,
      endDate: this.newEndDate,
    } as any).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateForm.set(false);
        this.newName = '';
        this.newDescription = '';
        this.newStartDate = '';
        this.newEndDate = '';
        this.toast.success('Cycle created successfully');
        this.loadCycles();
      },
      error: () => { this.saving.set(false); this.formError.set('Failed to create cycle'); },
    });
  }

  activateCycle(cycle: Cycle): void {
    this.cyclesService.updateCycle(cycle.id, { status: 'active' } as any)
      .pipe(takeUntilDestroyed()).subscribe({
        next: () => {
          this.toast.success(`${cycle.name} is now active`);
          this.loadCycles();
        },
        error: () => this.toast.error('Failed to activate cycle'),
      });
  }

  closeCycle(cycle: Cycle): void {
    this.cyclesService.updateCycle(cycle.id, { status: 'completed' } as any)
      .pipe(takeUntilDestroyed()).subscribe({
        next: () => {
          this.toast.success(`${cycle.name} has been closed`);
          this.loadCycles();
        },
        error: () => this.toast.error('Failed to close cycle'),
      });
  }
}
