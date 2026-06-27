import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { AdminOrder, Pagination } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './orders-list.html',
  styleUrls: ['./orders-list.css'],
})
export class OrdersList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orders = signal<AdminOrder[]>([]);
  pagination = signal<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  isLoading = signal(true);
  error = signal('');

  displayedColumns = ['orderId', 'customer', 'amount', 'payment', 'shops', 'createdAt', 'actions'];

  searchControl        = new FormControl('');
  statusControl        = new FormControl('');
  paymentMethodControl = new FormControl('');
  paymentControl       = new FormControl('');

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending',           label: 'Pending' },
    { value: 'preparing',         label: 'Preparing' },
    { value: 'awaiting pickup',   label: 'Awaiting Pickup' },
    { value: 'out for delivery',  label: 'Out for Delivery' },
    { value: 'delivered',         label: 'Delivered' },
    { value: 'cancelled',         label: 'Cancelled' },
  ];

  methodOptions = [
    { value: '', label: 'All Methods' },
    { value: 'online', label: 'Online' },
    { value: 'cod',    label: 'COD' },
  ];

  paymentOptions = [
    { value: '',      label: 'All' },
    { value: 'true',  label: 'Paid' },
    { value: 'false', label: 'Unpaid' },
  ];

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => this.load(1));

    [this.statusControl, this.paymentMethodControl, this.paymentControl].forEach((ctrl) =>
      ctrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.load(1))
    );

    this.load(1);
  }

  load(page: number): void {
    this.isLoading.set(true);
    this.error.set('');

    this.ordersService.getOrders({
      status:        this.statusControl.value ?? '',
      paymentMethod: this.paymentMethodControl.value ?? '',
      payment:       this.paymentControl.value ?? '',
      search:        this.searchControl.value ?? '',
      page,
      limit: this.pagination().limit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.orders.set(data.orders);
        this.pagination.set(data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, limit: event.pageSize }));
    this.load(event.pageIndex + 1);
  }

  // Derive the "worst" status across all shopOrders to show a single badge
  overallStatus(order: AdminOrder): string {
    const priority = ['cancelled', 'pending', 'preparing', 'awaiting pickup', 'out for delivery', 'delivered'];
    const statuses = order.shopOrders.map((so) => so.status);
    for (const s of priority) {
      if (statuses.includes(s as any)) return s;
    }
    return statuses[0] ?? 'pending';
  }

  // Converts "out for delivery" → "out-for-delivery" for CSS class binding
  statusClass(status: string): string {
    return status.replace(/\s+/g, '-');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
