import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, PlatformSettings, AdminProfile } from '../../../core/models/admin.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private api: ApiService) {}

  getSettings(): Observable<PlatformSettings> {
    return this.api.get<ApiResponse<PlatformSettings>>('v1/admin/settings')
      .pipe(map((r) => r.data));
  }

  updateSettings(payload: Partial<PlatformSettings>): Observable<PlatformSettings> {
    return this.api.put<ApiResponse<PlatformSettings>>('v1/admin/settings', payload)
      .pipe(map((r) => r.data));
  }

  getProfile(): Observable<AdminProfile> {
    return this.api.get<ApiResponse<AdminProfile>>('v1/admin/settings/profile')
      .pipe(map((r) => r.data));
  }

  updateProfile(fullName: string): Observable<AdminProfile> {
    return this.api.put<ApiResponse<AdminProfile>>('v1/admin/settings/profile', { fullName })
      .pipe(map((r) => r.data));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.api.put<ApiResponse<null>>('v1/admin/settings/change-password', {
      currentPassword,
      newPassword,
    }).pipe(map(() => void 0));
  }
}
