import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Initiative } from '../models';

@Injectable({ providedIn: 'root' })
export class InitiativesService extends ApiService {
  getInitiatives(keyResultId: string): Observable<Initiative[]> {
    return this.http.get<Initiative[]>(`${this.baseUrl}/initiatives`, {
      params: { keyResultId },
    });
  }

  createInitiative(data: Partial<Initiative>): Observable<Initiative> {
    return this.http.post<Initiative>(`${this.baseUrl}/initiatives`, data);
  }

  updateInitiative(id: string, data: Partial<Initiative>): Observable<Initiative> {
    return this.http.patch<Initiative>(`${this.baseUrl}/initiatives/${id}`, data);
  }

  deleteInitiative(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/initiatives/${id}`);
  }
}
