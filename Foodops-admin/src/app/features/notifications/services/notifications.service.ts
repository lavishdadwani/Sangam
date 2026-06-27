import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  NotificationRecord,
  NotificationTemplate,
  PaginatedNotifications,
  NotificationType,
  NotificationTarget,
} from '../../../core/models/admin.model';

export interface SendPayload {
  title: string;
  message: string;
  type: NotificationType;
  targetRole: NotificationTarget;
  targetUserId?: string;
  sendEmailFlag: boolean;
  scheduledAt?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  constructor(private api: ApiService) {}

  send(payload: SendPayload): Observable<NotificationRecord> {
    return this.api
      .post<ApiResponse<NotificationRecord>>('v1/admin/notifications/send', payload)
      .pipe(map((r) => r.data));
  }

  getHistory(status = '', page = 1, limit = 10): Observable<PaginatedNotifications> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (status) params = params.set('status', status);

    return this.api
      .get<ApiResponse<PaginatedNotifications>>('v1/admin/notifications/history', params)
      .pipe(map((r) => r.data));
  }

  getTemplates(): Observable<NotificationTemplate[]> {
    return this.api
      .get<ApiResponse<NotificationTemplate[]>>('v1/admin/notifications/templates')
      .pipe(map((r) => r.data));
  }

  createTemplate(payload: Omit<NotificationTemplate, '_id'>): Observable<NotificationTemplate> {
    return this.api
      .post<ApiResponse<NotificationTemplate>>('v1/admin/notifications/templates', payload)
      .pipe(map((r) => r.data));
  }

  deleteTemplate(id: string): Observable<void> {
    return this.api
      .delete<ApiResponse<null>>(`v1/admin/notifications/templates/${id}`)
      .pipe(map(() => void 0));
  }
}
