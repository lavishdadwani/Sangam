import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PaginatedRiders,
  Rider,
  RiderStats,
  UserStatus,
} from '../../../core/models/admin.model';

export interface RiderFilters {
  search?: string;
  status?: string;
  isOnline?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class RidersService {
  constructor(private api: ApiService) {}

  getRiders(filters: RiderFilters = {}): Observable<PaginatedRiders> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.isOnline !== undefined && filters.isOnline !== '')
      params = params.set('isOnline', filters.isOnline);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    return this.api
      .get<ApiResponse<PaginatedRiders>>('v1/admin/riders', params)
      .pipe(map((res) => res.data));
  }

  getRiderById(riderId: string): Observable<{ rider: Rider; stats: RiderStats }> {
    return this.api
      .get<ApiResponse<{ rider: Rider; stats: RiderStats }>>(`v1/admin/riders/${riderId}`)
      .pipe(map((res) => res.data));
  }

  updateRiderStatus(riderId: string, status: UserStatus): Observable<Rider> {
    return this.api
      .patch<ApiResponse<Rider>>(`v1/admin/riders/${riderId}/status`, { status })
      .pipe(map((res) => res.data));
  }

  approveRider(riderId: string, isApproved: boolean): Observable<Rider> {
    return this.api
      .patch<ApiResponse<Rider>>(`v1/admin/riders/${riderId}/approve`, { isApproved })
      .pipe(map((res) => res.data));
  }
}
