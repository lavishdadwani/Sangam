import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../../../core/models/admin.model';

interface StatCard {
  label: string;
  value: number;
  prefix?: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  stats = signal<DashboardStats | null>(null);
  cards = signal<StatCard[]>([]);
  isLoading = signal(true);
  error = signal('');

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.cards.set(this.buildCards(data));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard stats. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  private buildCards(s: DashboardStats): StatCard[] {
    return [
      { label: 'Total Customers', value: s.users.total, icon: 'people', color: '#4f46e5' },
      { label: 'Restaurants', value: s.shops.total, icon: 'store', color: '#0891b2' },
      { label: 'Delivery Boys', value: s.users.deliveryBoys, icon: 'delivery_dining', color: '#059669' },
      { label: 'Total Orders', value: s.orders.total, icon: 'receipt_long', color: '#d97706' },
      { label: "Today's Orders", value: s.orders.today, icon: 'today', color: '#7c3aed' },
      { label: 'Pending Orders', value: s.orders.pending, icon: 'pending_actions', color: '#dc2626' },
      { label: 'Total Revenue', value: s.revenue.total, prefix: '₹', icon: 'currency_rupee', color: '#16a34a' },
      { label: 'Owners', value: s.users.owners, icon: 'storefront', color: '#ea580c' },
    ];
  }
}
