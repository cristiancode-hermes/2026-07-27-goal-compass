import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Team } from '../models';

@Injectable({ providedIn: 'root' })
export class TeamsService extends ApiService {
  getTeams(params?: { search?: string }): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/teams`, { params: params as any });
  }

  getTeam(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/teams/${id}`);
  }

  createTeam(data: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/teams`, data);
  }

  updateTeam(id: string, data: Partial<Team>): Observable<Team> {
    return this.http.patch<Team>(`${this.baseUrl}/teams/${id}`, data);
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teams/${id}`);
  }

  addMember(teamId: string, userId: string, role?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/teams/${teamId}/members`, { userId, role });
  }

  removeMember(teamId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teams/${teamId}/members/${memberId}`);
  }
}
