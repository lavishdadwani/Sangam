import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  Complaint,
  PaginatedComplaints,
  AdminStaff,
  ComplaintStatus,
} from '../../../core/models/admin.model';

export interface ComplaintFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  constructor(private api: ApiService) {}

  getComplaints(filters: ComplaintFilters = {}): Observable<PaginatedComplaints> {
    let params = new HttpParams();
    if (filters.status)   params = params.set('status',   filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search)   params = params.set('search',   filters.search);
    if (filters.page)     params = params.set('page',     String(filters.page));
    if (filters.limit)    params = params.set('limit',    String(filters.limit));

    return this.api
      .get<ApiResponse<PaginatedComplaints>>('v1/admin/complaints', params)
      .pipe(map((r) => r.data));
  }

  getComplaintById(id: string): Observable<Complaint> {
    return this.api
      .get<ApiResponse<Complaint>>(`v1/admin/complaints/${id}`)
      .pipe(map((r) => r.data));
  }

  getAdminList(): Observable<AdminStaff[]> {
    return this.api
      .get<ApiResponse<AdminStaff[]>>('v1/admin/complaints/admins')
      .pipe(map((r) => r.data));
  }

  assign(complaintId: string, adminId: string): Observable<Partial<Complaint>> {
    return this.api
      .patch<ApiResponse<Partial<Complaint>>>(`v1/admin/complaints/${complaintId}/assign`, { adminId })
      .pipe(map((r) => r.data));
  }

  updateStatus(complaintId: string, status: ComplaintStatus): Observable<{ status: ComplaintStatus }> {
    return this.api
      .patch<ApiResponse<{ status: ComplaintStatus }>>(`v1/admin/complaints/${complaintId}/status`, { status })
      .pipe(map((r) => r.data));
  }

  resolve(complaintId: string, resolution: string): Observable<Complaint> {
    return this.api
      .patch<ApiResponse<Complaint>>(`v1/admin/complaints/${complaintId}/resolve`, { resolution })
      .pipe(map((r) => r.data));
  }
}
