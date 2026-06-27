import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, AdminOrder, PaginatedOrders, OrderStatus } from '../../../core/models/admin.model';

export interface OrderFilters {
  status?: string;
  paymentMethod?: string;
  payment?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private api: ApiService) {}

  getOrders(filters: OrderFilters = {}): Observable<PaginatedOrders> {
    let params = new HttpParams();
    if (filters.status)        params = params.set('status', filters.status);
    if (filters.paymentMethod) params = params.set('paymentMethod', filters.paymentMethod);
    if (filters.payment)       params = params.set('payment', filters.payment);
    if (filters.search)        params = params.set('search', filters.search);
    if (filters.page)          params = params.set('page', String(filters.page));
    if (filters.limit)         params = params.set('limit', String(filters.limit));

    return this.api
      .get<ApiResponse<PaginatedOrders>>('v1/admin/orders', params)
      .pipe(map((res) => res.data));
  }

  getOrderById(orderId: string): Observable<AdminOrder> {
    return this.api
      .get<ApiResponse<AdminOrder>>(`v1/admin/orders/${orderId}`)
      .pipe(map((res) => res.data));
  }

  forceCancel(orderId: string): Observable<AdminOrder> {
    return this.api
      .patch<ApiResponse<AdminOrder>>(`v1/admin/orders/${orderId}/cancel`, {})
      .pipe(map((res) => res.data));
  }

  updateShopOrderStatus(orderId: string, shopOrderId: string, status: OrderStatus): Observable<AdminOrder> {
    return this.api
      .patch<ApiResponse<AdminOrder>>(
        `v1/admin/orders/${orderId}/shop-orders/${shopOrderId}/status`,
        { status }
      )
      .pipe(map((res) => res.data));
  }

  reassignRider(orderId: string, shopOrderId: string, riderId: string): Observable<{ riderId: string; riderName: string }> {
    return this.api
      .patch<ApiResponse<{ riderId: string; riderName: string }>>(
        `v1/admin/orders/${orderId}/shop-orders/${shopOrderId}/reassign`,
        { riderId }
      )
      .pipe(map((res) => res.data));
  }
}
