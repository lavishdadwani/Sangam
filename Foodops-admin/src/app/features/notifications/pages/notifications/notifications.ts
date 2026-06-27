import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NotificationsService } from '../../services/notifications.service';
import {
  NotificationRecord,
  NotificationTemplate,
  NotificationType,
  NotificationTarget,
  Pagination,
} from '../../../../core/models/admin.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, MatTableModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class Notifications implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ── Send form ─────────────────────────────────────────────────────────────
  sendForm!: FormGroup;
  sending = signal(false);

  // ── Templates ─────────────────────────────────────────────────────────────
  templates        = signal<NotificationTemplate[]>([]);
  templateForm!:   FormGroup;
  savingTemplate   = signal(false);
  templatesLoading = signal(true);

  // ── History ───────────────────────────────────────────────────────────────
  history     = signal<NotificationRecord[]>([]);
  pagination  = signal<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  historyLoading = signal(true);
  historyColumns = ['title', 'target', 'type', 'status', 'recipients', 'sentAt', 'sentBy'];

  typeOptions: { value: NotificationType; label: string }[] = [
    { value: 'info',      label: 'Info' },
    { value: 'warning',   label: 'Warning' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'system',    label: 'System' },
  ];

  targetOptions: { value: NotificationTarget; label: string }[] = [
    { value: 'all',          label: 'All Users' },
    { value: 'user',         label: 'Customers Only' },
    { value: 'owner',        label: 'Restaurant Owners Only' },
    { value: 'deliveryBoy',  label: 'Delivery Boys Only' },
    { value: 'specific',     label: 'Specific User (by ID)' },
  ];

  constructor(
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadTemplates();
    this.loadHistory(1);
  }

  private buildForms(): void {
    this.sendForm = this.fb.group({
      title:         ['', [Validators.required, Validators.minLength(3)]],
      message:       ['', [Validators.required, Validators.minLength(5)]],
      type:          ['info', Validators.required],
      targetRole:    ['all', Validators.required],
      targetUserId:  [''],
      sendEmailFlag: [false],
      scheduleEnabled: [false],
      scheduledAt:   [''],
    });

    this.templateForm = this.fb.group({
      name:    ['', Validators.required],
      title:   ['', Validators.required],
      message: ['', Validators.required],
      type:    ['info', Validators.required],
    });
  }

  get targetRole() { return this.sendForm.get('targetRole')?.value; }
  get scheduleEnabled() { return this.sendForm.get('scheduleEnabled')?.value; }

  // ── Apply template to send form ───────────────────────────────────────────
  useTemplate(t: NotificationTemplate): void {
    this.sendForm.patchValue({ title: t.title, message: t.message, type: t.type });
    this.toast(`Template "${t.name}" applied`);
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  send(): void {
    if (this.sendForm.invalid) return;
    this.sending.set(true);

    const v = this.sendForm.value;
    this.notificationsService.send({
      title:         v.title,
      message:       v.message,
      type:          v.type,
      targetRole:    v.targetRole,
      targetUserId:  v.targetRole === 'specific' ? v.targetUserId : undefined,
      sendEmailFlag: v.sendEmailFlag,
      scheduledAt:   v.scheduleEnabled && v.scheduledAt ? v.scheduledAt : undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (n) => {
        this.sending.set(false);
        const msg = n.status === 'scheduled'
          ? 'Notification scheduled'
          : `Notification sent to ${n.recipientCount} recipient(s)`;
        this.toast(msg);
        this.sendForm.reset({ type: 'info', targetRole: 'all', sendEmailFlag: false, scheduleEnabled: false });
        this.loadHistory(1);
      },
      error: (e) => {
        this.sending.set(false);
        this.toast(e?.error?.message ?? 'Failed to send notification', true);
      },
    });
  }

  // ── Templates ─────────────────────────────────────────────────────────────
  private loadTemplates(): void {
    this.notificationsService.getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (t) => { this.templates.set(t); this.templatesLoading.set(false); },
        error: () => this.templatesLoading.set(false),
      });
  }

  saveTemplate(): void {
    if (this.templateForm.invalid) return;
    this.savingTemplate.set(true);

    this.notificationsService.createTemplate(this.templateForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (t) => {
          this.templates.update((list) => [t, ...list]);
          this.templateForm.reset({ type: 'info' });
          this.savingTemplate.set(false);
          this.toast('Template saved');
        },
        error: (e) => {
          this.savingTemplate.set(false);
          this.toast(e?.error?.message ?? 'Failed to save template', true);
        },
      });
  }

  deleteTemplate(id: string): void {
    this.notificationsService.deleteTemplate(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.templates.update((list) => list.filter((t) => t._id !== id));
          this.toast('Template deleted');
        },
        error: () => this.toast('Failed to delete template', true),
      });
  }

  // ── History ───────────────────────────────────────────────────────────────
  loadHistory(page: number): void {
    this.historyLoading.set(true);
    this.notificationsService.getHistory('', page, this.pagination().limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.history.set(data.notifications);
          this.pagination.set(data.pagination);
          this.historyLoading.set(false);
        },
        error: () => this.historyLoading.set(false),
      });
  }

  onPageChange(e: PageEvent): void {
    this.pagination.update((p) => ({ ...p, limit: e.pageSize }));
    this.loadHistory(e.pageIndex + 1);
  }

  private toast(msg: string, isError = false): void {
    this.snack.open(msg, 'Close', {
      duration: 3500,
      panelClass: isError ? ['snack-error'] : ['snack-success'],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
