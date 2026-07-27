import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cycle } from '../models';

@Injectable({ providedIn: 'root' })
export class CyclesService extends ApiService {
  getCycles(params?: { teamId?: string; status?: string }): Observable<Cycle[]> {
    return this.http.get<Cycle[]>(`${this.baseUrl}/cycles`, { params: params as any });
  }

  getCycle(id: string): Observable<Cycle> {
    return this.http.get<Cycle>(`${this.baseUrl}/cycles/${id}`);
  }

  createCycle(data: Partial<Cycle>): Observable<Cycle> {
    return this.http.post<Cycle>(`${this.baseUrl}/cycles`, data);
  }

  updateCycle(id: string, data: Partial<Cycle>): Observable<Cycle> {
    return this.http.patch<Cycle>(`${this.baseUrl}/cycles/${id}`, data);
  }

  deleteCycle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cycles/${id}`);
  }
}
