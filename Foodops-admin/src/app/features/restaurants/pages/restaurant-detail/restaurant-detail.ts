import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';
import { RestaurantsService } from '../../services/restaurants.service';
import { Restaurant, MenuItem, RestaurantStats, RestaurantStatus } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatMenuModule,
  ],
  templateUrl: './restaurant-detail.html',
  styleUrls: ['./restaurant-detail.css'],
})
export class RestaurantDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  shop     = signal<Restaurant | null>(null);
  items    = signal<MenuItem[]>([]);
  stats    = signal<RestaurantStats | null>(null);
  isLoading = signal(true);
  error    = signal('');

  constructor(
    private route: ActivatedRoute,
    private restaurantsService: RestaurantsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('restaurantId')!;
    this.restaurantsService.getRestaurantById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ shop, items, stats }) => {
          this.shop.set(shop);
          this.items.set(items);
          this.stats.set(stats);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load restaurant details.');
          this.isLoading.set(false);
        },
      });
  }

  setStatus(status: RestaurantStatus): void {
    const s = this.shop();
    if (!s) return;
    this.restaurantsService.updateStatus(s._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (updated) => this.shop.set({ ...s, status: updated.status }) });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
