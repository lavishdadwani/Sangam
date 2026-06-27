import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PaginatedUsers,
  PlatformUser,
  UserStatus,
} from '../../../core/models/admin.model';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  getUsers(filters: UserFilters = {}): Observable<PaginatedUsers> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    return this.api
      .get<ApiResponse<PaginatedUsers>>('v1/admin/users', params)
      .pipe(map((res) => res.data));
  }

  updateUserStatus(userId: string, status: UserStatus): Observable<PlatformUser> {
    return this.api
      .patch<ApiResponse<PlatformUser>>(`v1/admin/users/${userId}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
