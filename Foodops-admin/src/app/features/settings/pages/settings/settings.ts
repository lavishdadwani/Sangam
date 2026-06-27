import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PlatformSettings, AdminProfile } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatSnackBarModule, MatProgressSpinnerModule,
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  profile    = signal<AdminProfile | null>(null);
  isSuperAdmin = signal(false);

  profileForm!:  FormGroup;
  passwordForm!: FormGroup;
  platformForm!: FormGroup;

  profileSaving  = signal(false);
  passwordSaving = signal(false);
  platformSaving = signal(false);
  platformLoading = signal(true);

  hideCurrentPw = true;
  hideNewPw     = true;
  hideConfirmPw = true;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadProfile();
    this.loadPlatformSettings();
  }

  private buildForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword:     ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );

    this.platformForm = this.fb.group({
      deliveryBase:      [30, [Validators.required, Validators.min(0)]],
      deliveryPerKm:     [5,  [Validators.required, Validators.min(0)]],
      deliveryFreeAbove: [500,[Validators.required, Validators.min(0)]],
      commission:        [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      gst:               [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      minOrderAmount:    [100,[Validators.required, Validators.min(0)]],
      maxDeliveryRadius: [20, [Validators.required, Validators.min(1)]],
      emailEnabled:      [true],
    });
  }

  private passwordsMatch(g: AbstractControl) {
    const nw = g.get('newPassword')?.value;
    const cf = g.get('confirmPassword')?.value;
    return nw === cf ? null : { mismatch: true };
  }

  private loadProfile(): void {
    this.settingsService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          this.profile.set(p);
          this.isSuperAdmin.set(p.role === 'superadmin');
          this.profileForm.patchValue({ fullName: p.fullName });
        },
      });
  }

  private loadPlatformSettings(): void {
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (s) => {
          this.platformForm.patchValue({
            deliveryBase:      s.deliveryCharge.base,
            deliveryPerKm:     s.deliveryCharge.perKm,
            deliveryFreeAbove: s.deliveryCharge.freeAbove,
            commission:        s.commission.percentage,
            gst:               s.tax.gst,
            minOrderAmount:    s.order.minOrderAmount,
            maxDeliveryRadius: s.order.maxDeliveryRadiusKm,
            emailEnabled:      s.notifications.emailEnabled,
          });
          this.platformLoading.set(false);
        },
        error: () => this.platformLoading.set(false),
      });
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileSaving.set(true);

    this.settingsService.updateProfile(this.profileForm.value.fullName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.profile.set(updated);
          this.authService.currentAdmin.set({
            _id: updated._id,
            fullName: updated.fullName,
            email: updated.email,
            role: updated.role,
          });
          this.profileSaving.set(false);
          this.toast('Profile updated');
        },
        error: (err) => {
          this.profileSaving.set(false);
          this.toast(err?.error?.message ?? 'Failed to update profile', true);
        },
      });
  }

  // ── Password ───────────────────────────────────────────────────────────────

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    this.passwordSaving.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.settingsService.changePassword(currentPassword, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.passwordSaving.set(false);
          this.passwordForm.reset();
          this.toast('Password changed successfully');
        },
        error: (err) => {
          this.passwordSaving.set(false);
          this.toast(err?.error?.message ?? 'Failed to change password', true);
        },
      });
  }

  // ── Platform settings ──────────────────────────────────────────────────────

  savePlatformSettings(): void {
    if (this.platformForm.invalid) return;
    this.platformSaving.set(true);

    const v = this.platformForm.value;
    const payload: Partial<PlatformSettings> = {
      deliveryCharge: { base: v.deliveryBase, perKm: v.deliveryPerKm, freeAbove: v.deliveryFreeAbove },
      commission:     { percentage: v.commission },
      tax:            { gst: v.gst },
      order:          { minOrderAmount: v.minOrderAmount, maxDeliveryRadiusKm: v.maxDeliveryRadius },
      notifications:  { emailEnabled: v.emailEnabled },
    };

    this.settingsService.updateSettings(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.platformSaving.set(false);
          this.toast('Platform settings saved');
        },
        error: (err) => {
          this.platformSaving.set(false);
          this.toast(err?.error?.message ?? 'Failed to save settings', true);
        },
      });
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
