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
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { RestaurantsService } from '../../services/restaurants.service';
import { Restaurant, RestaurantStatus, Pagination } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-restaurants-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatMenuModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './restaurants-list.html',
  styleUrls: ['./restaurants-list.css'],
})
export class RestaurantsList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  restaurants = signal<Restaurant[]>([]);
  pagination = signal<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  isLoading = signal(true);
  error = signal('');

  displayedColumns = ['name', 'owner', 'city', 'status', 'createdAt', 'actions'];

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  cityControl   = new FormControl('');

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active',    label: 'Active' },
    { value: 'pending',   label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'rejected',  label: 'Rejected' },
  ];

  constructor(private restaurantsService: RestaurantsService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => this.load(1));

    this.cityControl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => this.load(1));

    this.statusControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load(1));

    this.load(1);
  }

  load(page: number): void {
    this.isLoading.set(true);
    this.error.set('');

    this.restaurantsService.getRestaurants({
      search: this.searchControl.value ?? '',
      status: this.statusControl.value ?? '',
      city:   this.cityControl.value ?? '',
      page,
      limit: this.pagination().limit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.restaurants.set(data.restaurants);
        this.pagination.set(data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load restaurants.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, limit: event.pageSize }));
    this.load(event.pageIndex + 1);
  }

  setStatus(restaurant: Restaurant, status: RestaurantStatus): void {
    this.restaurantsService.updateStatus(restaurant._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.restaurants.update((list) =>
            list.map((r) => (r._id === updated._id ? { ...r, status: updated.status } : r))
          );
        },
        error: () => this.error.set('Failed to update restaurant status.'),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
