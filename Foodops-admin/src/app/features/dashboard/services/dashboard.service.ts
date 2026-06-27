import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, DashboardStats } from '../../../core/models/admin.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api
      .get<ApiResponse<DashboardStats>>('v1/admin/stats')
      .pipe(map((res) => res.data));
  }
}
