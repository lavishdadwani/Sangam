import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PaginatedRestaurants,
  Restaurant,
  MenuItem,
  RestaurantStats,
  RestaurantStatus,
} from '../../../core/models/admin.model';

export interface RestaurantFilters {
  search?: string;
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class RestaurantsService {
  constructor(private api: ApiService) {}

  getRestaurants(filters: RestaurantFilters = {}): Observable<PaginatedRestaurants> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.city)   params = params.set('city', filters.city);
    if (filters.page)   params = params.set('page', String(filters.page));
    if (filters.limit)  params = params.set('limit', String(filters.limit));

    return this.api
      .get<ApiResponse<PaginatedRestaurants>>('v1/admin/restaurants', params)
      .pipe(map((res) => res.data));
  }

  getRestaurantById(id: string): Observable<{ shop: Restaurant; items: MenuItem[]; stats: RestaurantStats }> {
    return this.api
      .get<ApiResponse<{ shop: Restaurant; items: MenuItem[]; stats: RestaurantStats }>>(`v1/admin/restaurants/${id}`)
      .pipe(map((res) => res.data));
  }

  updateStatus(id: string, status: RestaurantStatus): Observable<Restaurant> {
    return this.api
      .patch<ApiResponse<Restaurant>>(`v1/admin/restaurants/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
