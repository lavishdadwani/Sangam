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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { RidersService } from '../../services/riders.service';
import { Rider, UserStatus, Pagination } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-riders-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatMenuModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './riders-list.html',
  styleUrls: ['./riders-list.css'],
})
export class RidersList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  riders = signal<Rider[]>([]);
  pagination = signal<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  isLoading = signal(true);
  error = signal('');

  displayedColumns = ['online', 'fullName', 'mobile', 'location', 'status', 'approved', 'actions'];

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  onlineControl = new FormControl('');

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'deactivated', label: 'Deactivated' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'banned', label: 'Banned' },
  ];

  onlineOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Online' },
    { value: 'false', label: 'Offline' },
  ];

  constructor(private ridersService: RidersService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => this.loadRiders(1));

    this.statusControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadRiders(1));

    this.onlineControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadRiders(1));

    this.loadRiders(1);
  }

  loadRiders(page: number): void {
    this.isLoading.set(true);
    this.error.set('');

    this.ridersService.getRiders({
      search: this.searchControl.value ?? '',
      status: this.statusControl.value ?? '',
      isOnline: this.onlineControl.value ?? '',
      page,
      limit: this.pagination().limit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.riders.set(data.riders);
        this.pagination.set(data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load riders.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, limit: event.pageSize }));
    this.loadRiders(event.pageIndex + 1);
  }

  setStatus(rider: Rider, status: UserStatus): void {
    this.ridersService.updateRiderStatus(rider._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => this.patchRider(updated),
        error: () => this.error.set('Failed to update rider status.'),
      });
  }

  toggleApproval(rider: Rider): void {
    this.ridersService.approveRider(rider._id, !rider.isApproved)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => this.patchRider(updated),
        error: () => this.error.set('Failed to update rider approval.'),
      });
  }

  private patchRider(updated: Rider): void {
    this.riders.update((list) =>
      list.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
