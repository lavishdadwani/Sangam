import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, FleetStats } from '../../../core/models/admin.model';

@Injectable({ providedIn: 'root' })
export class FleetService {
  constructor(private api: ApiService) {}

  getFleetStats(): Observable<FleetStats> {
    return this.api
      .get<ApiResponse<FleetStats>>('v1/admin/fleet')
      .pipe(map((res) => res.data));
  }
}
