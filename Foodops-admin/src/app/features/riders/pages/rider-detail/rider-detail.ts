import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';
import { RidersService } from '../../services/riders.service';
import { Rider, RiderStats, UserStatus } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-rider-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatMenuModule,
  ],
  templateUrl: './rider-detail.html',
  styleUrls: ['./rider-detail.css'],
})
export class RiderDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  rider = signal<Rider | null>(null);
  stats = signal<RiderStats | null>(null);
  isLoading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private ridersService: RidersService
  ) {}

  ngOnInit(): void {
    const riderId = this.route.snapshot.paramMap.get('riderId')!;
    this.ridersService.getRiderById(riderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ rider, stats }) => {
          this.rider.set(rider);
          this.stats.set(stats);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load rider details.');
          this.isLoading.set(false);
        },
      });
  }

  setStatus(status: UserStatus): void {
    const r = this.rider();
    if (!r) return;
    this.ridersService.updateRiderStatus(r._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (updated) => this.rider.set({ ...r, ...updated }) });
  }

  toggleApproval(): void {
    const r = this.rider();
    if (!r) return;
    this.ridersService.approveRider(r._id, !r.isApproved)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (updated) => this.rider.set({ ...r, ...updated }) });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
