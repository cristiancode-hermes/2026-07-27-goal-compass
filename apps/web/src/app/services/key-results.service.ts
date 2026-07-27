import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { KeyResult } from '../models';

@Injectable({ providedIn: 'root' })
export class KeyResultsService extends ApiService {
  getKeyResults(objectiveId: string): Observable<KeyResult[]> {
    return this.http.get<KeyResult[]>(`${this.baseUrl}/key-results`, {
      params: { objectiveId },
    });
  }

  getKeyResult(id: string): Observable<KeyResult> {
    return this.http.get<KeyResult>(`${this.baseUrl}/key-results/${id}`);
  }

  createKeyResult(data: Partial<KeyResult>): Observable<KeyResult> {
    return this.http.post<KeyResult>(`${this.baseUrl}/key-results`, data);
  }

  updateKeyResult(id: string, data: Partial<KeyResult>): Observable<KeyResult> {
    return this.http.patch<KeyResult>(`${this.baseUrl}/key-results/${id}`, data);
  }

  deleteKeyResult(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/key-results/${id}`);
  }
}
