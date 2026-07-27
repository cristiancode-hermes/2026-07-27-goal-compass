import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ObjectivesService } from '../../services/objectives.service';
import { KeyResultsService } from '../../services/key-results.service';
import { CheckInsService } from '../../services/check-ins.service';
import { Objective, KeyResult, CheckIn } from '../../models';
import { ProgressBarComponent } from '../../shared/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { SubmitButtonComponent } from '../../shared/submit-button.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-objective-detail-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ProgressBarComponent, StatusBadgeComponent,
    LoadingSkeletonComponent, EmptyStateComponent,
    SubmitButtonComponent,
  ],
  template: `
    <div class="obj-detail">
      @if (loading()) {
        <div class="loading-section">
          <app-loading-skeleton [height]="'200px'" [radius]="'12px'" />
          <app-loading-skeleton [lines]="3" />
          <app-loading-skeleton [height]="'120px'" [radius]="'12px'" />
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadObjective()">Retry</button>
        </div>
      } @else {
        <!-- Objective Header -->
        <div class="obj-header">
          <div class="obj-header-top">
            <div class="obj-header-info">
              <div class="obj-breadcrumb">
                <a routerLink="/objectives" class="breadcrumb-link">← Objectives</a>
              </div>
              <h1 class="obj-title">{{ objective()?.title }}</h1>
              @if (objective()?.description) {
                <p class="obj-description">{{ objective()?.description }}</p>
              }
              <div class="obj-tags">
                <app-status-badge [status]="objective()?.status ?? ''" />
                @if (objective()?.team) {
                  <span class="obj-tag">{{ objective()?.team?.name }}</span>
                }
                @if (objective()?.cycle) {
                  <span class="obj-tag">{{ objective()?.cycle?.name }}</span>
                }
                @if (objective()?.owner) {
                  <span class="obj-tag">{{ objective()?.owner?.name }}</span>
                }
              </div>
            </div>
          </div>
          <div class="obj-progress-section">
            <div class="obj-progress-header">
              <span class="section-label">Overall Progress</span>
              <span class="obj-progress-value">{{ objective()?.progress ?? 0 }}%</span>
            </div>
            <app-progress-bar [value]="objective()?.progress ?? 0" [height]="'12px'" />
            <div class="confidence-row">
              <span class="section-label">Confidence</span>
              <div class="confidence-bar">
                <div
                  class="confidence-fill"
                  [style.width.%]="objective()?.confidence ?? 0"
                  [style.background]="getConfidenceColor(objective()?.confidence ?? 0)"
                ></div>
              </div>
              <span class="confidence-value">{{ objective()?.confidence ?? 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Key Results Section -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Key Results</h2>
          </div>

          @if (keyResults().length === 0) {
            <app-empty-state
              icon="📊"
              title="No key results"
              message="Add key results to measure progress toward this objective"
            />
          } @else {
            <div class="kr-list">
              @for (kr of keyResults(); track kr.id) {
                <div class="kr-card" [class.kr-completed]="kr.status === 'completed'">
                  <div class="kr-header">
                    <div class="kr-title-section">
                      <h3 class="kr-title">{{ kr.title }}</h3>
                      <app-status-badge [status]="kr.status" />
                    </div>
                    <div class="kr-values">
                      <span class="kr-value-current" [style.color]="getKrValueColor(kr)">
                        {{ kr.currentValue }}{{ kr.unit }}
                      </span>
                      <span class="kr-value-target">/ {{ kr.targetValue }}{{ kr.unit }}</span>
                    </div>
                  </div>
                  <app-progress-bar [value]="kr.progress" [height]="'8px'" />
                  <div class="kr-confidence">
                    <span class="kr-confidence-dot" [style.background]="getConfidenceColor(kr.confidence)"></span>
                    <span>{{ kr.confidence }}% confidence</span>
                  </div>
                  <button class="btn-checkin" (click)="addCheckIn(kr)">
                    + Add Check-in
                  </button>

                  <!-- Check-ins for this KR -->
                  @if (checkInsByKrId(kr.id).length > 0) {
                    <div class="checkin-timeline">
                      <div class="timeline-header">Check-ins</div>
                      @for (ci of checkInsByKrId(kr.id); track ci.id) {
                        <div class="checkin-item">
                          <div class="checkin-dot" [style.background]="getCheckinDotColor(ci.status)"></div>
                          <div class="checkin-content">
                            <div class="checkin-top">
                              <span class="checkin-value">{{ ci.value }}{{ kr.unit }}</span>
                              <app-status-badge [status]="ci.status" />
                              <span class="checkin-confidence">{{ ci.confidence }}%</span>
                            </div>
                            @if (ci.note) {
                              <p class="checkin-note">{{ ci.note }}</p>
                            }
                            <span class="checkin-time">{{ ci.createdAt | date:'medium' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Add Check-in Modal -->
        @if (showCheckinForm()) {
          <div class="modal-overlay" (click)="showCheckinForm.set(false)">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2 class="modal-title">Add Check-in</h2>
                <button class="modal-close" (click)="showCheckinForm.set(false)">×</button>
              </div>
              <div class="modal-body">
                <p class="kr-ref-label">For: <strong>{{ checkinKrTitle }}</strong></p>
                <div class="form-group">
                  <label class="form-label">Current Value</label>
                  <input class="form-input" type="number" [(ngModel)]="checkinValue" placeholder="Current value" />
                </div>
                <div class="form-group">
                  <label class="form-label">Confidence (0-100)</label>
                  <input class="form-input" type="number" [(ngModel)]="checkinConfidence" placeholder="50" min="0" max="100" />
                </div>
                <div class="form-group">
                  <label class="form-label">Note</label>
                  <textarea class="form-textarea" [(ngModel)]="checkinNote" rows="3" placeholder="How's it going?"></textarea>
                </div>
                @if (checkinError()) {
                  <div class="form-error">{{ checkinError() }}</div>
                }
              </div>
              <div class="modal-actions">
                <button class="btn-cancel" (click)="showCheckinForm.set(false)">Cancel</button>
                <app-submit-button [loading]="checkinSaving()" (onClick)="submitCheckIn()">Submit</app-submit-button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .obj-detail { display: flex; flex-direction: column; gap: 24px; }
    .loading-section { display: flex; flex-direction: column; gap: 20px; }
    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: var(--color-text-secondary); }
    .error-icon { font-size: 2rem; }
    .retry-btn { padding: 8px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; font-family: inherit; font-weight: 600; }
    .obj-header { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .obj-breadcrumb { margin-bottom: 8px; }
    .breadcrumb-link { font-size: 0.813rem; color: var(--color-primary); text-decoration: none; font-weight: 500; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .obj-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 8px; color: var(--color-text); }
    .obj-description { font-size: 0.938rem; color: var(--color-text-secondary); margin: 0 0 12px; line-height: 1.5; }
    .obj-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .obj-tag { padding: 4px 10px; font-size: 0.75rem; font-weight: 600; background: var(--color-bg); color: var(--color-text-secondary); border-radius: var(--radius-full); }
    .obj-progress-section { display: flex; flex-direction: column; gap: 12px; }
    .obj-progress-header { display: flex; justify-content: space-between; align-items: center; }
    .section-label { font-size: 0.813rem; font-weight: 600; color: var(--color-text-secondary); }
    .obj-progress-value { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; color: var(--color-primary); }
    .confidence-row { display: flex; align-items: center; gap: 10px; }
    .confidence-bar { flex: 1; height: 6px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; }
    .confidence-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.6s ease; }
    .confidence-value { font-family: 'JetBrains Mono', monospace; font-size: 0.813rem; font-weight: 600; min-width: 35px; text-align: right; }
    .section { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 24px; }
    .section-header { margin-bottom: 20px; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin: 0; }
    .kr-list { display: flex; flex-direction: column; gap: 16px; }
    .kr-card { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; background: var(--color-bg); display: flex; flex-direction: column; gap: 12px; }
    .kr-card.kr-completed { border-color: rgba(46, 196, 182, 0.3); }
    .kr-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .kr-title-section { flex: 1; }
    .kr-title { font-size: 1rem; font-weight: 600; margin: 0 0 6px; }
    .kr-values { text-align: right; flex-shrink: 0; }
    .kr-value-current { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; }
    .kr-value-target { font-family: 'JetBrains Mono', monospace; font-size: 0.938rem; color: var(--color-text-muted); }
    .kr-confidence { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--color-text-secondary); }
    .kr-confidence-dot { width: 8px; height: 8px; border-radius: 50%; }
    .btn-checkin { align-self: flex-start; padding: 6px 14px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-checkin:hover { background: var(--color-primary-hover); }
    .checkin-timeline { border-top: 1px solid var(--color-border-light); padding-top: 12px; margin-top: 4px; }
    .timeline-header { font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .checkin-item { display: flex; gap: 10px; padding: 8px 0; position: relative; }
    .checkin-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
    .checkin-content { flex: 1; }
    .checkin-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .checkin-value { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.813rem; }
    .checkin-confidence { font-size: 0.75rem; color: var(--color-text-secondary); }
    .checkin-note { font-size: 0.813rem; color: var(--color-text); margin: 4px 0; line-height: 1.4; }
    .checkin-time { font-size: 0.688rem; color: var(--color-text-muted); }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--color-surface); border-radius: var(--radius-lg); padding: 28px; max-width: 480px; width: 90%; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted); }
    .modal-body { display: flex; flex-direction: column; gap: 16px; }
    .kr-ref-label { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .form-input, .form-textarea { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text); font-size: 0.875rem; font-family: inherit; }
    .form-textarea { resize: vertical; }
    .form-error { padding: 10px 14px; background: rgba(230,57,70,0.08); border: 1px solid rgba(230,57,70,0.2); border-radius: var(--radius-md); color: var(--color-danger); font-size: 0.813rem; font-weight: 500; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-cancel { padding: 10px 20px; background: var(--color-surface); color: var(--color-text-secondary); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  `],
})
export class ObjectiveDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly objectivesService = inject(ObjectivesService);
  private readonly keyResultsService = inject(KeyResultsService);
  private readonly checkInsService = inject(CheckInsService);
  private readonly toast = inject(ToastService);

  protected readonly objective = signal<Objective | null>(null);
  protected readonly keyResults = signal<KeyResult[]>([]);
  protected readonly checkIns = signal<CheckIn[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  // Check-in form
  protected readonly showCheckinForm = signal(false);
  protected readonly checkinSaving = signal(false);
  protected readonly checkinError = signal('');
  protected checkinKrId = '';
  protected checkinKrTitle = '';
  protected checkinValue = 0;
  protected checkinConfidence = 50;
  protected checkinNote = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.objectiveId = id;
      this.loadObjective();
    }
  }

  private objectiveId = '';

  loadObjective(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      objective: this.objectivesService.getObjective(this.objectiveId).pipe(
        catchError(() => of(null))
      ),
      keyResults: this.keyResultsService.getKeyResults(this.objectiveId).pipe(
        catchError(() => of([]))
      ),
    }).pipe(takeUntilDestroyed()).subscribe({
      next: (res) => {
        if (!res.objective) {
          this.error.set('Objective not found');
          this.loading.set(false);
          return;
        }
        this.objective.set(res.objective);
        this.keyResults.set(res.keyResults);
        this.loading.set(false);

        // Load check-ins for all KRs
        res.keyResults.forEach(kr => {
          this.checkInsService.getCheckIns(kr.id).pipe(
            catchError(() => of([]))
          ).subscribe(cis => {
            this.checkIns.update(prev => [...prev, ...cis]);
          });
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load objective details');
      },
    });
  }

  checkInsByKrId(krId: string): CheckIn[] {
    return this.checkIns().filter(ci => ci.keyResultId === krId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addCheckIn(kr: KeyResult): void {
    this.checkinKrId = kr.id;
    this.checkinKrTitle = kr.title;
    this.checkinValue = kr.currentValue;
    this.checkinConfidence = kr.confidence;
    this.checkinNote = '';
    this.checkinError.set('');
    this.showCheckinForm.set(true);
  }

  submitCheckIn(): void {
    this.checkinError.set('');
    this.checkinSaving.set(true);

    this.checkInsService.createCheckIn({
      keyResultId: this.checkinKrId,
      value: this.checkinValue,
      confidence: this.checkinConfidence,
      note: this.checkinNote,
    } as any).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.checkinSaving.set(false);
        this.showCheckinForm.set(false);
        this.toast.success('Check-in recorded');
        this.loadObjective();
      },
      error: () => {
        this.checkinSaving.set(false);
        this.checkinError.set('Failed to save check-in');
      },
    });
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'var(--color-success)';
    if (confidence >= 50) return 'var(--color-secondary)';
    if (confidence >= 30) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  getKrValueColor(kr: KeyResult): string {
    if (kr.status === 'completed') return 'var(--color-success)';
    if (kr.status === 'behind') return 'var(--color-danger)';
    if (kr.status === 'at_risk') return 'var(--color-warning)';
    return 'var(--color-secondary)';
  }

  getCheckinDotColor(status: string): string {
    const map: Record<string, string> = {
      on_track: 'var(--color-success)',
      at_risk: 'var(--color-warning)',
      behind: 'var(--color-danger)',
      completed: 'var(--color-success)',
      not_started: 'var(--color-text-muted)',
    };
    return map[status] || 'var(--color-text-muted)';
  }
}
