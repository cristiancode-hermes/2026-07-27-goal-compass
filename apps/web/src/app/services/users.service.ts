import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService extends ApiService {
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/search`, {
      params: { q: query },
    });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }
}
