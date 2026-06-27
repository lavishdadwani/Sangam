import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, AnalyticsData } from '../../../core/models/admin.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  getAnalytics(days: number): Observable<AnalyticsData> {
    const params = new HttpParams().set('days', String(days));
    return this.api
      .get<ApiResponse<AnalyticsData>>('v1/admin/analytics', params)
      .pipe(map((res) => res.data));
  }
}
