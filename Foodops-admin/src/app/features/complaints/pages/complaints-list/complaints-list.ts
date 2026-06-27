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
import { ComplaintsService } from '../../services/complaints.service';
import { Complaint, Pagination } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './complaints-list.html',
  styleUrls: ['./complaints-list.css'],
})
export class ComplaintsList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  complaints = signal<Complaint[]>([]);
  pagination = signal<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  isLoading  = signal(true);
  error      = signal('');

  displayedColumns = ['title', 'raisedBy', 'category', 'status', 'assignedTo', 'createdAt', 'actions'];

  searchControl   = new FormControl('');
  statusControl   = new FormControl('');
  categoryControl = new FormControl('');

  statusOptions = [
    { value: '',            label: 'All Statuses' },
    { value: 'open',        label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved',    label: 'Resolved' },
    { value: 'closed',      label: 'Closed' },
  ];

  categoryOptions = [
    { value: '',           label: 'All Categories' },
    { value: 'order',      label: 'Order' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'rider',      label: 'Rider' },
    { value: 'payment',    label: 'Payment' },
    { value: 'other',      label: 'Other' },
  ];

  constructor(private complaintsService: ComplaintsService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => this.load(1));

    [this.statusControl, this.categoryControl].forEach((c) =>
      c.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.load(1))
    );

    this.load(1);
  }

  load(page: number): void {
    this.isLoading.set(true);
    this.error.set('');

    this.complaintsService.getComplaints({
      status:   this.statusControl.value   ?? '',
      category: this.categoryControl.value ?? '',
      search:   this.searchControl.value   ?? '',
      page,
      limit: this.pagination().limit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.complaints.set(data.complaints);
        this.pagination.set(data.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load complaints.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(e: PageEvent): void {
    this.pagination.update((p) => ({ ...p, limit: e.pageSize }));
    this.load(e.pageIndex + 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
