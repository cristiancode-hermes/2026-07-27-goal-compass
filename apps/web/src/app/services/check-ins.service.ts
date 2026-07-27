import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CheckIn } from '../models';

@Injectable({ providedIn: 'root' })
export class CheckInsService extends ApiService {
  getCheckIns(keyResultId: string): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(`${this.baseUrl}/check-ins`, {
      params: { keyResultId },
    });
  }

  createCheckIn(data: Partial<CheckIn>): Observable<CheckIn> {
    return this.http.post<CheckIn>(`${this.baseUrl}/check-ins`, data);
  }

  deleteCheckIn(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/check-ins/${id}`);
  }
}
