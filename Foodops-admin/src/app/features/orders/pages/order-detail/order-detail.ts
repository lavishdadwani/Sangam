import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { AdminOrder, ShopOrder, OrderStatus } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css'],
})
export class OrderDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order = signal<AdminOrder | null>(null);
  isLoading = signal(true);
  error = signal('');
  actionError = signal('');

  reassignInputs: Record<string, FormControl> = {};

  statusOptions: OrderStatus[] = [
    'pending', 'preparing', 'awaiting pickup',
    'out for delivery', 'delivered', 'cancelled',
  ];

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.ordersService.getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order.set(order);
          order.shopOrders.forEach((so) => {
            this.reassignInputs[so._id] = new FormControl('');
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load order details.');
          this.isLoading.set(false);
        },
      });
  }

  forceCancel(): void {
    const o = this.order();
    if (!o) return;
    this.ordersService.forceCancel(o._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => this.order.set(updated),
        error: () => this.actionError.set('Failed to cancel order.'),
      });
  }

  updateStatus(shopOrder: ShopOrder, status: OrderStatus): void {
    const o = this.order();
    if (!o) return;
    this.ordersService.updateShopOrderStatus(o._id, shopOrder._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => this.order.set(updated),
        error: () => this.actionError.set('Failed to update status.'),
      });
  }

  reassignRider(shopOrder: ShopOrder): void {
    const o = this.order();
    const riderId = this.reassignInputs[shopOrder._id]?.value?.trim();
    if (!o || !riderId) return;
    this.ordersService.reassignRider(o._id, shopOrder._id, riderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.reassignInputs[shopOrder._id].reset();
          // Reload to show updated rider info
          this.ordersService.getOrderById(o._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: (updated) => this.order.set(updated) });
        },
        error: () => this.actionError.set('Failed to reassign rider.'),
      });
  }

  statusClass(status: string): string {
    return status.replace(/\s+/g, '-');
  }

  canCancel(order: AdminOrder): boolean {
    return order.shopOrders.some(
      (so) => so.status !== 'delivered' && so.status !== 'cancelled'
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
