import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamsService } from '../../services/teams.service';
import { ObjectivesService } from '../../services/objectives.service';
import { Team, TeamMember, Objective } from '../../models';
import { ProgressBarComponent } from '../../shared/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { UserAvatarComponent } from '../../shared/user-avatar.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { SubmitButtonComponent } from '../../shared/submit-button.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ProgressBarComponent, StatusBadgeComponent,
    LoadingSkeletonComponent, EmptyStateComponent,
    UserAvatarComponent, ConfirmDialogComponent,
    SubmitButtonComponent,
  ],
  template: `
    <div class="team-detail">
      @if (loading()) {
        <div class="loading-section">
          <app-loading-skeleton [height]="'160px'" [radius]="'12px'" />
          <app-loading-skeleton [lines]="4" />
        </div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadTeam()">Retry</button>
        </div>
      } @else {
        <!-- Team Header -->
        <div class="team-header">
          <div class="team-header-left">
            <div class="team-avatar-lg">{{ team()?.name?.charAt(0)?.toUpperCase() }}</div>
            <div>
              <div class="breadcrumb">
                <a routerLink="/teams" class="breadcrumb-link">← Teams</a>
              </div>
              <h1 class="team-title">{{ team()?.name }}</h1>
              @if (team()?.description) {
                <p class="team-desc">{{ team()?.description }}</p>
              }
            </div>
          </div>
        </div>

        <div class="team-grid-cols">
          <!-- Members Section -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Members ({{ members().length }})</h2>
              <button class="btn-secondary btn-sm" (click)="showAddMember.set(true)">
                + Add Member
              </button>
            </div>

            @if (members().length === 0) {
              <app-empty-state icon="👤" title="No members" message="Add members to this team" />
            } @else {
              <div class="member-list">
                @for (member of members(); track member.id) {
                  <div class="member-item">
                    <app-user-avatar [name]="member.user?.name || 'U'" [size]="40" />
                    <div class="member-info">
                      <span class="member-name">{{ member.user?.name }}</span>
                      <span class="member-email">{{ member.user?.email }}</span>
                    </div>
                    <span class="member-role">{{ member.role }}</span>
                    <button class="btn-ghost btn-xs" (click)="confirmRemove(member)">
                      ✕
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Team Objectives Section -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Objectives</h2>
            </div>

            @if (objectives().length === 0) {
              <app-empty-state
                icon="🎯"
                title="No objectives"
                message="Link objectives to this team"
              />
            } @else {
              <div class="team-obj-list">
                @for (obj of objectives(); track obj.id) {
                  <a class="team-obj-item" [routerLink]="['/objectives', obj.id]">
                    <div class="team-obj-top">
                      <span class="team-obj-title">{{ obj.title }}</span>
                      <app-status-badge [status]="obj.status" />
                    </div>
                    <app-progress-bar [value]="obj.progress" [height]="'6px'" />
                  </a>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Add Member Modal -->
    @if (showAddMember()) {
      <div class="modal-overlay" (click)="showAddMember.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Add Member</h2>
            <button class="modal-close" (click)="showAddMember.set(false)">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">User ID</label>
              <input class="form-input" [(ngModel)]="newMemberUserId" placeholder="Enter user ID" />
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select class="form-select" [(ngModel)]="newMemberRole">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            @if (memberError()) {
              <div class="form-error">{{ memberError() }}</div>
            }
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showAddMember.set(false)">Cancel</button>
            <app-submit-button [loading]="memberSaving()" (onClick)="addMember()">Add</app-submit-button>
          </div>
        </div>
      </div>
    }

    <!-- Confirm Remove Dialog -->
    <app-confirm-dialog
      [visible]="showRemoveConfirm()"
      title="Remove Member"
      [message]="'Are you sure you want to remove ' + (removeMemberName() || 'this member') + '?'"
      confirmLabel="Remove"
      [danger]="true"
      (onConfirm)="removeMember()"
      (onCancel)="showRemoveConfirm.set(false)"
    />
  `,
  styles: [`
    .team-detail { display: flex; flex-direction: column; gap: 24px; }
    .loading-section { display: flex; flex-direction: column; gap: 20px; }
    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: var(--color-text-secondary); }
    .error-icon { font-size: 2rem; }
    .retry-btn { padding: 8px 20px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; font-family: inherit; font-weight: 600; }
    .team-header { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 24px; }
    .team-header-left { display: flex; align-items: flex-start; gap: 20px; }
    .team-avatar-lg { width: 60px; height: 60px; border-radius: var(--radius-lg); background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; flex-shrink: 0; }
    .breadcrumb { margin-bottom: 4px; }
    .breadcrumb-link { font-size: 0.813rem; color: var(--color-primary); text-decoration: none; font-weight: 500; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .team-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 6px; }
    .team-desc { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }
    .team-grid-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .btn-secondary { padding: 8px 16px; background: var(--color-surface); color: var(--color-text); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.813rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-secondary:hover { background: var(--color-surface-hover); }
    .btn-sm { padding: 6px 12px; font-size: 0.75rem; }
    .btn-xs { padding: 4px 8px; font-size: 0.75rem; background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-family: inherit; }
    .btn-xs:hover { color: var(--color-danger); }
    .btn-ghost { background: transparent; }
    .member-list { display: flex; flex-direction: column; gap: 8px; }
    .member-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: var(--radius-md); transition: background 0.2s; }
    .member-item:hover { background: var(--color-bg); }
    .member-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
    .member-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .member-email { font-size: 0.75rem; color: var(--color-text-secondary); }
    .member-role { font-size: 0.688rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-bg); padding: 2px 8px; border-radius: var(--radius-full); text-transform: capitalize; }
    .team-obj-list { display: flex; flex-direction: column; gap: 10px; }
    .team-obj-item { display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: var(--radius-md); background: var(--color-bg); text-decoration: none; transition: background 0.2s; }
    .team-obj-item:hover { background: var(--color-surface-hover); }
    .team-obj-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .team-obj-title { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--color-surface); border-radius: var(--radius-lg); padding: 28px; max-width: 440px; width: 90%; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted); }
    .modal-body { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
    .form-input, .form-select { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text); font-size: 0.875rem; font-family: inherit; }
    .form-error { padding: 10px 14px; background: rgba(230,57,70,0.08); border: 1px solid rgba(230,57,70,0.2); border-radius: var(--radius-md); color: var(--color-danger); font-size: 0.813rem; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-cancel { padding: 10px 20px; background: var(--color-surface); color: var(--color-text-secondary); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; }
    @media (max-width: 768px) { .team-grid-cols { grid-template-columns: 1fr; } }
  `],
})
export class TeamDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly teamsService = inject(TeamsService);
  private readonly objectivesService = inject(ObjectivesService);
  private readonly toast = inject(ToastService);

  protected readonly team = signal<Team | null>(null);
  protected readonly members = signal<TeamMember[]>([]);
  protected readonly objectives = signal<Objective[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly showAddMember = signal(false);
  protected readonly memberSaving = signal(false);
  protected readonly memberError = signal('');
  protected newMemberUserId = '';
  protected newMemberRole = 'member';

  protected readonly showRemoveConfirm = signal(false);
  protected removeMemberId = '';
  protected removeMemberName = signal('');

  private teamId = '';

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.teamId) this.loadTeam();
  }

  loadTeam(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      team: this.teamsService.getTeam(this.teamId).pipe(catchError(() => of(null))),
      objectives: this.objectivesService.getObjectives({ teamId: this.teamId }).pipe(catchError(() => of([]))),
    }).pipe(takeUntilDestroyed()).subscribe({
      next: (res) => {
        if (!res.team) { this.error.set('Team not found'); this.loading.set(false); return; }
        this.team.set(res.team);
        this.members.set(res.team.members ?? []);
        this.objectives.set(res.objectives);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.error.set('Failed to load team'); },
    });
  }

  addMember(): void {
    this.memberError.set('');
    if (!this.newMemberUserId.trim()) {
      this.memberError.set('User ID is required');
      return;
    }
    this.memberSaving.set(true);
    this.teamsService.addMember(this.teamId, this.newMemberUserId, this.newMemberRole)
      .pipe(takeUntilDestroyed()).subscribe({
        next: () => {
          this.memberSaving.set(false);
          this.showAddMember.set(false);
          this.newMemberUserId = '';
          this.toast.success('Member added successfully');
          this.loadTeam();
        },
        error: () => {
          this.memberSaving.set(false);
          this.memberError.set('Failed to add member');
        },
      });
  }

  confirmRemove(member: TeamMember): void {
    this.removeMemberId = member.id;
    this.removeMemberName.set(member.user?.name || 'this member');
    this.showRemoveConfirm.set(true);
  }

  removeMember(): void {
    this.teamsService.removeMember(this.teamId, this.removeMemberId)
      .pipe(takeUntilDestroyed()).subscribe({
        next: () => {
          this.showRemoveConfirm.set(false);
          this.toast.success('Member removed');
          this.loadTeam();
        },
        error: () => {
          this.toast.error('Failed to remove member');
          this.showRemoveConfirm.set(false);
        },
      });
  }
}
