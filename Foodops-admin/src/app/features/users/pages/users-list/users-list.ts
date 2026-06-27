import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
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
import { UsersService } from '../../services/users.service';
import { PlatformUser, UserStatus, Pagination } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users = signal<PlatformUser[]>([]);
  pagination = signal<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  isLoading = signal(true);
  error = signal('');

  displayedColumns = ['fullName', 'role', 'mobile', 'status', 'createdAt', 'actions'];

  searchControl = new FormControl('');
  roleControl = new FormControl('');
  statusControl = new FormControl('');

  roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'Customer' },
    { value: 'owner', label: 'Owner' },
    { value: 'deliveryBoy', label: 'Delivery Boy' },
  ];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'deactivated', label: 'Deactivated' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'banned', label: 'Banned' },
  ];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    // Debounce search input
    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadUsers(1));

    // Instant filter on role/status change
    this.roleControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsers(1));

    this.statusControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsers(1));

    this.loadUsers(1);
  }

  loadUsers(page: number): void {
    this.isLoading.set(true);
    this.error.set('');

    this.usersService.getUsers({
      search: this.searchControl.value ?? '',
      role: this.roleControl.value ?? '',
      status: this.statusControl.value ?? '',
      page,
      limit: this.pagination().limit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.users.set(data.users);
        this.pagination.set(data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, limit: event.pageSize }));
    this.loadUsers(event.pageIndex + 1);
  }

  setStatus(user: PlatformUser, status: UserStatus): void {
    this.usersService.updateUserStatus(user._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.users.update((list) =>
            list.map((u) => (u._id === updated._id ? { ...u, status: updated.status } : u))
          );
        },
        error: () => this.error.set('Failed to update user status.'),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
