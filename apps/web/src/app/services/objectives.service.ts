import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Objective } from '../models';

@Injectable({ providedIn: 'root' })
export class ObjectivesService extends ApiService {
  getObjectives(params?: {
    teamId?: string;
    cycleId?: string;
    status?: string;
    search?: string;
    type?: string;
  }): Observable<Objective[]> {
    return this.http.get<Objective[]>(`${this.baseUrl}/objectives`, { params: params as any });
  }

  getObjective(id: string): Observable<Objective> {
    return this.http.get<Objective>(`${this.baseUrl}/objectives/${id}`);
  }

  createObjective(data: Partial<Objective>): Observable<Objective> {
    return this.http.post<Objective>(`${this.baseUrl}/objectives`, data);
  }

  updateObjective(id: string, data: Partial<Objective>): Observable<Objective> {
    return this.http.patch<Objective>(`${this.baseUrl}/objectives/${id}`, data);
  }

  deleteObjective(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/objectives/${id}`);
  }
}
