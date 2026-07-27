import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardData } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  getDashboard(params?: { teamId?: string; cycleId?: string }): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`, {
      params: params as any,
    });
  }
}
