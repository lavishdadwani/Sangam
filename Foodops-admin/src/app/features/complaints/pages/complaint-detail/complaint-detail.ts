import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ComplaintsService } from '../../services/complaints.service';
import { Complaint, AdminStaff, ComplaintStatus } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-complaint-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
  ],
  templateUrl: './complaint-detail.html',
  styleUrls: ['./complaint-detail.css'],
})
export class ComplaintDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  complaint  = signal<Complaint | null>(null);
  adminList  = signal<AdminStaff[]>([]);
  isLoading  = signal(true);
  error      = signal('');

  assignControl     = new FormControl('');
  statusControl     = new FormControl<ComplaintStatus>('open');
  resolutionControl = new FormControl('', Validators.required);

  assigning  = signal(false);
  updatingStatus = signal(false);
  resolving  = signal(false);

  statusOptions: { value: ComplaintStatus; label: string }[] = [
    { value: 'open',        label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved',    label: 'Resolved' },
    { value: 'closed',      label: 'Closed' },
  ];

  constructor(
    private route: ActivatedRoute,
    private complaintsService: ComplaintsService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('complaintId')!;
    this.loadComplaint(id);
    this.loadAdmins();
  }

  private loadComplaint(id: string): void {
    this.complaintsService.getComplaintById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (c) => {
          this.complaint.set(c);
          this.statusControl.setValue(c.status);
          if (c.assignedTo) this.assignControl.setValue(c.assignedTo._id);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load complaint.');
          this.isLoading.set(false);
        },
      });
  }

  private loadAdmins(): void {
    this.complaintsService.getAdminList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (list) => this.adminList.set(list) });
  }

  assign(): void {
    const adminId = this.assignControl.value;
    const c = this.complaint();
    if (!adminId || !c) return;

    this.assigning.set(true);
    this.complaintsService.assign(c._id, adminId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.complaint.update((prev) => prev
            ? { ...prev, assignedTo: data.assignedTo ?? prev.assignedTo, status: data.status ?? prev.status }
            : prev
          );
          this.statusControl.setValue(this.complaint()!.status);
          this.assigning.set(false);
          this.toast('Complaint assigned');
        },
        error: (e) => { this.assigning.set(false); this.toast(e?.error?.message ?? 'Failed to assign', true); },
      });
  }

  updateStatus(): void {
    const status = this.statusControl.value;
    const c = this.complaint();
    if (!status || !c || status === c.status) return;

    this.updatingStatus.set(true);
    this.complaintsService.updateStatus(c._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.complaint.update((p) => p ? { ...p, status: data.status } : p);
          this.updatingStatus.set(false);
          this.toast('Status updated');
        },
        error: (e) => { this.updatingStatus.set(false); this.toast(e?.error?.message ?? 'Failed to update', true); },
      });
  }

  resolve(): void {
    const resolution = this.resolutionControl.value?.trim();
    const c = this.complaint();
    if (!resolution || !c) return;

    this.resolving.set(true);
    this.complaintsService.resolve(c._id, resolution)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.complaint.set(updated);
          this.statusControl.setValue(updated.status);
          this.resolving.set(false);
          this.toast('Complaint resolved');
        },
        error: (e) => { this.resolving.set(false); this.toast(e?.error?.message ?? 'Failed to resolve', true); },
      });
  }

  private toast(msg: string, isError = false): void {
    this.snack.open(msg, 'Close', {
      duration: 3000,
      panelClass: isError ? ['snack-error'] : ['snack-success'],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
